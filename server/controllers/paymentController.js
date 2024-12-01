const db = require('../config/database');
const invoiceController = require('./invoiceController');
const notificationController = require('./notificationController');

const paymentController = {
  processPayment: async (req, res) => {
    const connection = await db.getConnection();
    
    try {
      const { propertyId } = req.params;
      const userId = req.user.id;

      await connection.beginTransaction();

      // Verificar que la propiedad existe y está disponible
      const [properties] = await connection.execute(
        `SELECT p.*, u.email as seller_email, u.name as seller_name 
         FROM properties p 
         JOIN users u ON p.user_id = u.id 
         WHERE p.id = ? AND p.status = "for_rent"`,
        [propertyId]
      );

      if (properties.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Propiedad no disponible' });
      }

      const property = properties[0];

      // Cambiar el estado de la propiedad a rentada
      await connection.execute(
        'UPDATE properties SET status = "rented" WHERE id = ?',
        [propertyId]
      );

      // Generar número de factura único
      const invoiceNumber = `INV-${Date.now()}-${propertyId}`;

      // Registrar el pago
      const [paymentResult] = await connection.execute(
        `INSERT INTO payments (
          property_id, 
          user_id, 
          amount,
          payment_date,
          payment_type,
          status,
          invoice_number
        ) VALUES (?, ?, ?, NOW(), 'rent', 'completed', ?)`,
        [propertyId, userId, property.price, invoiceNumber]
      );

      // Notificar al comprador/arrendatario
      await notificationController.createNotification(
        userId,
        'payment_success',
        `Tu pago por ${property.title} ha sido procesado exitosamente. Factura: ${invoiceNumber}`,
        paymentResult.insertId
      );

      // Notificar al vendedor
      await notificationController.createNotification(
        property.user_id,
        'payment_received',
        `Has recibido un pago por tu propiedad ${property.title}. Factura: ${invoiceNumber}`,
        paymentResult.insertId
      );

      await connection.commit();

      res.json({ 
        success: true,
        message: 'Pago procesado exitosamente',
        payment: {
          id: paymentResult.insertId,
          amount: property.price,
          date: new Date(),
          invoice_number: invoiceNumber,
          property: property
        }
      });

    } catch (error) {
      await connection.rollback();
      console.error('Error al procesar el pago:', error);
      res.status(500).json({ error: 'Error al procesar el pago' });
    } finally {
      connection.release();
    }
  },

  getPaymentHistory: async (req, res) => {
    try {
      const [payments] = await db.execute(
        `SELECT 
          p.*,
          pr.title as property_title,
          pr.location as property_location,
          u.name as user_name,
          s.name as seller_name
        FROM payments p
        JOIN properties pr ON p.property_id = pr.id
        JOIN users u ON p.user_id = u.id
        JOIN users s ON pr.user_id = s.id
        WHERE p.user_id = ? OR pr.user_id = ?
        ORDER BY p.payment_date DESC`,
        [req.user.id, req.user.id]
      );

      // Formatear las fechas y agregar información adicional
      const formattedPayments = payments.map(payment => ({
        ...payment,
        payment_date: new Date(payment.payment_date).toISOString(),
        isReceived: payment.user_id !== req.user.id,
        formattedAmount: new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP'
        }).format(payment.amount)
      }));
      
      res.json(formattedPayments);
    } catch (error) {
      console.error('Error al obtener el historial de pagos:', error);
      res.status(500).json({ error: 'Error al obtener el historial de pagos' });
    }
  },

  getPaymentDetails: async (req, res) => {
    try {
      const { paymentId } = req.params;
      
      const [payments] = await db.execute(
        `SELECT 
          p.*,
          pr.title as property_title,
          pr.location as property_location,
          u.name as user_name,
          u.email as user_email,
          u.phone as user_phone,
          s.name as seller_name,
          s.email as seller_email
        FROM payments p
        JOIN properties pr ON p.property_id = pr.id
        JOIN users u ON p.user_id = u.id
        JOIN users s ON pr.user_id = s.id
        WHERE p.id = ? AND (p.user_id = ? OR pr.user_id = ?)`,
        [paymentId, req.user.id, req.user.id]
      );

      if (payments.length === 0) {
        return res.status(404).json({ error: 'Pago no encontrado' });
      }

      const paymentDetails = {
        ...payments[0],
        payment_date: new Date(payments[0].payment_date).toISOString(),
        formattedAmount: new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP'
        }).format(payments[0].amount)
      };

      res.json(paymentDetails);
    } catch (error) {
      console.error('Error al obtener los detalles del pago:', error);
      res.status(500).json({ error: 'Error al obtener los detalles del pago' });
    }
  },

  cancelPayment: async (req, res) => {
    const connection = await db.getConnection();

    try {
      const { paymentId } = req.params;
      
      await connection.beginTransaction();

      // Verificar que el pago existe y pertenece al usuario
      const [payments] = await connection.execute(
        'SELECT * FROM payments WHERE id = ? AND user_id = ? AND status != "cancelled"',
        [paymentId, req.user.id]
      );

      if (payments.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Pago no encontrado o ya cancelado' });
      }

      const payment = payments[0];

      // Actualizar el estado del pago
      await connection.execute(
        'UPDATE payments SET status = "cancelled", cancelled_at = NOW() WHERE id = ?',
        [paymentId]
      );

      // Devolver la propiedad a disponible
      await connection.execute(
        'UPDATE properties SET status = "for_rent" WHERE id = ?',
        [payment.property_id]
      );

      // Notificar a ambas partes
      await notificationController.createNotification(
        payment.user_id,
        'payment_cancelled',
        'Tu pago ha sido cancelado',
        paymentId
      );

      const [property] = await connection.execute(
        'SELECT user_id FROM properties WHERE id = ?',
        [payment.property_id]
      );

      await notificationController.createNotification(
        property[0].user_id,
        'payment_cancelled',
        'Un pago ha sido cancelado',
        paymentId
      );

      await connection.commit();
      res.json({ message: 'Pago cancelado exitosamente' });
    } catch (error) {
      await connection.rollback();
      console.error('Error al cancelar el pago:', error);
      res.status(500).json({ error: 'Error al cancelar el pago' });
    } finally {
      connection.release();
    }
  }
};

module.exports = paymentController;
// Path: server/controllers/invoiceController.js

const PDFDocument = require('pdfkit');
const db = require('../config/database');

const invoiceController = {
  generateInvoice: async (paymentId) => {
    try {
      // Obtener los datos de la transacción
      const [payment] = await db.execute(
        `SELECT p.*, pr.title as property_title, u.name as user_name, u.address as user_address
         FROM payments p
         JOIN properties pr ON p.property_id = pr.id
         JOIN users u ON p.user_id = u.id
         WHERE p.id = ?`,
        [paymentId]
      );

      if (payment.length === 0) {
        throw new Error('Pago no encontrado');
      }

      const paymentData = payment[0];

      // Crear el PDF
      const doc = new PDFDocument();
      
      // Encabezado
      doc.fontSize(20).text('FACTURA', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Número de Factura: ${paymentData.id}`);
      doc.text(`Fecha: ${new Date(paymentData.payment_date).toLocaleDateString()}`);
      
      // Información del cliente
      doc.moveDown();
      doc.fontSize(14).text('Información del Cliente');
      doc.fontSize(12).text(`Nombre: ${paymentData.user_name}`);
      doc.text(`Dirección: ${paymentData.user_address}`);
      
      // Detalles de la propiedad
      doc.moveDown();
      doc.fontSize(14).text('Detalles del Arriendo');
      doc.fontSize(12).text(`Propiedad: ${paymentData.property_title}`);
      doc.text(`Monto: $${paymentData.amount.toLocaleString()}`);
      doc.text(`Período: ${new Date(paymentData.payment_date).toLocaleDateString()}`);
      
      // Pie de página
      doc.moveDown();
      doc.fontSize(10).text('VivaInmuebles - Gestión de Propiedades', { align: 'center' });

      return doc;
    } catch (error) {
      console.error('Error al generar la factura:', error);
      throw error;
    }
  },

  downloadInvoice: async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await invoiceController.generateInvoice(id);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=factura-${id}.pdf`);
      
      doc.pipe(res);
      doc.end();
    } catch (error) {
      console.error('Error al descargar la factura:', error);

      // Manejar diferentes tipos de errores
      if (error.message === 'Pago no encontrado') {
        return res.status(404).json({ 
          error: 'No se encontró la factura solicitada' 
        });
      }

      if (error.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({ 
          error: 'Error en la base de datos' 
        });
      }

      // Error general
      res.status(500).json({ 
        error: 'Error al generar la factura. Por favor, intente nuevamente.' 
      });
    }
  }
};

module.exports = invoiceController;
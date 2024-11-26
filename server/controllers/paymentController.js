// Path: server/controllers/paymentController.js

const db = require('../config/database');

const paymentController = {
  processPayment: async (req, res) => {
    try {
      const { propertyId } = req.params;
      const userId = req.user.id;

      // Verificar que la propiedad existe y está disponible
      const [properties] = await db.execute(
        'SELECT * FROM properties WHERE id = ? AND status = "for_rent"',
        [propertyId]
      );

      if (properties.length === 0) {
        return res.status(404).json({ error: 'Propiedad no disponible' });
      }

      const property = properties[0];

      // Cambiar el estado de la propiedad a rentada
      await db.execute(
        'UPDATE properties SET status = "rented" WHERE id = ?',
        [propertyId]
      );

      // Registrar el pago en la base de datos
      await db.execute(
        `INSERT INTO payments (
          property_id, 
          user_id, 
          amount, 
          payment_date,
          status
        ) VALUES (?, ?, ?, NOW(), 'completed')`,
        [propertyId, userId, property.price]
      );

      res.json({ 
        success: true,
        message: 'Pago procesado exitosamente',
        property: property
      });
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      res.status(500).json({ error: 'Error al procesar el pago' });
    }
  }
};

module.exports = paymentController;
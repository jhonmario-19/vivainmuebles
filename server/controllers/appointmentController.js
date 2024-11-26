const db = require('../config/database');

const appointmentController = {
  createAppointment: async (req, res) => {
    try {
      const { property_id, date, notes } = req.body;
      const user_id = req.user.id;

      // Obtener el seller_id de la propiedad
      const [property] = await db.execute(
        'SELECT user_id as seller_id FROM properties WHERE id = ?',
        [property_id]
      );

      if (property.length === 0) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      const seller_id = property[0].seller_id;

      const [result] = await db.execute(
        'INSERT INTO appointments (property_id, user_id, seller_id, date, notes) VALUES (?, ?, ?, ?, ?)',
        [property_id, user_id, seller_id, date, notes]
      );

      res.status(201).json({
        message: 'Cita agendada exitosamente',
        appointment_id: result.insertId
      });
    } catch (error) {
      console.error('Error al crear cita:', error);
      res.status(500).json({ error: 'Error al agendar la cita' });
    }
  },

  getMyAppointments: async (req, res) => {
    try {
      const user_id = req.user.id;
      const role = req.user.role;

      let query;
      let params = [user_id];

      if (role === 'seller') {
        query = `
          SELECT a.*, p.title as property_title, u.name as client_name 
          FROM appointments a 
          JOIN properties p ON a.property_id = p.id 
          JOIN users u ON a.user_id = u.id 
          WHERE a.seller_id = ?
          ORDER BY a.date DESC`;
      } else {
        query = `
          SELECT a.*, p.title as property_title, u.name as seller_name 
          FROM appointments a 
          JOIN properties p ON a.property_id = p.id 
          JOIN users u ON a.seller_id = u.id 
          WHERE a.user_id = ?
          ORDER BY a.date DESC`;
      }

      const [appointments] = await db.execute(query, params);
      res.json(appointments);
    } catch (error) {
      console.error('Error al obtener citas:', error);
      res.status(500).json({ error: 'Error al obtener las citas' });
    }
  },

  updateAppointmentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user_id = req.user.id;

      const [appointment] = await db.execute(
        'SELECT * FROM appointments WHERE id = ? AND seller_id = ?',
        [id, user_id]
      );

      if (appointment.length === 0) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      await db.execute(
        'UPDATE appointments SET status = ? WHERE id = ?',
        [status, id]
      );

      res.json({ message: 'Estado de la cita actualizado exitosamente' });
    } catch (error) {
      console.error('Error al actualizar estado de la cita:', error);
      res.status(500).json({ error: 'Error al actualizar el estado de la cita' });
    }
  }
};

module.exports = appointmentController;
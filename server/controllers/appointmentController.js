// Path: server/controllers/appointmentController.js

const db = require('../config/database');
const notificationController = require('./notificationController');

const appointmentController = {
  createAppointment: async (req, res) => {
    try {
      const { property_id, date, notes } = req.body;
      const user_id = req.user.id;

      // Obtener detalles de la propiedad y el vendedor
      const [property] = await db.execute(
        `SELECT p.*, u.id as seller_id, u.name as seller_name 
         FROM properties p 
         JOIN users u ON p.user_id = u.id 
         WHERE p.id = ?`,
        [property_id]
      );

      if (property.length === 0) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      const seller_id = property[0].seller_id;

      // Crear la cita
      const [result] = await db.execute(
        'INSERT INTO appointments (property_id, user_id, seller_id, date, notes, status) VALUES (?, ?, ?, ?, ?, "pending")',
        [property_id, user_id, seller_id, date, notes]
      );

      // Notificar al vendedor
      await notificationController.createNotification(
        seller_id,
        'new_appointment',
        `Nueva solicitud de cita para ${property[0].title}`,
        result.insertId
      );

      // Notificar al comprador
      await notificationController.createNotification(
        user_id,
        'appointment_created',
        `Tu cita para ${property[0].title} ha sido agendada`,
        result.insertId
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

      // Verificar que la cita existe y pertenece al vendedor
      const [appointment] = await db.execute(
        `SELECT a.*, p.title as property_title, u.name as client_name 
         FROM appointments a 
         JOIN properties p ON a.property_id = p.id 
         JOIN users u ON a.user_id = u.id 
         WHERE a.id = ? AND a.seller_id = ?`,
        [id, user_id]
      );

      if (appointment.length === 0) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      // Actualizar estado
      await db.execute(
        'UPDATE appointments SET status = ? WHERE id = ?',
        [status, id]
      );

      // Notificar al cliente sobre el cambio de estado
      const statusMessage = status === 'confirmed' ? 'confirmada' : 'cancelada';
      await notificationController.createNotification(
        appointment[0].user_id,
        'appointment_update',
        `Tu cita para ${appointment[0].property_title} ha sido ${statusMessage}`,
        id
      );

      // Si la cita está próxima a ocurrir (24 horas), crear recordatorio
      if (status === 'confirmed') {
        const appointmentDate = new Date(appointment[0].date);
        const now = new Date();
        const hoursUntilAppointment = (appointmentDate - now) / (1000 * 60 * 60);

        if (hoursUntilAppointment <= 24) {
          // Recordatorio para el cliente
          await notificationController.createNotification(
            appointment[0].user_id,
            'appointment_reminder',
            `Recordatorio: Tienes una cita mañana para ver ${appointment[0].property_title}`,
            id
          );

          // Recordatorio para el vendedor
          await notificationController.createNotification(
            user_id,
            'appointment_reminder',
            `Recordatorio: Tienes una cita mañana con ${appointment[0].client_name} para mostrar ${appointment[0].property_title}`,
            id
          );
        }
      }

      res.json({ message: 'Estado de la cita actualizado exitosamente' });
    } catch (error) {
      console.error('Error al actualizar estado de la cita:', error);
      res.status(500).json({ error: 'Error al actualizar el estado de la cita' });
    }
  },

  deleteAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      // Verificar que la cita existe y pertenece al usuario
      const [appointment] = await db.execute(
        'SELECT * FROM appointments WHERE id = ? AND (user_id = ? OR seller_id = ?)',
        [id, user_id, user_id]
      );

      if (appointment.length === 0) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      // Eliminar la cita
      await db.execute('DELETE FROM appointments WHERE id = ?', [id]);

      // Notificar a ambas partes
      const otherUserId = user_id === appointment[0].user_id ? 
        appointment[0].seller_id : appointment[0].user_id;

      await notificationController.createNotification(
        otherUserId,
        'appointment_cancelled',
        'Una cita ha sido cancelada',
        id
      );

      res.json({ message: 'Cita eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar cita:', error);
      res.status(500).json({ error: 'Error al eliminar la cita' });
    }
  }
};

module.exports = appointmentController;
// Path: server/controllers/notificationController.js

const db = require('../config/database');

const notificationController = {
  // Crear una nueva notificación
  createNotification: async (userId, type, message, relatedId = null) => {
    try {
      await db.execute(
        `INSERT INTO notifications (user_id, type, message, related_id, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [userId, type, message, relatedId]
      );
    } catch (error) {
      console.error('Error al crear notificación:', error);
    }
  },

  // Obtener notificaciones del usuario
  getNotifications: async (req, res) => {
    try {
      const [notifications] = await db.execute(
        `SELECT * FROM notifications 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT 20`,
        [req.user.id]
      );

      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
  },

  // Marcar notificación como leída
  markAsRead: async (req, res) => {
    try {
      const { notificationId } = req.params;
      
      await db.execute(
        'UPDATE notifications SET read_at = NOW() WHERE id = ? AND user_id = ?',
        [notificationId, req.user.id]
      );

      res.json({ message: 'Notificación marcada como leída' });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar notificación' });
    }
  },

  // Marcar todas las notificaciones como leídas
  markAllAsRead: async (req, res) => {
    try {
      await db.execute(
        'UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL',
        [req.user.id]
      );

      res.json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar notificaciones' });
    }
  }
};

module.exports = notificationController;
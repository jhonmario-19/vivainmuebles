// Path: server/controllers/notificationController.js

const db = require('../config/database');

const notificationController = {
  // Crear una nueva notificación
  createNotification: async (userId, type, message, relatedId = null) => {
    // Option 1: Let the error bubble up to the caller
    const result = await db.execute(
      `INSERT INTO notifications (user_id, type, message, related_id, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [userId, type, message, relatedId]
    );
    return result;
    
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
      console.error('Error al obtener notificaciones:', error);
      res.status(500).json({ 
        error: 'Error al obtener notificaciones',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Marcar notificación como leída
  markAsRead: async (req, res) => {
    try {
      const { notificationId } = req.params;
      
      // Validate input
      if (!notificationId || isNaN(notificationId)) {
        return res.status(400).json({ error: 'ID de notificación inválido' });
      }

      const [result] = await db.execute(
        'UPDATE notifications SET read_at = NOW() WHERE id = ? AND user_id = ?',
        [notificationId, req.user.id]
      );

      // Check if notification was actually updated
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Notificación no encontrada' });
      }

      res.json({ message: 'Notificación marcada como leída' });
    } catch (error) {
      console.error('Error al actualizar notificación:', error);
      res.status(500).json({ 
        error: 'Error al actualizar notificación',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Marcar todas las notificaciones como leídas
  markAllAsRead: async (req, res) => {
    try {
      const [result] = await db.execute(
        'UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL',
        [req.user.id]
      );

      res.json({ 
        message: 'Todas las notificaciones marcadas como leídas',
        updatedCount: result.affectedRows
      });
    } catch (error) {
      console.error('Error al actualizar notificaciones:', error);
      res.status(500).json({ 
        error: 'Error al actualizar notificaciones',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Alternative approach: Create notification with proper error handling
  createNotificationSafe: async (userId, type, message, relatedId = null) => {
    try {
      // Validate inputs
      if (!userId || !type || !message) {
        throw new Error('Missing required parameters: userId, type, message');
      }

      const [result] = await db.execute(
        `INSERT INTO notifications (user_id, type, message, related_id, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [userId, type, message, relatedId]
      );

      return {
        success: true,
        notificationId: result.insertId,
        message: 'Notification created successfully'
      };
    } catch (error) {
      console.error('Error creating notification:', {
        userId,
        type,
        message,
        relatedId,
        error: error.message
      });

      // Return structured error info instead of just logging
      return {
        success: false,
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      };
    }
  }
};

module.exports = notificationController;
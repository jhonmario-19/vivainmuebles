// Path: server/controllers/reportController.js

const db = require('../config/database');

const reportController = {
  getActivityReport: async (req, res) => {
    try {
      const userId = req.user.id;
      const { range } = req.query;
      
      let dateFilter;
      switch(range) {
        case 'week':
          dateFilter = 'DATE_SUB(NOW(), INTERVAL 1 WEEK)';
          break;
        case 'month':
          dateFilter = 'DATE_SUB(NOW(), INTERVAL 1 MONTH)';
          break;
        case 'year':
          dateFilter = 'DATE_SUB(NOW(), INTERVAL 1 YEAR)';
          break;
        default:
          dateFilter = 'DATE_SUB(NOW(), INTERVAL 1 WEEK)';
      }

      // Obtener propiedades activas
      const [activeProperties] = await db.execute(
        'SELECT COUNT(*) as count FROM properties WHERE user_id = ? AND status IN ("for_sale", "for_rent")',
        [userId]
      );

      // Obtener total de vistas
      const [totalViews] = await db.execute(
        'SELECT COALESCE(SUM(views), 0) as total_views FROM properties WHERE user_id = ?',
        [userId]
      );

      // Obtener estadísticas generales
      const [generalStats] = await db.execute(
        `SELECT 
          COUNT(DISTINCT a.id) as total_appointments,
          COUNT(DISTINCT f.id) as total_favorites
         FROM properties p 
         LEFT JOIN appointments a ON p.id = a.property_id AND a.created_at >= ${dateFilter}
         LEFT JOIN favorites f ON p.id = f.property_id
         WHERE p.user_id = ?`,
        [userId]
      );

      // Obtener detalles por propiedad
      const [propertyDetails] = await db.execute(
        `SELECT 
          p.id,
          p.title,
          COUNT(DISTINCT a.id) as appointments,
          COUNT(DISTINCT f.id) as favorites,
          COALESCE(p.views, 0) as views
         FROM properties p
         LEFT JOIN appointments a ON p.id = a.property_id AND a.created_at >= ${dateFilter}
         LEFT JOIN favorites f ON p.id = f.property_id
         WHERE p.user_id = ?
         GROUP BY p.id`,
        [userId]
      );

      res.json({
        activeProperties: activeProperties[0].count,
        totalAppointments: generalStats[0].total_appointments || 0,
        totalFavorites: generalStats[0].total_favorites || 0,
        totalContacts: 0,
        totalViews: totalViews[0].total_views,
        propertyDetails: propertyDetails.map(p => ({
          ...p,
          contacts: 0
        }))
      });
    } catch (error) {
      console.error('Error al generar reporte:', error);
      res.status(500).json({ error: 'Error al generar el reporte de actividades' });
    }
  }
};

module.exports = reportController;
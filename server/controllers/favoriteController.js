const db = require('../config/database');

const favoriteController = {
  addToFavorites: async (req, res) => {
    try {
      const { property_id } = req.body;
      const user_id = req.user.id;

      await db.execute(
        'INSERT INTO favorites (user_id, property_id) VALUES (?, ?)',
        [user_id, property_id]
      );

      res.status(201).json({ message: 'Propiedad agregada a favoritos' });
    } catch (err) {
      console.error('Error al agregar a favoritos:', err);
      res.status(500).json({ error: 'Error al agregar a favoritos' });
    }
  },

  removeFromFavorites: async (req, res) => {
    try {
      const { property_id } = req.params;
      const user_id = req.user.id;

      await db.execute(
        'DELETE FROM favorites WHERE user_id = ? AND property_id = ?',
        [user_id, property_id]
      );

      res.json({ message: 'Propiedad eliminada de favoritos' });
    } catch (err) {
      console.error('Error al eliminar de favoritos:', err);
      res.status(500).json({ error: 'Error al eliminar de favoritos' });
    }
  },

  getFavorites: async (req, res) => {
    try {
      const user_id = req.user.id;

      const [favorites] = await db.execute(`
        SELECT p.*, f.id as favorite_id 
        FROM properties p 
        JOIN favorites f ON p.id = f.property_id 
        WHERE f.user_id = ?
      `, [user_id]);

      res.json(favorites);
    } catch (err) {
      console.error('Error al obtener favoritos:', err);
      res.status(500).json({ error: 'Error al obtener favoritos' });
    }
  },

  checkFavorite: async (req, res) => {
    try {
      const { property_id } = req.params;
      const user_id = req.user.id;

      const [favorite] = await db.execute(
        'SELECT id FROM favorites WHERE user_id = ? AND property_id = ?',
        [user_id, property_id]
      );

      res.json({ isFavorite: favorite.length > 0 });
    } catch (err) {
      console.error('Error al verificar favorito:', err);
      res.status(500).json({ error: 'Error al verificar favorito' });
    }
  }
};

module.exports = favoriteController;
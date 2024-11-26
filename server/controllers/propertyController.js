// Path: server/controllers/propertyController.js

const db = require('../config/database');

const propertyController = {
  // Obtener todas las propiedades
  getAllProperties: async (req, res) => {
    try {
      const [properties] = await db.execute('SELECT * FROM properties');
      res.json(properties);
    } catch (error) {
      console.error('Error al obtener propiedades:', error);
      res.status(500).json({ error: 'Error al obtener las propiedades' });
    }
  },

  // Publicar una nueva propiedad
  createProperty: async (req, res) => {
    try {
      const {
        title,
        description,
        price,
        location,
        area,
        bedrooms,
        bathrooms,
        property_type,
        status,
      } = req.body;
  
      const userId = req.user.id;
      const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  
      // Convertir los valores numéricos
      const numericPrice = parseFloat(price);
      const numericArea = parseFloat(area);
      const numericBedrooms = parseInt(bedrooms);
      const numericBathrooms = parseInt(bathrooms);
  
      const [result] = await db.execute(
        `INSERT INTO properties (
          title, description, price, location, area, bedrooms, bathrooms, 
          property_type, status, image_url, user_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          title,
          description,
          numericPrice,
          location,
          numericArea,
          numericBedrooms,
          numericBathrooms,
          property_type,
          status,
          image_url,
          userId
        ]
      );
  
      res.status(201).json({
        message: 'Propiedad creada exitosamente',
        propertyId: result.insertId
      });
    } catch (error) {
      console.error('Error al crear propiedad:', error);
      res.status(500).json({ error: 'Error al crear la propiedad' });
    }
  },

  // Obtener propiedad por ID
  getPropertyById: async (req, res) => {
    try {
      const [properties] = await db.execute(
        'SELECT * FROM properties WHERE id = ?',
        [req.params.id]
      );

      if (properties.length === 0) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      res.json(properties[0]);
    } catch (error) {
      console.error('Error al obtener propiedad:', error);
      res.status(500).json({ error: 'Error al obtener la propiedad' });
    }
  },

  // Obtener propiedades del vendedor
  getMyProperties: async (req, res) => {
    try {
      const [properties] = await db.execute(
        'SELECT * FROM properties WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id]
      );
      res.json(properties);
    } catch (error) {
      console.error('Error al obtener propiedades:', error);
      res.status(500).json({ error: 'Error al obtener las propiedades' });
    }
  },

  // Eliminar propiedad
  deleteProperty: async (req, res) => {
    try {
      // Verificar que la propiedad existe y pertenece al usuario
      const [property] = await db.execute(
        'SELECT * FROM properties WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id]
      );
  
      if (property.length === 0) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }
  
      // Primero eliminar todas las citas asociadas a la propiedad
      await db.execute(
        'DELETE FROM appointments WHERE property_id = ?',
        [req.params.id]
      );
  
      // Eliminar los favoritos asociados a la propiedad
      await db.execute(
        'DELETE FROM favorites WHERE property_id = ?',
        [req.params.id]
      );
  
      // Ahora sí podemos eliminar la propiedad
      await db.execute(
        'DELETE FROM properties WHERE id = ?',
        [req.params.id]
      );
  
      res.json({ message: 'Propiedad eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar propiedad:', error);
      res.status(500).json({ error: 'Error al eliminar la propiedad' });
    }
  },

  updateProperty: async (req, res) => {
    try {
      const propertyId = req.params.id;
      const userId = req.user.id;
      
      // Verificar que la propiedad existe y pertenece al usuario
      const [property] = await db.execute(
        'SELECT * FROM properties WHERE id = ? AND user_id = ?',
        [propertyId, userId]
      );
  
      if (property.length === 0) {
        return res.status(404).json({ error: 'Propiedad no encontrada o no autorizada' });
      }
  
      let imageUrl = property[0].image_url;
  
      // Si hay una nueva imagen, procesar y guardar
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }
  
      const {
        title,
        description,
        price,
        location,
        area,
        bedrooms,
        bathrooms,
        property_type,
        status
      } = req.body;
  
      await db.execute(
        `UPDATE properties SET 
          title = ?, description = ?, price = ?, location = ?, 
          area = ?, bedrooms = ?, bathrooms = ?, property_type = ?, 
          status = ?, image_url = ?
        WHERE id = ? AND user_id = ?`,
        [
          title,
          description,
          price,
          location,
          area,
          bedrooms,
          bathrooms,
          property_type,
          status,
          imageUrl,
          propertyId,
          userId
        ]
      );
  
      res.json({ message: 'Propiedad actualizada exitosamente' });
    } catch (error) {
      console.error('Error al actualizar propiedad:', error);
      res.status(500).json({ error: 'Error al actualizar la propiedad' });
    }
  }
};

module.exports = propertyController;
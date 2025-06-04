const db = require('../config/database');
const notificationController = require('./notificationController');

const propertyController = {
  // Funciones de validación
  validateTitle: (title) => {
    if (!title) return 'El título es requerido';
    if (title.length < 5) return 'El título debe tener al menos 5 caracteres';
    if (title.length > 100) return 'El título no puede exceder los 100 caracteres';
    if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(title)) return 'El título solo puede contener letras y espacios';
    return null;
  },

  validateDescription: (description) => {
    if (!description) return 'La descripción es requerida';
    if (description.length < 20) return 'La descripción debe tener al menos 20 caracteres';
    if (description.length > 500) return 'La descripción no puede exceder los 500 caracteres';
    return null;
  },

  validatePrice: (price) => {
    if (!price || isNaN(price)) return 'El precio debe ser un número válido';
    if (parseFloat(price) <= 0) return 'El precio debe ser mayor que cero';
    return null;
  },

  validateArea: (area) => {
    if (!area || isNaN(area)) return 'El área debe ser un número válido';
    if (parseFloat(area) <= 0) return 'El área debe ser mayor que cero';
    return null;
  },

  validateLocation: (location) => {
    if (!location) return 'La dirección es requerida';
    if (location.length < 10) return 'La dirección debe tener al menos 10 caracteres';
    if (location.length > 100) return 'La dirección no puede exceder los 100 caracteres';
    return null;
  },

  validatePropertyType: (property_type) => {
    const validPropertyTypes = ['casa', 'apartamento', 'terreno', 'comercial'];
    if (!property_type || !validPropertyTypes.includes(property_type.toLowerCase())) {
      return 'Tipo de propiedad inválido. Los valores válidos son: Casa, Apartamento, Terreno, Comercial';
    }
    return null;
  },

  validateBedrooms: (bedrooms) => {
    if (!bedrooms || isNaN(bedrooms) || !Number.isInteger(parseFloat(bedrooms))) {
      return 'El número de habitaciones debe ser un entero válido';
    }
    if (parseInt(bedrooms) < 1) return 'Debe haber al menos 1 habitación';
    return null;
  },

  validateBathrooms: (bathrooms) => {
    if (!bathrooms || isNaN(bathrooms) || !Number.isInteger(parseFloat(bathrooms))) {
      return 'El número de baños debe ser un entero válido';
    }
    if (parseInt(bathrooms) < 1) return 'Debe haber al menos 1 baño';
    return null;
  },

  validateImage: (file) => {
    if (!file) return 'La imagen es requerida';
    return null;
  },

  validatePropertyData: function(body, file) {
    const validations = [
      this.validateTitle(body.title),
      this.validateDescription(body.description),
      this.validatePrice(body.price),
      this.validateArea(body.area),
      this.validateLocation(body.location),
      this.validatePropertyType(body.property_type),
      this.validateBedrooms(body.bedrooms),
      this.validateBathrooms(body.bathrooms),
      this.validateImage(file)
    ];

    return validations.find(error => error !== null) || null;
  },

  // Funciones principales
  getAllProperties: async (req, res) => {
    try {
      const [properties] = await db.execute(
        'SELECT * FROM properties WHERE status IN ("for_sale", "for_rent")'
      );
      res.json(properties);
    } catch (error) {
      console.error('Error al obtener propiedades:', error);
      res.status(500).json({ 
        error: 'Error al obtener las propiedades',
        details: error.message 
      });
    }
  },

  getPropertyById: async (req, res) => {
    try {
      await db.execute(
        'UPDATE properties SET views = COALESCE(views, 0) + 1 WHERE id = ?',
        [req.params.id]
      );

      const [properties] = await db.execute(
        `SELECT p.*, u.name as seller_name, u.email as seller_email, u.phone as seller_phone 
         FROM properties p 
         JOIN users u ON p.user_id = u.id 
         WHERE p.id = ?`,
        [req.params.id]
      );

      if (properties.length === 0) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      const property = properties[0];
      const sellerInfo = {
        name: property.seller_name,
        email: property.seller_email,
        phone: property.seller_phone
      };

      delete property.seller_name;
      delete property.seller_email;
      delete property.seller_phone;

      res.json({
        ...property,
        seller: sellerInfo
      });
    } catch (error) {
      console.error('Error al obtener propiedad:', error);
      res.status(500).json({ error: 'Error al obtener la propiedad' });
    }
  },

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

  createProperty: async (req, res) => {
    try {
      const validationError = propertyController.validatePropertyData(req.body, req.file);
      if (validationError) {
        return res.status(400).json({ error: validationError });
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
        status = 'for_sale'
      } = req.body;

      const userId = req.user.id;
      const image_url = req.file ? `/uploads/${req.file.filename}` : null;

      const [result] = await db.execute(
        `INSERT INTO properties (
          title, description, price, location, area, bedrooms, 
          bathrooms, property_type, status, image_url, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          description,
          parseFloat(price),
          location,
          parseFloat(area),
          parseInt(bedrooms),
          parseInt(bathrooms),
          property_type,
          status,
          image_url,
          userId
        ]
      );

      // Enviar notificaciones
      try {
        const [tables] = await db.execute("SHOW TABLES LIKE 'user_preferences'");
        if (tables.length > 0) {
          const [interestedUsers] = await db.execute(
            'SELECT user_id FROM user_preferences WHERE property_type = ?',
            [property_type]
          );

          for (const user of interestedUsers) {
            await notificationController.createNotification(
              user.user_id,
              'new_property',
              `Nueva propiedad disponible: ${title} en ${location}`,
              result.insertId
            );
          }
        }
      } catch (notificationError) {
        console.error('Error al enviar notificaciones:', notificationError);
      }

      res.status(201).json({
        message: 'Propiedad creada exitosamente',
        propertyId: result.insertId
      });
    } catch (error) {
      console.error('Error al crear propiedad:', error);
      res.status(500).json({
        error: 'Error al crear la propiedad',
        details: error.message
      });
    }
  },

  updateProperty: async (req, res) => {
    try {
      const propertyId = req.params.id;
      const userId = req.user.id;
      
      const [property] = await db.execute(
        'SELECT * FROM properties WHERE id = ? AND user_id = ?',
        [propertyId, userId]
      );

      if (property.length === 0) {
        return res.status(404).json({ error: 'Propiedad no encontrada o no autorizada' });
      }

      const imageUrl = req.file ? `/uploads/${req.file.filename}` : property[0].image_url;

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
          parseFloat(price),
          location,
          parseFloat(area),
          parseInt(bedrooms),
          parseInt(bathrooms),
          property_type,
          status,
          imageUrl,
          propertyId,
          userId
        ]
      );

      // Notificaciones
      try {
        const [favorites] = await db.execute(
          'SELECT user_id FROM favorites WHERE property_id = ?',
          [propertyId]
        );

        for (const favorite of favorites) {
          await notificationController.createNotification(
            favorite.user_id,
            'property_update',
            `Una propiedad en tus favoritos ha sido actualizada: ${title}`,
            propertyId
          );
        }

        if (status === 'sold' || status === 'rented') {
          const [interestedUsers] = await db.execute(
            'SELECT DISTINCT user_id FROM appointments WHERE property_id = ? AND user_id != ?',
            [propertyId, userId]
          );

          const statusText = status === 'sold' ? 'vendida' : 'rentada';
          for (const user of interestedUsers) {
            await notificationController.createNotification(
              user.user_id,
              'property_status_change',
              `La propiedad ${title} ha sido ${statusText}`,
              propertyId
            );
          }
        }
      } catch (notificationError) {
        console.error('Error al enviar notificaciones:', notificationError);
      }

      res.json({ message: 'Propiedad actualizada exitosamente' });
    } catch (error) {
      console.error('Error al actualizar propiedad:', error);
      res.status(500).json({ error: 'Error al actualizar la propiedad' });
    }
  },

  deleteProperty: async (req, res) => {
    try {
      const [property] = await db.execute(
        'SELECT * FROM properties WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id]
      );

      if (property.length === 0) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      // Notificaciones
      try {
        const [favoritedBy] = await db.execute(
          'SELECT user_id FROM favorites WHERE property_id = ?',
          [req.params.id]
        );

        for (const user of favoritedBy) {
          await notificationController.createNotification(
            user.user_id,
            'property_removed',
            `Una propiedad en tus favoritos ya no está disponible: ${property[0].title}`,
            null
          );
        }
      } catch (notificationError) {
        console.error('Error al enviar notificaciones:', notificationError);
      }

      // Eliminar registros relacionados
      await db.execute('DELETE FROM appointments WHERE property_id = ?', [req.params.id]);
      await db.execute('DELETE FROM favorites WHERE property_id = ?', [req.params.id]);
      await db.execute('DELETE FROM properties WHERE id = ?', [req.params.id]);

      res.json({ message: 'Propiedad eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar propiedad:', error);
      res.status(500).json({ error: 'Error al eliminar la propiedad' });
    }
  }
};

module.exports = propertyController;
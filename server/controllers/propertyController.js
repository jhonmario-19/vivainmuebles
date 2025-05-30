// Path: server/controllers/propertyController.js

const db = require('../config/database');
const notificationController = require('./notificationController');

const propertyController = {
 // Obtener todas las propiedades
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

 // Obtener propiedad por ID
 getPropertyById: async (req, res) => {
   try {
     // Primero incrementamos el contador de vistas
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

     // Estructurar la respuesta para incluir la información del vendedor
     const property = properties[0];
     const sellerInfo = {
       name: property.seller_name,
       email: property.seller_email,
       phone: property.seller_phone
     };

     // Eliminar los campos del vendedor del objeto principal
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

 // Publicar una nueva propiedad
 createProperty: async (req, res) => {
   try {
    if (!req.body.title) {
      return res.status(400).json({ error: 'El título es requerido' });
    }
    if (req.body.title.length < 5) {
      return res.status(400).json({ error: 'El título debe tener al menos 5 caracteres' });
    }
    if (req.body.title.length > 100) {
      return res.status(400).json({ error: 'El título no puede exceder los 100 caracteres' });
    }
    if (/\d/.test(req.body.title)) {
      return res.status(400).json({ error: 'El título no puede contener números' });
    }

    // Validaciones de descripción
    if (!req.body.description) {
      return res.status(400).json({ error: 'La descripción es requerida' });
    }
    if (req.body.description.length < 20) {
      return res.status(400).json({ error: 'La descripción debe tener al menos 20 caracteres' });
    }
    if (req.body.description.length > 500) {
      return res.status(400).json({ error: 'La descripción no puede exceder los 500 caracteres' });
    }

    // Validaciones de precio
    if (isNaN(req.body.price)) {
      return res.status(400).json({ error: 'El precio debe ser un número válido' });
    }
    if (parseFloat(req.body.price) <= 0) {
      return res.status(400).json({ error: 'El precio debe ser mayor que cero' });
    }

    // Validaciones de área
    if (isNaN(req.body.area)) {
      return res.status(400).json({ error: 'El área debe ser un número válido' });
    }
    if (parseFloat(req.body.area) <= 0) {
      return res.status(400).json({ error: 'El área debe ser mayor que cero' });
    }

    // Validaciones de dirección/location
    if (!req.body.location) {
      return res.status(400).json({ error: 'La dirección es requerida' });
    }
    if (req.body.location.length < 10) {
      return res.status(400).json({ error: 'La dirección debe tener al menos 10 caracteres' });
    }
    if (req.body.location.length > 100) {
      return res.status(400).json({ error: 'La dirección no puede exceder los 100 caracteres' });
    }

    // Validaciones de tipo de propiedad
    const validPropertyTypes = ['Casa', 'Apartamento', 'Terreno', 'Comercial'];
    if (!req.body.property_type || !validPropertyTypes.includes(req.body.property_type)) {
      return res.status(400).json({ 
        error: 'Tipo de propiedad inválido. Los valores válidos son: Casa, Apartamento, Terreno, Comercial' 
      });
    }

    // Validaciones de número de habitaciones
    if (isNaN(req.body.bedrooms) || !Number.isInteger(parseFloat(req.body.bedrooms))) {
      return res.status(400).json({ error: 'El número de habitaciones debe ser un entero válido' });
    }
    if (parseInt(req.body.bedrooms) < 1) {
      return res.status(400).json({ error: 'Debe haber al menos 1 habitación' });
    }

    // Validaciones de número de baños
    if (isNaN(req.body.bathrooms) || !Number.isInteger(parseFloat(req.body.bathrooms))) {
      return res.status(400).json({ error: 'El número de baños debe ser un entero válido' });
    }
    if (parseInt(req.body.bathrooms) < 1) {
      return res.status(400).json({ error: 'Debe haber al menos 1 baño' });
    }


    // Validaciones de imágenes
    if (!req.file) {
      return res.status(400).json({ error: 'La imagen es requerida' });
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
       status,
     } = req.body;
 
     const userId = req.user.id;
     const image_url = req.file ? `/uploads/${req.file.filename}` : null;
 
     const numericPrice = parseFloat(price);
     const numericArea = parseFloat(area);
     const numericBedrooms = parseInt(bedrooms);
     const numericBathrooms = parseInt(bathrooms);
 
     const [result] = await db.execute(
        'INSERT INTO properties (title, description, price, location, area, bedrooms, bathrooms, property_type, status, image_url, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          req.body.title,
          req.body.description,
          req.body.price,
          req.body.location,
          req.body.area,
          req.body.bedrooms,
          req.body.bathrooms,
          req.body.property_type,
          req.body.status,
          req.file.filename,
          req.user.id
        ]
      );

      const [tables] = await db.execute(
        "SHOW TABLES LIKE 'user_preferences'"
      );
      
      if (tables.length > 0) {
        const [interestedUsers] = await db.execute(
          'SELECT user_id FROM user_preferences WHERE property_type = ?',
          [property_type]
        );
    
        let i = 0;
        while (i < interestedUsers.length) {
            await notificationController.createNotification(
              interestedUsers[i].user_id,
              'new_property',
              `Nueva propiedad disponible: ${title} en ${location}`,
              result.insertId
            );
            i++;
        }
      }
 
     res.status(201).json({
       message: 'Propiedad creada exitosamente',
       propertyId: result.insertId
     });
   } catch (error) {
     console.error('Error al crear propiedad:', error);
     res.status(500).json({ error: 'Error al crear la propiedad' });
   }
 },

 // Eliminar propiedad
 deleteProperty: async (req, res) => {
   try {
     const [property] = await db.execute(
       'SELECT * FROM properties WHERE id = ? AND user_id = ?',
       [req.params.id, req.user.id]
     );
 
     if (property.length === 0) {
       return res.status(404).json({ error: 'Propiedad no encontrada' });
     }

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
 
     await db.execute(
       'DELETE FROM appointments WHERE property_id = ?',
       [req.params.id]
     );
 
     await db.execute(
       'DELETE FROM favorites WHERE property_id = ?',
       [req.params.id]
     );
 
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

 // Actualizar propiedad
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
 
     let imageUrl = property[0].image_url;
 
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
 
     res.json({ message: 'Propiedad actualizada exitosamente' });
   } catch (error) {
    console.error('Error al crear propiedad:', error);
    res.status(500).json({ error: 'Error al crear la propiedad' });
   }
 }
};

module.exports = propertyController;
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
       `INSERT INTO properties (
         title, description, price, location, area, bedrooms, bathrooms, 
         property_type, status, image_url, user_id, created_at, views
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0)`,
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
     console.error('Error al actualizar propiedad:', error);
     res.status(500).json({ error: 'Error al actualizar la propiedad' });
   }
 }
};

module.exports = propertyController;
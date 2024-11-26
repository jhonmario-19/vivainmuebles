// Path: server/routes/propertyRoutes.js

const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { auth, checkRole } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

// IMPORTANTE: La ruta my-properties debe ir ANTES de la ruta con :id
// para evitar que Express la interprete como un parámetro
router.get('/my-properties', auth, checkRole('seller'), propertyController.getMyProperties);

// Otras rutas
router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getPropertyById);

// Rutas protegidas
router.post('/', 
    auth, 
    checkRole('seller'), 
    upload.single('image'), 
    propertyController.createProperty
  );
  ;
router.delete('/:id', auth, checkRole('seller'), propertyController.deleteProperty);
router.put('/:id', 
  auth, 
  checkRole('seller'), 
  upload.single('image'), 
  propertyController.updateProperty
);

module.exports = router;
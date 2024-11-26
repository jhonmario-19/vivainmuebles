// Path: server/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// Asegúrate de que userController tiene todos los métodos antes de definir las rutas
console.log('Rutas disponibles:', Object.keys(userController));

// Rutas públicas
router.post('/register', userController.register);
router.post('/login', userController.login);

// Rutas protegidas
router.get('/profile', auth, userController.getProfile);

module.exports = router;
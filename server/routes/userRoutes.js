// Path: server/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Asegúrate de que userController.register y userController.login existen
console.log('Rutas disponibles:', Object.keys(userController));

router.post('/register', userController.register);
router.post('/login', userController.login);

module.exports = router;
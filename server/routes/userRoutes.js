// Path: server/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// Asegúrate de que userController tiene todos los métodos antes de definir las rutas
console.log('Rutas disponibles:', Object.keys(userController));

// Ruta GET para mostrar el formulario de registro (debe ir ANTES de la POST)
router.get('/register', (req, res) => {
  res.send(`
    <form method="POST" action="/api/users/register">
      <input type="text" name="name" placeholder="Nombre" required>
      <input type="email" name="email" placeholder="Email" required>
      <input type="password" name="password" placeholder="Contraseña" required>
      <select name="role" required>
        <option value="">Seleccionar rol</option>
        <option value="Comprador">Comprador</option>
        <option value="Vendedor">Vendedor</option>
      </select>
      <input type="text" name="phone" placeholder="Teléfono">
      <input type="text" name="address" placeholder="Dirección">
      <button type="submit">Registrar</button>
    </form>
  `);
});

// Rutas públicas
router.post('/register', userController.register);
router.post('/login', userController.login);

// Rutas protegidas
router.get('/profile', auth, userController.getProfile);

module.exports = router;
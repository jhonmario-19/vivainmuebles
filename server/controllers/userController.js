// Path: server/controllers/userController.js

const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userController = {
  register: async (req, res) => {
    try {
      if (!req.body.name || req.body.name.trim() === '') {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }
      if (/\d/.test(req.body.name)) {
        return res.status(400).json({ error: 'El nombre no puede contener números' });
      }
      if (req.body.name.length < 5 || req.body.name.length > 40) {
        return res.status(400).json({ error: 'El nombre debe tener entre 5 y 40 caracteres' });
      }
      
      if (!req.body.role || !['Comprador', 'Vendedor'].includes(req.body.role)) {
        return res.status(400).json({ error: 'El rol debe ser Comprador o Vendedor' });
      }
      
      if (!req.body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
        return res.status(400).json({ error: 'Correo electrónico inválido' });
      }
      if (req.body.email.length < 15 || req.body.email.length > 40) {
        return res.status(400).json({ error: 'El correo electrónico debe tener entre 15 y 40 caracteres' });
      }
      
      if (!req.body.password || req.body.password.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
      }

      // Verificar si el correo ya existe
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE email = ?', 
        [req.body.email]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
      }

      // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Insertar nuevo usuario con campos opcionales
        const [result] = await db.execute(
          'INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
          [
            req.body.name.trim(),
            req.body.email.trim(),
            hashedPassword,
            req.body.role,
            req.body.phone || null,
            req.body.address ? req.body.address.trim() : null
          ]
        );

        res.status(201).json({
          message: 'Usuario registrado exitosamente',
          userId: result.insertId
        });
      } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ error: 'Error en el servidor' });
      }
    },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Verificar si el usuario existe
      const [users] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const user = users[0];

      // Verificar la contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Crear token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET || 'tu_clave_secreta',
        { expiresIn: '7d' }
      );

      // Enviar respuesta sin la contraseña
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      res.json({
        token,
        user: userResponse
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  getProfile: async (req, res) => {
    try {
      const [users] = await db.execute(
        'SELECT id, name, email, role, phone, address FROM users WHERE id = ?',
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const user = users[0];
      res.json(user);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: 'Error al obtener el perfil del usuario' });
    }
  }
};

module.exports = userController;
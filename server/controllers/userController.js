// Path: server/controllers/userController.js

const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userController = {
  register: async (req, res) => {
    try {
      const { name, email, password, role, phone, address } = req.body;

      // Verificar si el correo ya existe
      const [existingUsers] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        
        return res.status(400).json({ error: 'El correo electrónico ya está registrado' });

      }else{

        // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insertar nuevo usuario
      const [result] = await db.execute(
        'INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, role, phone, address]
      );

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        userId: result.insertId
      });

      }

      
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
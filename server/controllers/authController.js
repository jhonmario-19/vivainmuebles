// Path: server/controllers/authController.js

const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const JWT_SECRET = process.env.JWT_SECRET; // En producción, esto debería estar en variables de entorno

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});


const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Verificar si el usuario existe
      const [users] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
      }

      const user = users[0];

      // Verificar la contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
      }

      // Crear token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Enviar respuesta
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  requestPasswordReset: async (req, res) => {
    try {
      const { email } = req.body;
      
      // Verificar si el usuario existe
      const [users] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(404).json({ 
          error: 'No existe un usuario con este correo electrónico' 
        });
      }

      // Generar token de restablecimiento
      const resetToken = jwt.sign(
        { id: users[0].id },
        process.env.JWT_RESET_SECRET || 'reset_secret_key',
        { expiresIn: '1h' }
      );

      // Guardar el token en la base de datos
      await db.execute(
        'UPDATE users SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?',
        [resetToken, users[0].id]
      );

      // Configurar el correo
      const mailOptions = {
        from: `"VivaInmuebles" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Restablecimiento de Contraseña - VivaInmuebles',
        html: `
          <h1>Restablecimiento de Contraseña</h1>
          <p>Has solicitado restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para continuar:</p>
          <a href="http://localhost:3000/reset-password/${resetToken}">
            Restablecer Contraseña
          </a>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, ignora este correo.</p>
        `
      };

      // Enviar el correo
      await transporter.sendMail(mailOptions);

      res.json({ 
        message: 'Se ha enviado un enlace de restablecimiento a tu correo electrónico' 
      });
    } catch (error) {
      console.error('Error en solicitud de restablecimiento:', error);
      res.status(500).json({ 
        error: 'Error al procesar la solicitud de restablecimiento' 
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      // Verificar el token y que no haya expirado
      const [users] = await db.execute(
        'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
        [token]
      );

      if (users.length === 0) {
        return res.status(400).json({ error: 'Token inválido o expirado' });
      }

      // Encriptar la nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Actualizar la contraseña y limpiar el token
      await db.execute(
        'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
        [hashedPassword, users[0].id]
      );

      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      res.status(500).json({ error: 'Error al restablecer la contraseña' });
    }
  }

};

module.exports = authController;
// Path: server/controllers/contactController.js

const nodemailer = require('nodemailer');
require('dotenv').config();
const db = require('../config/database');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const contactController = {
  sendEmail: async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        message,
        propertyId,
        propertyTitle
      } = req.body;

      // Aquí deberías obtener el email del propietario de la propiedad desde la base de datos
      const [rows] = await db.execute(
        'SELECT u.email FROM users u JOIN properties p ON u.id = p.user_id WHERE p.id = ?',
        [propertyId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Propiedad no encontrada' });
      }

      const ownerEmail = rows[0].email;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: ownerEmail,
        subject: `Consulta sobre propiedad: ${propertyTitle}`,
        html: `
          <h2>Nuevo mensaje de contacto</h2>
          <p><strong>Propiedad:</strong> ${propertyTitle}</p>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${phone}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${message}</p>
        `
      };

      await transporter.sendMail(mailOptions);

      res.json({ success: true, message: 'Mensaje enviado exitosamente' });
    } catch (error) {
      console.error('Error al enviar email:', error);
      res.status(500).json({ message: 'Error al enviar el mensaje' });
    }
  }
};

module.exports = contactController;
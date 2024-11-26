// Path: server/middleware/auth.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = '9938ef7686dee0cf097b742d59552bdd88d58652b7a5ebf56ebb8b9880a5449e314d98008d4ec8d23658b810ecbc89f20128a41e40ecef030a2a09ae73235c36';

const auth = (req, res, next) => {
  try {
    // Obtener el token del header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Verificar el token usando la clave secreta del .env
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

const checkRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    }
    next();
  };
};

module.exports = { auth, checkRole };
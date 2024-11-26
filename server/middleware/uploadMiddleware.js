// Path: server/middleware/uploadMiddleware.js

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.toLowerCase().split(' ').join('-'));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    // Verificar el tipo de archivo
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Solo se permiten archivos de imagen!"));
  }
});

module.exports = upload;
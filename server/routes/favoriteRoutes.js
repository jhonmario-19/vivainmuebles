const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { auth } = require('../middleware/auth');

router.post('/', auth, favoriteController.addToFavorites);
router.delete('/:property_id', auth, favoriteController.removeFromFavorites);
router.get('/', auth, favoriteController.getFavorites);
router.get('/check/:property_id', auth, favoriteController.checkFavorite);

module.exports = router;
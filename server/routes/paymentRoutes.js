// Path: server/routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

router.post('/:propertyId', auth, paymentController.processPayment);

module.exports = router;
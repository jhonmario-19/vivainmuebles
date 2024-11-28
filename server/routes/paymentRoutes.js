// Path: server/routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const invoiceController = require('../controllers/invoiceController');
const { auth } = require('../middleware/auth');

router.get('/history', auth, paymentController.getPaymentHistory);
router.get('/invoice/:id', auth, invoiceController.downloadInvoice);
router.post('/:propertyId', auth, paymentController.processPayment);

module.exports = router;
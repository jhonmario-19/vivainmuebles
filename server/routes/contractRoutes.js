const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { auth } = require('../middleware/auth');

router.get('/:transactionId', auth, contractController.generateContract);

module.exports = router;
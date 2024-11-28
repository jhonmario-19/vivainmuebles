// Path: server/routes/reportRoutes.js

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { auth, checkRole } = require('../middleware/auth');

router.get('/activities', auth, checkRole('seller'), reportController.getActivityReport);

module.exports = router;
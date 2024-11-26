const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { auth } = require('../middleware/auth');

router.post('/', auth, appointmentController.createAppointment);
router.get('/my-appointments', auth, appointmentController.getMyAppointments);
router.put('/:id/status', auth, appointmentController.updateAppointmentStatus);

module.exports = router;
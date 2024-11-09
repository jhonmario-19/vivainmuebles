const express = require('express');
const router = express.Router();

// GET all appointments
router.get('/', (req, res) => {
    res.json({ message: "Get all appointments" });
});

// GET a single appointment
router.get('/:id', (req, res) => {
    res.json({ message: `Get appointment with id ${req.params.id}` });
});

// POST a new appointment
router.post('/', (req, res) => {
    res.json({ message: "Create a new appointment" });
});

// PUT update an appointment
router.put('/:id', (req, res) => {
    res.json({ message: `Update appointment with id ${req.params.id}` });
});

// DELETE an appointment
router.delete('/:id', (req, res) => {
    res.json({ message: `Delete appointment with id ${req.params.id}` });
});

module.exports = router;
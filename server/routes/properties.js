const express = require('express');
const router = express.Router();

// GET all properties
router.get('/', (req, res) => {
    res.json({ message: "Get all properties" });
});

// GET a single property
router.get('/:id', (req, res) => {
    res.json({ message: `Get property with id ${req.params.id}` });
});

// POST a new property
router.post('/', (req, res) => {
    res.json({ message: "Create a new property" });
});

// PUT update a property
router.put('/:id', (req, res) => {
    res.json({ message: `Update property with id ${req.params.id}` });
});

// DELETE a property
router.delete('/:id', (req, res) => {
    res.json({ message: `Delete property with id ${req.params.id}` });
});

module.exports = router;
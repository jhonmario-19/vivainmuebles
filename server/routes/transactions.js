const express = require('express');
const router = express.Router();

// GET all transactions
router.get('/', (req, res) => {
    res.json({ message: "Get all transactions" });
});

// GET a single transaction
router.get('/:id', (req, res) => {
    res.json({ message: `Get transaction with id ${req.params.id}` });
});

// POST a new transaction
router.post('/', (req, res) => {
    res.json({ message: "Create a new transaction" });
});

// PUT update a transaction
router.put('/:id', (req, res) => {
    res.json({ message: `Update transaction with id ${req.params.id}` });
});

// DELETE a transaction
router.delete('/:id', (req, res) => {
    res.json({ message: `Delete transaction with id ${req.params.id}` });
});

module.exports = router;
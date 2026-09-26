const express = require('express');
const router = express.Router();
const stockService = require('../services/stockService');
const { authenticateToken } = require('../middleware/auth');

// Get all stock with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { product_id, location_id } = req.query;
    const stockList = await stockService.getStock(product_id, location_id);
    res.json(stockList);
  } catch (err) {
    console.error('Fetch stock error:', err);
    res.status(500).json({ error: 'Failed to fetch stock' });
  }
});

module.exports = router;

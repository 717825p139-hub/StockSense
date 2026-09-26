const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get reorder rules
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT rr.*, p.name AS product_name, p.sku, p.uom,
             w.name AS warehouse_name, w.code AS warehouse_code,
             COALESCE(SUM(s.on_hand), 0) AS current_on_hand,
             CASE 
               WHEN COALESCE(SUM(s.on_hand), 0) <= rr.minimum_quantity THEN (rr.maximum_quantity - COALESCE(SUM(s.on_hand), 0))
               ELSE 0 
             END AS suggested_reorder_qty
      FROM reorder_rules rr
      JOIN products p ON rr.product_id = p.id
      JOIN warehouses w ON rr.warehouse_id = w.id
      LEFT JOIN locations l ON l.warehouse_id = w.id
      LEFT JOIN stock s ON s.product_id = p.id AND s.location_id = l.id
      GROUP BY rr.id, p.name, p.sku, p.uom, w.name, w.code
      ORDER BY p.name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch reorder rules error:', err);
    res.status(500).json({ error: 'Failed to fetch reorder rules' });
  }
});

// Create reorder rule
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { product_id, warehouse_id, minimum_quantity, maximum_quantity } = req.body;
    if (!product_id || !warehouse_id || minimum_quantity === undefined || maximum_quantity === undefined) {
      return res.status(400).json({ error: 'Product, warehouse, min and max quantities are required' });
    }

    const result = await query(`
      INSERT INTO reorder_rules (product_id, warehouse_id, minimum_quantity, maximum_quantity)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (product_id, warehouse_id) 
      DO UPDATE SET minimum_quantity = EXCLUDED.minimum_quantity, maximum_quantity = EXCLUDED.maximum_quantity
      RETURNING *
    `, [product_id, warehouse_id, minimum_quantity, maximum_quantity]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create reorder rule' });
  }
});

module.exports = router;

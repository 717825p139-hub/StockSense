const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const stockService = require('../services/stockService');
const { authenticateToken } = require('../middleware/auth');

// Get Adjustments List
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT a.*, p.sku, p.name AS product_name, p.uom,
             l.name AS location_name, l.code AS location_code, w.name AS warehouse_name,
             u.name AS responsible_name
      FROM adjustments a
      JOIN products p ON a.product_id = p.id
      JOIN locations l ON a.location_id = l.id
      JOIN warehouses w ON l.warehouse_id = w.id
      LEFT JOIN users u ON a.responsible_id = u.id
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch adjustments' });
  }
});

// Create and automatically validate Stock Adjustment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { location_id, product_id, physical_qty, reason } = req.body;
    if (!location_id || !product_id || physical_qty === undefined) {
      return res.status(400).json({ error: 'Location, product and physical quantity are required' });
    }

    // Get current stock recorded qty
    const currentStockRes = await query(
      `SELECT on_hand FROM stock WHERE location_id = $1 AND product_id = $2`,
      [location_id, product_id]
    );

    const recordedQty = currentStockRes.rows.length > 0 ? currentStockRes.rows[0].on_hand : 0;
    const diff = physical_qty - recordedQty;

    const countRes = await query(`SELECT COUNT(*) FROM adjustments`);
    const nextSeq = parseInt(countRes.rows[0].count, 10) + 1;
    const reference = `WH/ADJ/${nextSeq.toString().padStart(4, '0')}`;

    const adjRes = await query(`
      INSERT INTO adjustments (reference, location_id, product_id, recorded_qty, physical_qty, difference, reason, responsible_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Done') RETURNING *
    `, [reference, location_id, product_id, recordedQty, physical_qty, diff, reason || 'Physical inventory count reconciliation', req.user.id]);

    // Apply adjustment to stock ledger & stock table
    await stockService.adjustStock({
      productId: product_id,
      locationId: location_id,
      physicalQty: physical_qty,
      reason: reason || 'Inventory Count Adjustment',
      reference,
      responsibleId: req.user.id
    });

    res.status(201).json(adjRes.rows[0]);
  } catch (err) {
    console.error('Adjustment error:', err);
    res.status(400).json({ error: err.message || 'Failed to apply inventory adjustment' });
  }
});

module.exports = router;

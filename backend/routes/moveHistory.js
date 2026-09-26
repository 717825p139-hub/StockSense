const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get Move History (All inventory movements)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { product_id, from_location_id, to_location_id, movement_type, search } = req.query;
    let sql = `
      SELECT sm.*,
             p.name AS product_name, p.sku, p.uom,
             fl.name AS from_location_name, fl.code AS from_location_code, fw.name AS from_warehouse_name,
             tl.name AS to_location_name, tl.code AS to_location_code, tw.name AS to_warehouse_name,
             u.name AS responsible_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      LEFT JOIN locations fl ON sm.from_location_id = fl.id
      LEFT JOIN warehouses fw ON fl.warehouse_id = fw.id
      LEFT JOIN locations tl ON sm.to_location_id = tl.id
      LEFT JOIN warehouses tw ON tl.warehouse_id = tw.id
      LEFT JOIN users u ON sm.responsible_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (sm.reference ILIKE $${params.length} OR p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`;
    }

    if (product_id) {
      params.push(product_id);
      sql += ` AND sm.product_id = $${params.length}`;
    }

    if (from_location_id) {
      params.push(from_location_id);
      sql += ` AND sm.from_location_id = $${params.length}`;
    }

    if (to_location_id) {
      params.push(to_location_id);
      sql += ` AND sm.to_location_id = $${params.length}`;
    }

    if (movement_type) {
      params.push(movement_type);
      sql += ` AND sm.movement_type = $${params.length}`;
    }

    sql += ` ORDER BY sm.created_at DESC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch move history error:', err);
    res.status(500).json({ error: 'Failed to fetch move history' });
  }
});

// Get Stock Ledger (Line-by-line balance tracking)
router.get('/ledger', authenticateToken, async (req, res) => {
  try {
    const { product_id, location_id } = req.query;
    let sql = `
      SELECT sl.*, p.name AS product_name, p.sku, p.uom,
             l.name AS location_name, l.code AS location_code,
             u.name AS responsible_name
      FROM stock_ledger sl
      JOIN products p ON sl.product_id = p.id
      JOIN locations l ON sl.location_id = l.id
      LEFT JOIN users u ON sl.responsible_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (product_id) {
      params.push(product_id);
      sql += ` AND sl.product_id = $${params.length}`;
    }

    if (location_id) {
      params.push(location_id);
      sql += ` AND sl.location_id = $${params.length}`;
    }

    sql += ` ORDER BY sl.created_at DESC`;
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stock ledger' });
  }
});

module.exports = router;

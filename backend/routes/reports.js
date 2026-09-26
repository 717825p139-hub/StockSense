const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// 1. Inventory Summary & Valuation Report
router.get('/inventory', authenticateToken, async (req, res) => {
  try {
    const { category_id, warehouse_id } = req.query;
    let sql = `
      SELECT p.id, p.sku, p.name AS product_name, c.name AS category_name, p.uom, p.unit_cost, p.reorder_level,
             w.name AS warehouse_name, l.name AS location_name, l.code AS location_code,
             s.on_hand, s.reserved, (s.on_hand - s.reserved) AS free_to_use,
             (s.on_hand * p.unit_cost) AS total_valuation
      FROM stock s
      JOIN products p ON s.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      JOIN locations l ON s.location_id = l.id
      JOIN warehouses w ON l.warehouse_id = w.id
      WHERE 1=1
    `;
    const params = [];
    if (category_id) {
      params.push(category_id);
      sql += ` AND p.category_id = $${params.length}`;
    }
    if (warehouse_id) {
      params.push(warehouse_id);
      sql += ` AND w.id = $${params.length}`;
    }
    sql += ` ORDER BY p.name, w.name, l.name`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate inventory report' });
  }
});

// 2. Low Stock & Reorder Alert Report
router.get('/low-stock', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT p.id, p.sku, p.name AS product_name, c.name AS category_name, p.uom, p.reorder_level,
             COALESCE(SUM(s.on_hand), 0) AS current_on_hand,
             CASE WHEN COALESCE(SUM(s.on_hand), 0) = 0 THEN 'OUT OF STOCK' ELSE 'LOW STOCK' END AS alert_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN stock s ON p.id = s.product_id
      GROUP BY p.id, c.name
      HAVING COALESCE(SUM(s.on_hand), 0) <= p.reorder_level
      ORDER BY current_on_hand ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate low stock report' });
  }
});

// 3. Movement Ledger Report
router.get('/movements', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, movement_type } = req.query;
    let sql = `
      SELECT sm.*, p.name AS product_name, p.sku, p.uom,
             fl.name AS from_location_name, tl.name AS to_location_name,
             u.name AS responsible_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      LEFT JOIN locations fl ON sm.from_location_id = fl.id
      LEFT JOIN locations tl ON sm.to_location_id = tl.id
      LEFT JOIN users u ON sm.responsible_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (movement_type) {
      params.push(movement_type);
      sql += ` AND sm.movement_type = $${params.length}`;
    }
    if (start_date) {
      params.push(start_date);
      sql += ` AND sm.created_at >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      sql += ` AND sm.created_at <= $${params.length}`;
    }
    sql += ` ORDER BY sm.created_at DESC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate movements report' });
  }
});

module.exports = router;

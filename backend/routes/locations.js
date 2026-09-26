const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get Locations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { warehouse_id } = req.query;
    let sql = `
      SELECT l.*, w.name AS warehouse_name, w.code AS warehouse_code,
             COALESCE(SUM(s.on_hand), 0) AS total_on_hand
      FROM locations l
      JOIN warehouses w ON l.warehouse_id = w.id
      LEFT JOIN stock s ON l.id = s.location_id
      WHERE 1=1
    `;
    const params = [];
    if (warehouse_id) {
      params.push(warehouse_id);
      sql += ` AND l.warehouse_id = $${params.length}`;
    }
    sql += ` GROUP BY l.id, w.name, w.code ORDER BY w.name, l.name`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Create Location
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { warehouse_id, name, code } = req.body;
    if (!warehouse_id || !name || !code) {
      return res.status(400).json({ error: 'Warehouse, Name and Code are required' });
    }

    const codeCheck = await query(`SELECT id FROM locations WHERE code = $1`, [code.trim().toUpperCase()]);
    if (codeCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Location Code already exists' });
    }

    const result = await query(
      `INSERT INTO locations (warehouse_id, name, code) VALUES ($1, $2, $3) RETURNING *`,
      [warehouse_id, name.trim(), code.trim().toUpperCase()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create location' });
  }
});

// Update Location
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { warehouse_id, name, code } = req.body;

    const codeCheck = await query(`SELECT id FROM locations WHERE code = $1 AND id != $2`, [code.trim().toUpperCase(), id]);
    if (codeCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Location Code already exists' });
    }

    const result = await query(
      `UPDATE locations SET warehouse_id = $1, name = $2, code = $3 WHERE id = $4 RETURNING *`,
      [warehouse_id, name.trim(), code.trim().toUpperCase(), id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Location not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Delete Location safely
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const stockCheck = await query(`SELECT id FROM stock WHERE location_id = $1 AND on_hand > 0`, [id]);
    if (stockCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete location containing active stock' });
    }
    await query(`DELETE FROM locations WHERE id = $1`, [id]);
    res.json({ message: 'Location deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

module.exports = router;

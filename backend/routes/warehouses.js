const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get Warehouses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT w.*, COUNT(l.id) AS location_count
      FROM warehouses w
      LEFT JOIN locations l ON w.id = l.warehouse_id
      GROUP BY w.id
      ORDER BY w.name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
});

// Get Warehouse by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const wh = await query(`SELECT * FROM warehouses WHERE id = $1`, [id]);
    if (wh.rows.length === 0) return res.status(404).json({ error: 'Warehouse not found' });
    
    const locs = await query(`SELECT * FROM locations WHERE warehouse_id = $1 ORDER BY name ASC`, [id]);
    const warehouse = wh.rows[0];
    warehouse.locations = locs.rows;
    res.json(warehouse);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch warehouse details' });
  }
});

// Create Warehouse
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, code, address } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Warehouse Name and Short Code are required' });
    }

    const codeCheck = await query(`SELECT id FROM warehouses WHERE code = $1`, [code.trim().toUpperCase()]);
    if (codeCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Warehouse Short Code already exists' });
    }

    const result = await query(
      `INSERT INTO warehouses (name, code, address) VALUES ($1, $2, $3) RETURNING *`,
      [name.trim(), code.trim().toUpperCase(), address || '']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create warehouse' });
  }
});

// Update Warehouse
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, address } = req.body;

    const codeCheck = await query(`SELECT id FROM warehouses WHERE code = $1 AND id != $2`, [code.trim().toUpperCase(), id]);
    if (codeCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Warehouse Short Code already exists' });
    }

    const result = await query(
      `UPDATE warehouses SET name = $1, code = $2, address = $3 WHERE id = $4 RETURNING *`,
      [name.trim(), code.trim().toUpperCase(), address || '', id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Warehouse not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update warehouse' });
  }
});

// Delete Warehouse safely
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const stockCheck = await query(`
      SELECT s.id FROM stock s
      JOIN locations l ON s.location_id = l.id
      WHERE l.warehouse_id = $1 AND s.on_hand > 0
    `, [id]);

    if (stockCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete warehouse with active stock' });
    }

    await query(`DELETE FROM warehouses WHERE id = $1`, [id]);
    res.json({ message: 'Warehouse deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete warehouse' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/db');
const stockService = require('../services/stockService');
const { authenticateToken } = require('../middleware/auth');

// Get Internal Transfers List
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, status } = req.query;
    let sql = `
      SELECT t.*,
             fl.name AS from_location_name, fl.code AS from_location_code, fw.name AS from_warehouse_name,
             tl.name AS to_location_name, tl.code AS to_location_code, tw.name AS to_warehouse_name,
             u.name AS responsible_name,
             COALESCE(SUM(ti.quantity), 0) AS total_quantity,
             COUNT(ti.id) AS item_count
      FROM transfers t
      JOIN locations fl ON t.from_location_id = fl.id
      JOIN warehouses fw ON fl.warehouse_id = fw.id
      JOIN locations tl ON t.to_location_id = tl.id
      JOIN warehouses tw ON tl.warehouse_id = tw.id
      LEFT JOIN users u ON t.responsible_id = u.id
      LEFT JOIN transfer_items ti ON t.id = ti.transfer_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (t.reference ILIKE $${params.length} OR fl.name ILIKE $${params.length} OR tl.name ILIKE $${params.length})`;
    }

    if (status) {
      params.push(status);
      sql += ` AND t.status = $${params.length}`;
    }

    sql += ` GROUP BY t.id, fl.name, fl.code, fw.name, tl.name, tl.code, tw.name, u.name ORDER BY t.created_at DESC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch internal transfers' });
  }
});

// Get Transfer Detail
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const trRes = await query(`
      SELECT t.*,
             fl.name AS from_location_name, fl.code AS from_location_code, fw.name AS from_warehouse_name,
             tl.name AS to_location_name, tl.code AS to_location_code, tw.name AS to_warehouse_name,
             u.name AS responsible_name
      FROM transfers t
      JOIN locations fl ON t.from_location_id = fl.id
      JOIN warehouses fw ON fl.warehouse_id = fw.id
      JOIN locations tl ON t.to_location_id = tl.id
      JOIN warehouses tw ON tl.warehouse_id = tw.id
      LEFT JOIN users u ON t.responsible_id = u.id
      WHERE t.id = $1
    `, [id]);

    if (trRes.rows.length === 0) return res.status(404).json({ error: 'Transfer not found' });

    const transfer = trRes.rows[0];
    const itemsRes = await query(`
      SELECT ti.*, p.sku, p.name AS product_name, p.uom
      FROM transfer_items ti
      JOIN products p ON ti.product_id = p.id
      WHERE ti.transfer_id = $1
    `, [id]);

    transfer.items = itemsRes.rows;
    res.json(transfer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transfer details' });
  }
});

// Create Internal Transfer
router.post('/', authenticateToken, async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { from_location_id, to_location_id, notes, items } = req.body;

    if (!from_location_id || !to_location_id) {
      throw new Error('From Location and To Location are required');
    }

    if (from_location_id === to_location_id) {
      throw new Error('Source and destination locations must be different');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('At least one product item is required');
    }

    const countRes = await client.query(`SELECT COUNT(*) FROM transfers`);
    const nextSeq = parseInt(countRes.rows[0].count, 10) + 1;
    const reference = `WH/INT/${nextSeq.toString().padStart(4, '0')}`;

    const trRes = await client.query(`
      INSERT INTO transfers (reference, from_location_id, to_location_id, status, responsible_id, notes)
      VALUES ($1, $2, $3, 'Draft', $4, $5) RETURNING *
    `, [reference, from_location_id, to_location_id, req.user.id, notes || '']);

    const transfer = trRes.rows[0];

    for (const item of items) {
      if (!item.product_id || item.quantity <= 0) {
        throw new Error('Invalid product or quantity in transfer line');
      }
      await client.query(`
        INSERT INTO transfer_items (transfer_id, product_id, quantity)
        VALUES ($1, $2, $3)
      `, [transfer.id, item.product_id, item.quantity]);
    }

    await client.query('COMMIT');
    res.status(201).json(transfer);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message || 'Failed to create internal transfer' });
  } finally {
    client.release();
  }
});

// Validate Internal Transfer -> Transfers stock between locations
router.post('/:id/validate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const trRes = await query(`SELECT * FROM transfers WHERE id = $1`, [id]);
    if (trRes.rows.length === 0) return res.status(404).json({ error: 'Transfer not found' });

    const transfer = trRes.rows[0];
    if (transfer.status === 'Done') return res.status(400).json({ error: 'Transfer has already been validated' });

    const itemsRes = await query(`SELECT * FROM transfer_items WHERE transfer_id = $1`, [id]);

    for (const item of itemsRes.rows) {
      await stockService.transferStock({
        productId: item.product_id,
        fromLocationId: transfer.from_location_id,
        toLocationId: transfer.to_location_id,
        qty: item.quantity,
        reference: transfer.reference,
        responsibleId: req.user.id
      });
    }

    const updated = await query(`
      UPDATE transfers SET status = 'Done', responsible_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *
    `, [req.user.id, id]);

    res.json({ message: 'Internal transfer completed successfully', transfer: updated.rows[0] });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to validate transfer' });
  }
});

module.exports = router;

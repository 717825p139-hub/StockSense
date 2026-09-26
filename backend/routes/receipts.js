const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/db');
const stockService = require('../services/stockService');
const { authenticateToken } = require('../middleware/auth');

// Get Suppliers
router.get('/suppliers', authenticateToken, async (req, res) => {
  try {
    const result = await query(`SELECT * FROM suppliers ORDER BY name ASC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Create Supplier
router.post('/suppliers', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name) return res.status(400).json({ error: 'Supplier name is required' });
    const result = await query(
      `INSERT INTO suppliers (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), email || '', phone || '', address || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

// Get Receipts List (with search by reference & contacts, status, date filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, status, scheduled_date } = req.query;
    let sql = `
      SELECT r.*, s.name AS supplier_name, s.email AS supplier_email,
             u.name AS responsible_name,
             COALESCE(SUM(ri.quantity), 0) AS total_quantity,
             COUNT(ri.id) AS item_count
      FROM receipts r
      LEFT JOIN suppliers s ON r.supplier_id = s.id
      LEFT JOIN users u ON r.responsible_id = u.id
      LEFT JOIN receipt_items ri ON r.id = ri.receipt_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (r.reference ILIKE $${params.length} OR s.name ILIKE $${params.length})`;
    }

    if (status) {
      params.push(status);
      sql += ` AND r.status = $${params.length}`;
    }

    if (scheduled_date) {
      params.push(scheduled_date);
      sql += ` AND r.scheduled_date = $${params.length}`;
    }

    sql += ` GROUP BY r.id, s.name, s.email, u.name ORDER BY r.created_at DESC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch receipts error:', err);
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
});

// Get Receipt Detail by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const recRes = await query(`
      SELECT r.*, s.name AS supplier_name, s.email AS supplier_email, s.phone AS supplier_phone,
             u.name AS responsible_name
      FROM receipts r
      LEFT JOIN suppliers s ON r.supplier_id = s.id
      LEFT JOIN users u ON r.responsible_id = u.id
      WHERE r.id = $1
    `, [id]);

    if (recRes.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    const receipt = recRes.rows[0];

    const itemsRes = await query(`
      SELECT ri.*, p.sku, p.name AS product_name, p.uom, p.unit_cost
      FROM receipt_items ri
      JOIN products p ON ri.product_id = p.id
      WHERE ri.receipt_id = $1
      ORDER BY ri.id ASC
    `, [id]);

    receipt.items = itemsRes.rows;
    res.json(receipt);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch receipt details' });
  }
});

// Create Receipt (Status default Draft)
router.post('/', authenticateToken, async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { supplier_id, scheduled_date, notes, items, location_id } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('At least one product item is required');
    }

    // Auto-generate reference number WH/IN/XXXX
    const countRes = await client.query(`SELECT COUNT(*) FROM receipts`);
    const nextSeq = parseInt(countRes.rows[0].count, 10) + 1;
    const reference = `WH/IN/${nextSeq.toString().padStart(4, '0')}`;

    const recRes = await client.query(`
      INSERT INTO receipts (reference, supplier_id, scheduled_date, status, responsible_id, notes)
      VALUES ($1, $2, $3, 'Draft', $4, $5) RETURNING *
    `, [reference, supplier_id || null, scheduled_date || new Date(), req.user.id, notes || '']);

    const receipt = recRes.rows[0];

    for (const item of items) {
      if (!item.product_id || item.quantity <= 0) {
        throw new Error('Invalid product or quantity in receipt line');
      }
      await client.query(`
        INSERT INTO receipt_items (receipt_id, product_id, quantity)
        VALUES ($1, $2, $3)
      `, [receipt.id, item.product_id, item.quantity]);
    }

    await client.query('COMMIT');
    res.status(201).json(receipt);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create receipt error:', err);
    res.status(400).json({ error: err.message || 'Failed to create receipt' });
  } finally {
    client.release();
  }
});

// Validate Receipt -> Stock INCREASES, Status becomes 'Done'
router.post('/:id/validate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { target_location_id } = req.body; // Location to receive products into

    const recRes = await query(`SELECT * FROM receipts WHERE id = $1`, [id]);
    if (recRes.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    const receipt = recRes.rows[0];
    if (receipt.status === 'Done') {
      return res.status(400).json({ error: 'Receipt has already been validated' });
    }
    if (receipt.status === 'Canceled') {
      return res.status(400).json({ error: 'Cannot validate a canceled receipt' });
    }

    // Get receipt items
    const itemsRes = await query(`SELECT * FROM receipt_items WHERE receipt_id = $1`, [id]);
    if (itemsRes.rows.length === 0) {
      return res.status(400).json({ error: 'Receipt has no product items to validate' });
    }

    // Determine target location (default to Rack A in Main Warehouse if not passed)
    let destLocId = target_location_id;
    if (!destLocId) {
      const defaultLoc = await query(`SELECT id FROM locations WHERE code = 'WH/STOCK1' LIMIT 1`);
      destLocId = defaultLoc.rows.length > 0 ? defaultLoc.rows[0].id : (await query(`SELECT id FROM locations LIMIT 1`)).rows[0].id;
    }

    // Execute stock increase for each line
    for (const item of itemsRes.rows) {
      await stockService.increaseStock({
        productId: item.product_id,
        locationId: destLocId,
        qty: item.quantity,
        reference: receipt.reference,
        responsibleId: req.user.id,
        movementType: 'Receipt'
      });
    }

    // Update receipt status to 'Done'
    const updated = await query(`
      UPDATE receipts SET status = 'Done', responsible_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *
    `, [req.user.id, id]);

    res.json({ message: 'Receipt validated successfully and stock increased', receipt: updated.rows[0] });
  } catch (err) {
    console.error('Validate receipt error:', err);
    res.status(500).json({ error: err.message || 'Failed to validate receipt' });
  }
});

// Update Status (e.g. Draft -> Ready)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Draft', 'Ready', 'Canceled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const result = await query(`UPDATE receipts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`, [status, id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update receipt status' });
  }
});

// Cancel Receipt
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const recRes = await query(`SELECT * FROM receipts WHERE id = $1`, [id]);
    if (recRes.rows.length === 0) return res.status(404).json({ error: 'Receipt not found' });
    if (recRes.rows[0].status === 'Done') return res.status(400).json({ error: 'Cannot cancel an already completed receipt' });

    const result = await query(`UPDATE receipts SET status = 'Canceled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`, [id]);
    res.json({ message: 'Receipt canceled', receipt: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel receipt' });
  }
});

module.exports = router;

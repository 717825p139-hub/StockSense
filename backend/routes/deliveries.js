const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/db');
const stockService = require('../services/stockService');
const { authenticateToken } = require('../middleware/auth');

// Get Customers
router.get('/customers', authenticateToken, async (req, res) => {
  try {
    const result = await query(`SELECT * FROM customers ORDER BY name ASC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Create Customer
router.post('/customers', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name) return res.status(400).json({ error: 'Customer name is required' });
    const result = await query(
      `INSERT INTO customers (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), email || '', phone || '', address || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Get Deliveries List (with search by reference & contact, status, date filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, status, scheduled_date } = req.query;
    let sql = `
      SELECT d.*, c.name AS customer_name, c.email AS customer_email,
             u.name AS responsible_name,
             COALESCE(SUM(di.quantity), 0) AS total_quantity,
             COUNT(di.id) AS item_count
      FROM deliveries d
      LEFT JOIN customers c ON d.customer_id = c.id
      LEFT JOIN users u ON d.responsible_id = u.id
      LEFT JOIN delivery_items di ON d.id = di.delivery_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (d.reference ILIKE $${params.length} OR c.name ILIKE $${params.length})`;
    }

    if (status) {
      params.push(status);
      sql += ` AND d.status = $${params.length}`;
    }

    if (scheduled_date) {
      params.push(scheduled_date);
      sql += ` AND d.scheduled_date = $${params.length}`;
    }

    sql += ` GROUP BY d.id, c.name, c.email, u.name ORDER BY d.created_at DESC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch deliveries error:', err);
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
});

// Get Delivery Detail by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const delRes = await query(`
      SELECT d.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone, c.address AS delivery_address,
             u.name AS responsible_name
      FROM deliveries d
      LEFT JOIN customers c ON d.customer_id = c.id
      LEFT JOIN users u ON d.responsible_id = u.id
      WHERE d.id = $1
    `, [id]);

    if (delRes.rows.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const delivery = delRes.rows[0];

    const itemsRes = await query(`
      SELECT di.*, p.sku, p.name AS product_name, p.uom, p.unit_cost
      FROM delivery_items di
      JOIN products p ON di.product_id = p.id
      WHERE di.delivery_id = $1
      ORDER BY di.id ASC
    `, [id]);

    delivery.items = itemsRes.rows;
    res.json(delivery);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch delivery details' });
  }
});

// Create Delivery Order (Default status: Draft)
router.post('/', authenticateToken, async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { customer_id, scheduled_date, notes, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('At least one product item is required');
    }

    // Auto-generate reference WH/OUT/XXXX
    const countRes = await client.query(`SELECT COUNT(*) FROM deliveries`);
    const nextSeq = parseInt(countRes.rows[0].count, 10) + 1;
    const reference = `WH/OUT/${nextSeq.toString().padStart(4, '0')}`;

    const delRes = await client.query(`
      INSERT INTO deliveries (reference, customer_id, scheduled_date, status, responsible_id, notes)
      VALUES ($1, $2, $3, 'Draft', $4, $5) RETURNING *
    `, [reference, customer_id || null, scheduled_date || new Date(), req.user.id, notes || '']);

    const delivery = delRes.rows[0];

    for (const item of items) {
      if (!item.product_id || item.quantity <= 0) {
        throw new Error('Invalid product or quantity in delivery line');
      }
      await client.query(`
        INSERT INTO delivery_items (delivery_id, product_id, quantity)
        VALUES ($1, $2, $3)
      `, [delivery.id, item.product_id, item.quantity]);
    }

    await client.query('COMMIT');
    res.status(201).json(delivery);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create delivery error:', err);
    res.status(400).json({ error: err.message || 'Failed to create delivery order' });
  } finally {
    client.release();
  }
});

// Validate Delivery -> Checks Stock, Decreases Stock, Marks Status 'Done'
router.post('/:id/validate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { source_location_id } = req.body; // Source location to pick from

    const delRes = await query(`SELECT * FROM deliveries WHERE id = $1`, [id]);
    if (delRes.rows.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const delivery = delRes.rows[0];
    if (delivery.status === 'Done') {
      return res.status(400).json({ error: 'Delivery has already been validated' });
    }
    if (delivery.status === 'Canceled') {
      return res.status(400).json({ error: 'Cannot validate a canceled delivery' });
    }

    const itemsRes = await query(`SELECT * FROM delivery_items WHERE delivery_id = $1`, [id]);
    if (itemsRes.rows.length === 0) {
      return res.status(400).json({ error: 'Delivery has no product items to validate' });
    }

    let srcLocId = source_location_id;
    if (!srcLocId) {
      const defaultLoc = await query(`SELECT id FROM locations WHERE code = 'WH/STOCK1' LIMIT 1`);
      srcLocId = defaultLoc.rows.length > 0 ? defaultLoc.rows[0].id : (await query(`SELECT id FROM locations LIMIT 1`)).rows[0].id;
    }

    // Execute decrease for each line
    for (const item of itemsRes.rows) {
      await stockService.decreaseStock({
        productId: item.product_id,
        locationId: srcLocId,
        qty: item.quantity,
        reference: delivery.reference,
        responsibleId: req.user.id,
        movementType: 'Delivery'
      });
    }

    const updated = await query(`
      UPDATE deliveries SET status = 'Done', responsible_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *
    `, [req.user.id, id]);

    res.json({ message: 'Delivery validated successfully and stock deducted', delivery: updated.rows[0] });
  } catch (err) {
    console.error('Validate delivery error:', err);
    res.status(400).json({ error: err.message || 'Failed to validate delivery order' });
  }
});

// Update Status (e.g. Draft -> Waiting -> Ready)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Draft', 'Waiting', 'Ready', 'Canceled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const result = await query(`UPDATE deliveries SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`, [status, id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update delivery status' });
  }
});

// Cancel Delivery
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const delRes = await query(`SELECT * FROM deliveries WHERE id = $1`, [id]);
    if (delRes.rows.length === 0) return res.status(404).json({ error: 'Delivery not found' });
    if (delRes.rows[0].status === 'Done') return res.status(400).json({ error: 'Cannot cancel an already completed delivery' });

    const result = await query(`UPDATE deliveries SET status = 'Canceled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`, [id]);
    res.json({ message: 'Delivery order canceled', delivery: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel delivery' });
  }
});

module.exports = router;

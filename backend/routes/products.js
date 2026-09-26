const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const result = await query(`SELECT * FROM categories ORDER BY name ASC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category
router.post('/categories', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });
    const result = await query(`INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *`, [name, description]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message.includes('unique') ? 'Category name already exists' : 'Failed to create category' });
  }
});

// Get Products (with search, category filter, stock calculation)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, category_id } = req.query;
    let sql = `
      SELECT p.*, c.name AS category_name,
             COALESCE(SUM(s.on_hand), 0) AS total_on_hand,
             COALESCE(SUM(s.reserved), 0) AS total_reserved,
             COALESCE(SUM(s.on_hand - s.reserved), 0) AS total_free_to_use
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN stock s ON p.id = s.product_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`;
    }

    if (category_id) {
      params.push(category_id);
      sql += ` AND p.category_id = $${params.length}`;
    }

    sql += ` GROUP BY p.id, c.name ORDER BY p.name ASC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get Product by ID with location breakdown
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const prodRes = await query(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `, [id]);

    if (prodRes.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = prodRes.rows[0];

    const stockRes = await query(`
      SELECT s.id, s.on_hand, s.reserved, (s.on_hand - s.reserved) AS free_to_use,
             l.id AS location_id, l.name AS location_name, l.code AS location_code,
             w.id AS warehouse_id, w.name AS warehouse_name, w.code AS warehouse_code
      FROM stock s
      JOIN locations l ON s.location_id = l.id
      JOIN warehouses w ON l.warehouse_id = w.id
      WHERE s.product_id = $1
      ORDER BY w.name, l.name
    `, [id]);

    product.stock_by_location = stockRes.rows;
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

// Create Product
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { sku, name, category_id, uom, unit_cost, reorder_level } = req.body;
    if (!sku || !name) {
      return res.status(400).json({ error: 'SKU and Product Name are required' });
    }

    // Check SKU duplicate
    const skuCheck = await query(`SELECT id FROM products WHERE sku = $1`, [sku.trim()]);
    if (skuCheck.rows.length > 0) {
      return res.status(400).json({ error: 'SKU already exists' });
    }

    const result = await query(
      `INSERT INTO products (sku, name, category_id, uom, unit_cost, reorder_level)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [sku.trim(), name.trim(), category_id || null, uom || 'pcs', unit_cost || 0, reorder_level || 10]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update Product
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, name, category_id, uom, unit_cost, reorder_level, is_active } = req.body;

    const skuCheck = await query(`SELECT id FROM products WHERE sku = $1 AND id != $2`, [sku.trim(), id]);
    if (skuCheck.rows.length > 0) {
      return res.status(400).json({ error: 'SKU is already used by another product' });
    }

    const result = await query(
      `UPDATE products
       SET sku = $1, name = $2, category_id = $3, uom = $4, unit_cost = $5, reorder_level = $6, is_active = $7
       WHERE id = $8 RETURNING *`,
      [sku.trim(), name.trim(), category_id || null, uom || 'pcs', unit_cost || 0, reorder_level || 10, is_active ?? true, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete Product
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM products WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Cannot delete product that has existing inventory movements' });
  }
});

module.exports = router;

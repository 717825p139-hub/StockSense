const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

router.post('/query', authenticateToken, async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const qLower = question.toLowerCase();

    // 1. Low stock query
    if (qLower.includes('low') || qLower.includes('reorder')) {
      const lowStockRes = await query(`
        SELECT p.name, p.sku, p.reorder_level, COALESCE(SUM(s.on_hand), 0) as on_hand
        FROM products p
        LEFT JOIN stock s ON p.id = s.product_id
        GROUP BY p.id
        HAVING COALESCE(SUM(s.on_hand), 0) <= p.reorder_level
      `);

      if (lowStockRes.rows.length === 0) {
        return res.json({ answer: 'All products currently have adequate stock above their reorder levels.' });
      }

      const list = lowStockRes.rows.map(p => `• **${p.name}** (SKU: ${p.sku}) - On Hand: ${p.on_hand}, Reorder Level: ${p.reorder_level}`).join('\n');
      return res.json({ answer: `Here are the products currently low in stock:\n\n${list}` });
    }

    // 2. Receipts / Late query
    if (qLower.includes('receipt') || qLower.includes('incoming')) {
      const recRes = await query(`
        SELECT r.reference, s.name as supplier, r.scheduled_date, r.status
        FROM receipts r
        LEFT JOIN suppliers s ON r.supplier_id = s.id
        WHERE r.status IN ('Draft', 'Ready')
        ORDER BY r.scheduled_date ASC
      `);

      if (recRes.rows.length === 0) {
        return res.json({ answer: 'There are currently no pending receipts.' });
      }

      const list = recRes.rows.map(r => `• **${r.reference}** from ${r.supplier || 'Unknown'} (Scheduled: ${new Date(r.scheduled_date).toLocaleDateString()}, Status: ${r.status})`).join('\n');
      return res.json({ answer: `Found ${recRes.rows.length} pending receipt(s):\n\n${list}` });
    }

    // 3. Deliveries / Pending query
    if (qLower.includes('delivery') || qLower.includes('pending') || qLower.includes('outgoing')) {
      const delRes = await query(`
        SELECT d.reference, c.name as customer, d.scheduled_date, d.status
        FROM deliveries d
        LEFT JOIN customers c ON d.customer_id = c.id
        WHERE d.status IN ('Draft', 'Waiting', 'Ready')
        ORDER BY d.scheduled_date ASC
      `);

      if (delRes.rows.length === 0) {
        return res.json({ answer: 'There are currently no pending delivery orders.' });
      }

      const list = delRes.rows.map(d => `• **${d.reference}** to ${d.customer || 'Unknown'} (Scheduled: ${new Date(d.scheduled_date).toLocaleDateString()}, Status: ${d.status})`).join('\n');
      return res.json({ answer: `Found ${delRes.rows.length} pending delivery order(s):\n\n${list}` });
    }

    // 4. Specific Product search (e.g. Steel Rod, Laptop, Chair)
    const productsRes = await query(`
      SELECT p.id, p.name, p.sku, p.uom, p.unit_cost, p.reorder_level,
             COALESCE(SUM(s.on_hand), 0) as total_on_hand
      FROM products p
      LEFT JOIN stock s ON p.id = s.product_id
      GROUP BY p.id
    `);

    const matchedProduct = productsRes.rows.find(p => qLower.includes(p.name.toLowerCase()) || qLower.includes(p.sku.toLowerCase()));
    if (matchedProduct) {
      const locationRes = await query(`
        SELECT s.on_hand, l.name as location_name, l.code as location_code, w.name as warehouse_name
        FROM stock s
        JOIN locations l ON s.location_id = l.id
        JOIN warehouses w ON l.warehouse_id = w.id
        WHERE s.product_id = $1 AND s.on_hand > 0
      `, [matchedProduct.id]);

      let locInfo = 'No stock recorded in any location.';
      if (locationRes.rows.length > 0) {
        locInfo = locationRes.rows.map(l => `  - ${l.warehouse_name} / ${l.location_name} (${l.location_code}): **${l.on_hand} ${matchedProduct.uom}**`).join('\n');
      }

      return res.json({
        answer: `**${matchedProduct.name}** (SKU: ${matchedProduct.sku})\n• Total On-Hand: **${matchedProduct.total_on_hand} ${matchedProduct.uom}**\n• Unit Cost: ₹${matchedProduct.unit_cost}\n• Location Breakdown:\n${locInfo}`
      });
    }

    // 5. Default general overview fallback
    const summaryRes = await query(`
      SELECT
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM receipts WHERE status IN ('Draft', 'Ready')) as pending_receipts,
        (SELECT COUNT(*) FROM deliveries WHERE status IN ('Draft', 'Waiting', 'Ready')) as pending_deliveries,
        (SELECT COUNT(*) FROM stock_movements) as total_movements
    `);

    const s = summaryRes.rows[0];
    res.json({
      answer: `I am StockSense AI Assistant. Here is your system snapshot:\n• Total Products Tracked: **${s.total_products}**\n• Pending Receipts: **${s.pending_receipts}**\n• Pending Deliveries: **${s.pending_deliveries}**\n• Total Historical Movements: **${s.total_movements}**\n\nAsk me about specific products (e.g. "How much Steel Rod is available?"), low stock alerts, or pending receipts and deliveries!`
    });
  } catch (err) {
    console.error('AI assistant error:', err);
    res.status(500).json({ error: 'Failed to process AI query' });
  }
});

module.exports = router;

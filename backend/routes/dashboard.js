const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Receipts KPIs
    const receiptsToReceive = await query(`
      SELECT COUNT(*) FROM receipts WHERE status IN ('Draft', 'Ready')
    `);
    const receiptsLate = await query(`
      SELECT COUNT(*) FROM receipts WHERE status IN ('Draft', 'Ready') AND scheduled_date < $1
    `, [todayStr]);
    const receiptsToday = await query(`
      SELECT COUNT(*) FROM receipts WHERE scheduled_date = $1 AND status != 'Canceled'
    `, [todayStr]);

    // 2. Deliveries KPIs
    const deliveriesToDeliver = await query(`
      SELECT COUNT(*) FROM deliveries WHERE status IN ('Draft', 'Waiting', 'Ready')
    `);
    const deliveriesLate = await query(`
      SELECT COUNT(*) FROM deliveries WHERE status IN ('Draft', 'Waiting', 'Ready') AND scheduled_date < $1
    `, [todayStr]);
    const deliveriesToday = await query(`
      SELECT COUNT(*) FROM deliveries WHERE scheduled_date = $1 AND status != 'Canceled'
    `, [todayStr]);
    const deliveriesWaiting = await query(`
      SELECT COUNT(*) FROM deliveries WHERE status = 'Waiting'
    `);

    // 3. Stock Summary
    const stockSummary = await query(`
      SELECT
        COUNT(DISTINCT p.id) AS total_products,
        COALESCE(SUM(s.on_hand), 0) AS total_on_hand,
        COUNT(DISTINCT CASE WHEN (s.on_hand <= p.reorder_level AND s.on_hand > 0) THEN p.id END) AS low_stock_count,
        COUNT(DISTINCT CASE WHEN (s.on_hand = 0 OR s.on_hand IS NULL) THEN p.id END) AS out_of_stock_count
      FROM products p
      LEFT JOIN stock s ON p.id = s.product_id
    `);

    // 4. Low stock product list
    const lowStockProducts = await query(`
      SELECT p.id, p.sku, p.name, p.uom, p.reorder_level, COALESCE(SUM(s.on_hand), 0) AS on_hand
      FROM products p
      LEFT JOIN stock s ON p.id = s.product_id
      GROUP BY p.id
      HAVING COALESCE(SUM(s.on_hand), 0) <= p.reorder_level
      ORDER BY on_hand ASC
      LIMIT 5
    `);

    // 5. Recent Movements
    const recentMovements = await query(`
      SELECT sm.*, p.name AS product_name, p.sku, p.uom,
             fl.name AS from_location_name, tl.name AS to_location_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      LEFT JOIN locations fl ON sm.from_location_id = fl.id
      LEFT JOIN locations tl ON sm.to_location_id = tl.id
      ORDER BY sm.created_at DESC
      LIMIT 8
    `);

    res.json({
      receipts: {
        to_receive: parseInt(receiptsToReceive.rows[0].count, 10),
        late: parseInt(receiptsLate.rows[0].count, 10),
        scheduled_today: parseInt(receiptsToday.rows[0].count, 10)
      },
      deliveries: {
        to_deliver: parseInt(deliveriesToDeliver.rows[0].count, 10),
        late: parseInt(deliveriesLate.rows[0].count, 10),
        scheduled_today: parseInt(deliveriesToday.rows[0].count, 10),
        waiting_for_stock: parseInt(deliveriesWaiting.rows[0].count, 10)
      },
      stock: {
        total_products: parseInt(stockSummary.rows[0].total_products, 10),
        total_on_hand: parseInt(stockSummary.rows[0].total_on_hand, 10),
        low_stock_count: parseInt(stockSummary.rows[0].low_stock_count, 10),
        out_of_stock_count: parseInt(stockSummary.rows[0].out_of_stock_count, 10),
        low_stock_list: lowStockProducts.rows
      },
      recent_movements: recentMovements.rows
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

module.exports = router;

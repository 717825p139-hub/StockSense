const { getClient, query } = require('../config/db');

class StockService {
  /**
   * Increase Stock (used by Receipt validation)
   */
  async increaseStock({ productId, locationId, qty, reference, responsibleId, movementType = 'Receipt' }) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Get current stock
      const stockRes = await client.query(
        `SELECT id, on_hand, reserved FROM stock WHERE product_id = $1 AND location_id = $2 FOR UPDATE`,
        [productId, locationId]
      );

      let prevQty = 0;
      let newQty = qty;

      if (stockRes.rows.length > 0) {
        prevQty = stockRes.rows[0].on_hand;
        newQty = prevQty + qty;
        await client.query(
          `UPDATE stock SET on_hand = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [newQty, stockRes.rows[0].id]
        );
      } else {
        await client.query(
          `INSERT INTO stock (product_id, location_id, on_hand, reserved) VALUES ($1, $2, $3, 0)`,
          [productId, locationId, newQty]
        );
      }

      // 2. Create Movement Record
      await client.query(
        `INSERT INTO stock_movements (reference, product_id, from_location_id, to_location_id, quantity, movement_type, previous_qty, new_qty, responsible_id)
         VALUES ($1, $2, NULL, $3, $4, $5, $6, $7, $8)`,
        [reference, productId, locationId, qty, movementType, prevQty, newQty, responsibleId]
      );

      // 3. Create Ledger Entry
      await client.query(
        `INSERT INTO stock_ledger (reference, product_id, location_id, change_qty, balance_after, movement_type, responsible_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [reference, productId, locationId, qty, newQty, movementType, responsibleId]
      );

      await client.query('COMMIT');
      return { success: true, prevQty, newQty };
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error in increaseStock:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Decrease Stock (used by Delivery validation)
   */
  async decreaseStock({ productId, locationId, qty, reference, responsibleId, movementType = 'Delivery' }) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const stockRes = await client.query(
        `SELECT id, on_hand, reserved FROM stock WHERE product_id = $1 AND location_id = $2 FOR UPDATE`,
        [productId, locationId]
      );

      if (stockRes.rows.length === 0 || stockRes.rows[0].on_hand < qty) {
        const available = stockRes.rows.length > 0 ? stockRes.rows[0].on_hand : 0;
        throw new Error(`Insufficient stock. Available: ${available}, Requested: ${qty}`);
      }

      const prevQty = stockRes.rows[0].on_hand;
      const newQty = prevQty - qty;

      await client.query(
        `UPDATE stock SET on_hand = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [newQty, stockRes.rows[0].id]
      );

      // Create Movement Record
      await client.query(
        `INSERT INTO stock_movements (reference, product_id, from_location_id, to_location_id, quantity, movement_type, previous_qty, new_qty, responsible_id)
         VALUES ($1, $2, $3, NULL, $4, $5, $6, $7, $8)`,
        [reference, productId, locationId, qty, movementType, prevQty, newQty, responsibleId]
      );

      // Create Ledger Entry
      await client.query(
        `INSERT INTO stock_ledger (reference, product_id, location_id, change_qty, balance_after, movement_type, responsible_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [reference, productId, locationId, -qty, newQty, movementType, responsibleId]
      );

      await client.query('COMMIT');
      return { success: true, prevQty, newQty };
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error in decreaseStock:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Transfer Stock between locations (Internal Transfer)
   */
  async transferStock({ productId, fromLocationId, toLocationId, qty, reference, responsibleId }) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Check source location stock
      const sourceRes = await client.query(
        `SELECT id, on_hand FROM stock WHERE product_id = $1 AND location_id = $2 FOR UPDATE`,
        [productId, fromLocationId]
      );

      if (sourceRes.rows.length === 0 || sourceRes.rows[0].on_hand < qty) {
        const avail = sourceRes.rows.length > 0 ? sourceRes.rows[0].on_hand : 0;
        throw new Error(`Insufficient stock at source location. Available: ${avail}, Requested: ${qty}`);
      }

      const srcPrev = sourceRes.rows[0].on_hand;
      const srcNew = srcPrev - qty;

      await client.query(
        `UPDATE stock SET on_hand = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [srcNew, sourceRes.rows[0].id]
      );

      // Destination location stock
      const destRes = await client.query(
        `SELECT id, on_hand FROM stock WHERE product_id = $1 AND location_id = $2 FOR UPDATE`,
        [productId, toLocationId]
      );

      let destPrev = 0;
      let destNew = qty;

      if (destRes.rows.length > 0) {
        destPrev = destRes.rows[0].on_hand;
        destNew = destPrev + qty;
        await client.query(
          `UPDATE stock SET on_hand = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [destNew, destRes.rows[0].id]
        );
      } else {
        await client.query(
          `INSERT INTO stock (product_id, location_id, on_hand, reserved) VALUES ($1, $2, $3, 0)`,
          [productId, toLocationId, destNew]
        );
      }

      // Movement Record
      await client.query(
        `INSERT INTO stock_movements (reference, product_id, from_location_id, to_location_id, quantity, movement_type, previous_qty, new_qty, responsible_id)
         VALUES ($1, $2, $3, $4, $5, 'Internal Transfer', $6, $7, $8)`,
        [reference, productId, fromLocationId, toLocationId, qty, srcPrev, srcNew, responsibleId]
      );

      // Ledger Entries for source and destination
      await client.query(
        `INSERT INTO stock_ledger (reference, product_id, location_id, change_qty, balance_after, movement_type, responsible_id)
         VALUES ($1, $2, $3, $4, $5, 'Internal Transfer (Out)', $6)`,
        [reference, productId, fromLocationId, -qty, srcNew, responsibleId]
      );
      await client.query(
        `INSERT INTO stock_ledger (reference, product_id, location_id, change_qty, balance_after, movement_type, responsible_id)
         VALUES ($1, $2, $3, $4, $5, 'Internal Transfer (In)', $6)`,
        [reference, productId, toLocationId, qty, destNew, responsibleId]
      );

      await client.query('COMMIT');
      return { success: true, srcNew, destNew };
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error in transferStock:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Adjust Stock (Inventory Adjustment)
   */
  async adjustStock({ productId, locationId, physicalQty, reason, reference, responsibleId }) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const stockRes = await client.query(
        `SELECT id, on_hand FROM stock WHERE product_id = $1 AND location_id = $2 FOR UPDATE`,
        [productId, locationId]
      );

      let prevQty = 0;
      if (stockRes.rows.length > 0) {
        prevQty = stockRes.rows[0].on_hand;
      }

      const diff = physicalQty - prevQty;

      if (stockRes.rows.length > 0) {
        await client.query(
          `UPDATE stock SET on_hand = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [physicalQty, stockRes.rows[0].id]
        );
      } else {
        await client.query(
          `INSERT INTO stock (product_id, location_id, on_hand, reserved) VALUES ($1, $2, $3, 0)`,
          [productId, locationId, physicalQty]
        );
      }

      // Movement Record
      await client.query(
        `INSERT INTO stock_movements (reference, product_id, from_location_id, to_location_id, quantity, movement_type, previous_qty, new_qty, responsible_id)
         VALUES ($1, $2, $3, $3, $4, 'Adjustment', $5, $6, $7)`,
        [reference, productId, locationId, Math.abs(diff), prevQty, physicalQty, responsibleId]
      );

      // Ledger Entry
      await client.query(
        `INSERT INTO stock_ledger (reference, product_id, location_id, change_qty, balance_after, movement_type, responsible_id)
         VALUES ($1, $2, $3, $4, $5, 'Adjustment', $6)`,
        [reference, productId, locationId, diff, physicalQty, responsibleId]
      );

      await client.query('COMMIT');
      return { success: true, prevQty, physicalQty, diff };
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error in adjustStock:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  async getStock(productId = null, locationId = null) {
    let sql = `
      SELECT s.id, s.product_id, p.name AS product_name, p.sku, p.uom, p.unit_cost, p.reorder_level,
             s.location_id, l.name AS location_name, l.code AS location_code,
             w.name AS warehouse_name, w.code AS warehouse_code,
             s.on_hand, s.reserved, (s.on_hand - s.reserved) AS free_to_use
      FROM stock s
      JOIN products p ON s.product_id = p.id
      JOIN locations l ON s.location_id = l.id
      JOIN warehouses w ON l.warehouse_id = w.id
      WHERE 1=1
    `;
    const params = [];
    if (productId) {
      params.push(productId);
      sql += ` AND s.product_id = $${params.length}`;
    }
    if (locationId) {
      params.push(locationId);
      sql += ` AND s.location_id = $${params.length}`;
    }
    sql += ` ORDER BY p.name ASC, w.name ASC`;
    const res = await query(sql, params);
    return res.rows;
  }
}

module.exports = new StockService();

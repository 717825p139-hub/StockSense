const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { initDb } = require('./initDb');

async function seed() {
  await initDb();
  console.log('Seeding demo data...');

  try {
    // Clear existing data in reverse order
    await query(`
      TRUNCATE TABLE stock_ledger, stock_movements, adjustments, transfer_items, transfers,
      delivery_items, deliveries, receipt_items, receipts, stock, customers, suppliers,
      locations, warehouses, products, categories, users RESTART IDENTITY CASCADE
    `);

    // 1. Create Demo User
    const passwordHash = await bcrypt.hash('admin123', 10);
    const userRes = await query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Admin Manager', 'admin@stocksense.com', passwordHash, 'Inventory Manager']
    );
    const userId = userRes.rows[0].id;
    console.log('User created: admin@stocksense.com / admin123');

    // 2. Categories
    const catRaw = await query(`INSERT INTO categories (name, description) VALUES ('Raw Materials', 'Base materials for manufacturing') RETURNING id`);
    const catFin = await query(`INSERT INTO categories (name, description) VALUES ('Finished Goods', 'Completed products ready for sale') RETURNING id`);
    const catElec = await query(`INSERT INTO categories (name, description) VALUES ('Electronics', 'Electronic hardware and gadgets') RETURNING id`);
    const catOff = await query(`INSERT INTO categories (name, description) VALUES ('Office Supplies', 'General office consumables') RETURNING id`);

    // 3. Warehouses
    const whMain = await query(`INSERT INTO warehouses (name, code, address) VALUES ('Main Warehouse', 'WH', 'Plot 42, Industrial Zone, Hyderabad') RETURNING id`);
    const whProd = await query(`INSERT INTO warehouses (name, code, address) VALUES ('Production Warehouse', 'PWH', 'Unit 3, Manufacturing Hub, Hyderabad') RETURNING id`);
    const whMainId = whMain.rows[0].id;
    const whProdId = whProd.rows[0].id;

    // 4. Locations
    const locRackA = await query(`INSERT INTO locations (warehouse_id, name, code) VALUES ($1, 'Rack A', 'WH/STOCK1') RETURNING id`, [whMainId]);
    const locRackB = await query(`INSERT INTO locations (warehouse_id, name, code) VALUES ($1, 'Rack B', 'WH/STOCK2') RETURNING id`, [whMainId]);
    const locFG = await query(`INSERT INTO locations (warehouse_id, name, code) VALUES ($1, 'Finished Goods Area', 'WH/FG1') RETURNING id`, [whMainId]);
    const locProd = await query(`INSERT INTO locations (warehouse_id, name, code) VALUES ($1, 'Production Rack', 'PWH/PROD1') RETURNING id`, [whProdId]);

    const rackAId = locRackA.rows[0].id;
    const rackBId = locRackB.rows[0].id;
    const fgId = locFG.rows[0].id;
    const prodRackId = locProd.rows[0].id;

    // 5. Products
    const pSteel = await query(`
      INSERT INTO products (sku, name, category_id, uom, unit_cost, reorder_level)
      VALUES ('STEEL001', 'Steel Rod', $1, 'kg', 150.00, 20) RETURNING id
    `, [catRaw.rows[0].id]);
    
    const pChair = await query(`
      INSERT INTO products (sku, name, category_id, uom, unit_cost, reorder_level)
      VALUES ('CHAIR001', 'Office Chair', $1, 'pcs', 5000.00, 10) RETURNING id
    `, [catOff.rows[0].id]);

    const pLaptop = await query(`
      INSERT INTO products (sku, name, category_id, uom, unit_cost, reorder_level)
      VALUES ('LAP001', 'Laptop', $1, 'pcs', 45000.00, 5) RETURNING id
    `, [catElec.rows[0].id]);

    const pPaper = await query(`
      INSERT INTO products (sku, name, category_id, uom, unit_cost, reorder_level)
      VALUES ('PAPER001', 'Printer Paper', $1, 'packs', 250.00, 15) RETURNING id
    `, [catOff.rows[0].id]);

    const steelId = pSteel.rows[0].id;
    const chairId = pChair.rows[0].id;
    const laptopId = pLaptop.rows[0].id;
    const paperId = pPaper.rows[0].id;

    // 6. Initial Stock Setup (Steel Rod = 100 kg on Rack A)
    await query(`INSERT INTO stock (product_id, location_id, on_hand, reserved) VALUES ($1, $2, 100, 0)`, [steelId, rackAId]);
    await query(`INSERT INTO stock (product_id, location_id, on_hand, reserved) VALUES ($1, $2, 50, 0)`, [chairId, rackBId]);
    await query(`INSERT INTO stock (product_id, location_id, on_hand, reserved) VALUES ($1, $2, 20, 0)`, [laptopId, rackBId]);
    await query(`INSERT INTO stock (product_id, location_id, on_hand, reserved) VALUES ($1, $2, 8, 0)`, [paperId, rackAId]);

    // Initial Ledger entries for initial stock setup
    await query(`
      INSERT INTO stock_ledger (reference, product_id, location_id, change_qty, balance_after, movement_type, responsible_id)
      VALUES ('INIT/0001', $1, $2, 100, 100, 'Initial Stock', $3)
    `, [steelId, rackAId, userId]);
    await query(`
      INSERT INTO stock_ledger (reference, product_id, location_id, change_qty, balance_after, movement_type, responsible_id)
      VALUES ('INIT/0002', $1, $2, 50, 50, 'Initial Stock', $3)
    `, [chairId, rackBId, userId]);

    // 7. Suppliers & Customers
    const sup1 = await query(`INSERT INTO suppliers (name, email, phone, address) VALUES ('Apex Steel Corp', 'sales@apexsteel.com', '+91 9876543210', 'Industrial Area, Hyderabad') RETURNING id`);
    const sup2 = await query(`INSERT INTO suppliers (name, email, phone, address) VALUES ('Global Supplies Ltd', 'contact@globalsupplies.com', '+91 9123456789', 'Commercial Zone, Bangalore') RETURNING id`);

    const cust1 = await query(`INSERT INTO customers (name, email, phone, address) VALUES ('Acme Enterprises', 'purchasing@acme.com', '+91 9988776655', 'Tech Park, Hyderabad') RETURNING id`);
    const cust2 = await query(`INSERT INTO customers (name, email, phone, address) VALUES ('Tech Solutions Inc', 'orders@techsolutions.com', '+91 9876123456', 'Cyber City, Gurgaon') RETURNING id`);

    // 8. Initial Operational Dashboard Sample Data (Receipts & Deliveries)
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Receipts: 6 total scheduled/ready operations, 1 late
    for (let i = 1; i <= 6; i++) {
      const isLate = (i === 1);
      const schedDate = isLate ? yesterday : today;
      const ref = `WH/IN/000${i}`;
      const recRes = await query(`
        INSERT INTO receipts (reference, supplier_id, scheduled_date, status, responsible_id, notes)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
      `, [ref, (i % 2 === 0 ? sup2.rows[0].id : sup1.rows[0].id), schedDate, 'Ready', userId, `Incoming shipment ${i}`]);
      
      await query(`INSERT INTO receipt_items (receipt_id, product_id, quantity) VALUES ($1, $2, $3)`, [recRes.rows[0].id, steelId, 10 * i]);
    }

    // Deliveries: 6 total scheduled operations, 1 late
    for (let i = 1; i <= 6; i++) {
      const isLate = (i === 1);
      const schedDate = isLate ? yesterday : today;
      const status = (i === 2 ? 'Waiting' : 'Ready');
      const ref = `WH/OUT/000${i}`;
      const delRes = await query(`
        INSERT INTO deliveries (reference, customer_id, scheduled_date, status, responsible_id, notes)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
      `, [ref, (i % 2 === 0 ? cust2.rows[0].id : cust1.rows[0].id), schedDate, status, userId, `Outgoing order ${i}`]);

      await query(`INSERT INTO delivery_items (delivery_id, product_id, quantity) VALUES ($1, $2, $3)`, [delRes.rows[0].id, chairId, 2 * i]);
    }

    console.log('Seed completed successfully!');
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = { seed };

const { query } = require('../config/db');

async function initDb() {
  console.log('Initializing PostgreSQL database tables...');
  try {
    // Drop existing tables if needed or create if not exists
    const schema = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Inventory Manager',
        reset_otp VARCHAR(10),
        reset_otp_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        category_id INT REFERENCES categories(id) ON DELETE SET NULL,
        uom VARCHAR(50) DEFAULT 'pcs',
        unit_cost NUMERIC(12, 2) DEFAULT 0.00,
        reorder_level INT DEFAULT 10,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS warehouses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        warehouse_id INT REFERENCES warehouses(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS stock (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        location_id INT REFERENCES locations(id) ON DELETE CASCADE,
        on_hand INT DEFAULT 0,
        reserved INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_product_location UNIQUE (product_id, location_id)
      );

      CREATE TABLE IF NOT EXISTS receipts (
        id SERIAL PRIMARY KEY,
        reference VARCHAR(100) UNIQUE NOT NULL,
        supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
        scheduled_date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(50) DEFAULT 'Draft',
        responsible_id INT REFERENCES users(id) ON DELETE SET NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS receipt_items (
        id SERIAL PRIMARY KEY,
        receipt_id INT REFERENCES receipts(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        quantity INT NOT NULL CHECK (quantity > 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS deliveries (
        id SERIAL PRIMARY KEY,
        reference VARCHAR(100) UNIQUE NOT NULL,
        customer_id INT REFERENCES customers(id) ON DELETE SET NULL,
        scheduled_date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(50) DEFAULT 'Draft',
        responsible_id INT REFERENCES users(id) ON DELETE SET NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS delivery_items (
        id SERIAL PRIMARY KEY,
        delivery_id INT REFERENCES deliveries(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        quantity INT NOT NULL CHECK (quantity > 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transfers (
        id SERIAL PRIMARY KEY,
        reference VARCHAR(100) UNIQUE NOT NULL,
        from_location_id INT REFERENCES locations(id) ON DELETE CASCADE,
        to_location_id INT REFERENCES locations(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'Draft',
        responsible_id INT REFERENCES users(id) ON DELETE SET NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transfer_items (
        id SERIAL PRIMARY KEY,
        transfer_id INT REFERENCES transfers(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        quantity INT NOT NULL CHECK (quantity > 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS adjustments (
        id SERIAL PRIMARY KEY,
        reference VARCHAR(100) UNIQUE NOT NULL,
        location_id INT REFERENCES locations(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        recorded_qty INT NOT NULL,
        physical_qty INT NOT NULL,
        difference INT NOT NULL,
        reason TEXT,
        responsible_id INT REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'Draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS stock_movements (
        id SERIAL PRIMARY KEY,
        reference VARCHAR(100) NOT NULL,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        from_location_id INT REFERENCES locations(id) ON DELETE SET NULL,
        to_location_id INT REFERENCES locations(id) ON DELETE SET NULL,
        quantity INT NOT NULL,
        movement_type VARCHAR(50) NOT NULL,
        previous_qty INT NOT NULL DEFAULT 0,
        new_qty INT NOT NULL DEFAULT 0,
        responsible_id INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS stock_ledger (
        id SERIAL PRIMARY KEY,
        reference VARCHAR(100) NOT NULL,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        location_id INT REFERENCES locations(id) ON DELETE CASCADE,
        change_qty INT NOT NULL,
        balance_after INT NOT NULL,
        movement_type VARCHAR(50) NOT NULL,
        responsible_id INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await query(schema);
    console.log('Database schema created successfully.');
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  initDb();
}

module.exports = { initDb };

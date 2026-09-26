const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

async function testSupabaseConnection() {
  console.log('--- TESTING SUPABASE CONNECTION ---');
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dbUrl = process.env.DATABASE_URL;

  console.log('SUPABASE_URL:', supabaseUrl ? 'Configured' : 'Not configured');
  console.log('SUPABASE_SECRET_KEY:', (supabaseSecretKey && !supabaseSecretKey.includes('PLACEHOLDER')) ? 'Configured (Hidden)' : 'Pending user secret entry');
  console.log('DATABASE_URL:', dbUrl ? 'Configured (Hidden)' : 'Not configured');

  let success = true;

  if (supabaseUrl && supabaseSecretKey && !supabaseUrl.includes('placeholder') && !supabaseSecretKey.includes('PLACEHOLDER')) {
    try {
      const supabase = createClient(supabaseUrl, supabaseSecretKey);
      const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      if (error) {
        console.warn('⚠️ Supabase REST API query note:', error.message);
      } else {
        console.log('✓ Supabase Client REST API connection successful!');
      }
    } catch (err) {
      console.error('❌ Supabase Client error:', err.message);
      success = false;
    }
  } else {
    console.log('ℹ️ Supabase REST API URL/Secret Key pending user entry.');
  }

  if (dbUrl && !dbUrl.includes('localhost')) {
    try {
      const pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000
      });

      const timeRes = await pool.query('SELECT NOW()');
      console.log('✓ Supabase PostgreSQL Connection successful! Server time:', timeRes.rows[0].now);

      // Verify StockSense core tables
      const expectedTables = [
        'categories', 'products', 'warehouses', 'locations',
        'inventory', 'receipts', 'deliveries', 'transfers', 'adjustments',
        'stock_movements', 'reorder_rules', 'audit_logs'
      ];

      const tablesRes = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
      `);

      const existingTables = tablesRes.rows.map(r => r.table_name);
      const missingTables = expectedTables.filter(t => !existingTables.includes(t));

      if (missingTables.length === 0) {
        console.log(`✓ All ${expectedTables.length} required StockSense database tables verified in Supabase PostgreSQL!`);
      } else {
        console.warn(`⚠️ Existing tables: [${existingTables.join(', ')}]`);
        console.warn(`⚠️ Missing tables: [${missingTables.join(', ')}]`);
      }

      await pool.end();
    } catch (err) {
      console.error('❌ Supabase PostgreSQL connection error:', err.message);
      success = false;
    }
  } else {
    console.log('ℹ️ DATABASE_URL is set to local or missing.');
  }

  return success;
}

if (require.main === module) {
  testSupabaseConnection().then(ok => {
    if (ok) {
      console.log('✅ Supabase configuration check completed.');
      process.exit(0);
    } else {
      console.log('❌ Supabase configuration check failed.');
      process.exit(1);
    }
  });
}

module.exports = { testSupabaseConnection };

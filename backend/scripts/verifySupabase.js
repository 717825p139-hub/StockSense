require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

async function testSupabaseConnection() {
  console.log('--- TESTING SUPABASE CONNECTION ---');
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dbUrl = process.env.DATABASE_URL;

  console.log('SUPABASE_URL:', supabaseUrl || 'Not configured');
  console.log('SUPABASE_SECRET_KEY:', supabaseSecretKey ? 'Configured (Hidden)' : 'Not configured');
  console.log('DATABASE_URL:', dbUrl ? 'Configured (Hidden)' : 'Not configured');

  let success = true;

  if (supabaseUrl && supabaseSecretKey && !supabaseUrl.includes('placeholder')) {
    try {
      const supabase = createClient(supabaseUrl, supabaseSecretKey);
      const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      if (error) {
        console.warn('⚠️ Supabase REST API query warning:', error.message);
      } else {
        console.log('✓ Supabase Client REST API connection successful!');
      }
    } catch (err) {
      console.error('❌ Supabase Client error:', err.message);
      success = false;
    }
  } else {
    console.log('ℹ️ Supabase REST API URL/Key missing or placeholder.');
  }

  if (dbUrl && !dbUrl.includes('localhost')) {
    try {
      const pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
      });
      const res = await pool.query('SELECT NOW()');
      console.log('✓ Supabase PostgreSQL Direct Pool connection successful! Server time:', res.rows[0].now);
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

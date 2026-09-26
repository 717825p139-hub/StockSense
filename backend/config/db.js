const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Determine connection params for PostgreSQL
const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/stocksense';

const isRemotePostgres = connectionString.includes('supabase.co') || connectionString.includes('pooler.supabase.com') || isProduction;

let pool;
let usePg = true;

try {
  pool = new Pool({
    connectionString,
    ssl: isRemotePostgres ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
} catch (err) {
  console.warn('PostgreSQL Pool initialization warning:', err.message);
}

// Wrapper to support parameterized queries ($1, $2...) across PG and fallback SQLite
async function query(text, params = []) {
  if (usePg && pool) {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (err) {
      // If PostgreSQL connection fails on local attempt without DATABASE_URL, log warning
      if (!process.env.DATABASE_URL && (err.code === 'ECONNREFUSED' || err.code === '28P01' || err.code === '3D000')) {
        console.warn('PostgreSQL query failed, fallback handler engaged:', err.message);
      }
      throw err;
    }
  }
  throw new Error('Database pool not initialized');
}

async function getClient() {
  if (usePg && pool) {
    const client = await pool.connect();
    const query = client.query.bind(client);
    const release = client.release.bind(client);
    
    // Custom wrapper for client inside transactions
    return {
      query: async (text, params) => {
        return await client.query(text, params);
      },
      release
    };
  }
  throw new Error('No db client available');
}

module.exports = {
  query,
  getClient,
  get pool() { return pool; }
};

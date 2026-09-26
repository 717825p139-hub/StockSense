const { Client } = require('pg');

async function testConn() {
  const passwords = ['postgres', 'admin', 'root', 'password', '123456', ''];
  for (const pass of passwords) {
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: pass,
      port: 5432,
    });
    try {
      await client.connect();
      console.log(`SUCCESS with password: "${pass}"`);
      
      // Try to create stocksense database if not exists
      try {
        await client.query('CREATE DATABASE stocksense');
        console.log('Created database "stocksense"');
      } catch (err) {
        if (err.code === '42P04') {
          console.log('Database "stocksense" already exists');
        } else {
          console.log('Create db note:', err.message);
        }
      }
      
      await client.end();
      return pass;
    } catch (err) {
      // continue
    }
  }
  console.log('Could not connect with default postgres passwords');
  return null;
}

testConn();

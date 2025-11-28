const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config();

const sqlFile = require('path').join(__dirname, '..', 'create_admin.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL not set in environment. Set it in .env or pass as env var.');
  process.exit(1);
}

async function run() {
  // If the server uses self-signed certificates, allow insecure TLS for this one-off script.
  // WARNING: this disables certificate validation. Use only when you trust the network.
  const clientOptions = { connectionString: databaseUrl };
  try {
    // If DATABASE_URL contains sslmode=require, configure pg to accept self-signed certs
    if (/sslmode=(require|verify-full|verify-ca)/i.test(databaseUrl)) {
      clientOptions.ssl = { rejectUnauthorized: false };
    }
  } catch (e) {}

  // For environments with self-signed certificates, also set the global TLS option
  // This disables certificate validation for Node's TLS sockets. Use only in trusted networks.
  if (clientOptions.ssl && clientOptions.ssl.rejectUnauthorized === false) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  const client = new Client(clientOptions);
  try {
    await client.connect();
    console.log('Connected to DB. Executing SQL...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('SQL executed successfully.');
  } catch (err) {
    console.error('SQL execution failed:', err.message || err);
    try { await client.query('ROLLBACK'); } catch(e) {}
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();

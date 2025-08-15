const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Force IPv4 connection
  host: process.env.DB_HOST?.replace(/^\[|\]$/g, ''), // Remove IPv6 brackets if present
  family: 4 // Force IPv4
});

module.exports = pool;

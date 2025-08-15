const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
  } else {
    console.log('✅ PostgreSQL connected successfully to Render database');
    console.log('✅ Database ready for queries');
    release();
  }
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
});

module.exports = pool;
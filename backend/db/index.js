const { Pool } = require('pg');

// Simple and reliable Supabase connection configuration
const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // This fixes the self-signed certificate issue
  },
  // Basic connection settings
  max: 5,
  min: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
};

const pool = new Pool(connectionConfig);

// Simple connection test without retries (they were causing confusion)
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
    console.error('🔍 Error code:', err.code);
  } else {
    console.log('✅ PostgreSQL connected successfully to Supabase');
    console.log('✅ Database ready for queries');
    release();
  }
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🔄 Shutting down database pool...');
  pool.end(() => {
    console.log('✅ Database pool closed');
    process.exit(0);
  });
});

module.exports = pool;
const { Pool } = require('pg');

// Render PostgreSQL connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Connection pool settings
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  acquireTimeoutMillis: 60000
});

// Test connection on startup
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully to Render database');
    console.log('✅ Database ready for queries');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Database test query successful:', result.rows[0].current_time);
    
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
    console.error('❌ Error code:', err.code);
  }
};

// Test connection on startup
testConnection();

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
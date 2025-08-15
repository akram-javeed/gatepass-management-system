const { Pool } = require('pg');

// Neon PostgreSQL connection with enhanced SSL handling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    // Additional SSL options for Neon compatibility
    checkServerIdentity: () => undefined
  },
  max: 10,
  min: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  // Additional options for better stability
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

// Test connection with better error handling
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully to Neon database');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Database test successful:', result.rows[0].current_time);
    console.log('✅ PostgreSQL version:', result.rows[0].pg_version.split(' ')[0]);
    
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
    console.error('❌ Error code:', err.code);
    
    if (err.code === 'DEPTH_ZERO_SELF_SIGNED_CERT' || err.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
      console.log('💡 SSL certificate issue detected. Try updating the connection string SSL mode.');
    }
  }
};

// Test connection on startup
testConnection();

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
});

module.exports = pool;
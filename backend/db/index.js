const { Pool } = require('pg');

// Render PostgreSQL connection with SSL completely disabled
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // Completely disable SSL
  // Connection pool settings
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  acquireTimeoutMillis: 60000
});

// Alternative: Parse URL and use individual parameters to avoid SSL issues
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    
    // Create a new pool with individual parameters (no SSL)
    const alternativePool = new Pool({
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.substring(1),
      user: url.username,
      password: url.password,
      ssl: false, // No SSL
      max: 10,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
    
    console.log('🔧 Using manual connection config (SSL disabled)');
    module.exports = alternativePool;
    
    // Test this alternative connection
    alternativePool.connect((err, client, release) => {
      if (err) {
        console.error('❌ Alternative connection failed:', err.message);
        console.log('🔄 Falling back to connection string method');
        module.exports = pool; // Fallback to original
      } else {
        console.log('✅ Alternative PostgreSQL connected successfully (SSL disabled)');
        console.log('✅ Database ready for queries');
        release();
      }
    });
    
  } catch (parseError) {
    console.error('❌ URL parsing failed:', parseError.message);
    console.log('🔄 Using connection string method');
    module.exports = pool;
  }
} else {
  module.exports = pool;
}

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
});
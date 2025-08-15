const { Pool } = require('pg');

// Force SSL bypass for Supabase connection
const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: false, // Completely disable SSL verification
  // Basic connection settings
  max: 5,
  min: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
};

// If DATABASE_URL has SSL parameters, try to parse manually
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    
    // Manual connection config to bypass SSL issues
    connectionConfig.host = url.hostname;
    connectionConfig.port = parseInt(url.port) || 5432;
    connectionConfig.database = url.pathname.substring(1) || 'postgres';
    connectionConfig.user = url.username;
    connectionConfig.password = url.password;
    connectionConfig.ssl = false; // Force no SSL
    
    // Remove connectionString to use individual parameters
    delete connectionConfig.connectionString;
    
    console.log('🔧 Using manual connection config (SSL disabled)');
    console.log('🔗 Host:', connectionConfig.host);
    console.log('🔗 Port:', connectionConfig.port);
    console.log('🔗 Database:', connectionConfig.database);
  } catch (err) {
    console.log('⚠️ URL parsing failed, using connection string');
    // Fallback to connection string with SSL disabled
    connectionConfig.ssl = false;
  }
}

const pool = new Pool(connectionConfig);

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
    console.error('🔍 Error code:', err.code);
    
    // If SSL error persists, show helpful message
    if (err.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
      console.error('💡 SSL Certificate issue detected. Consider using direct connection string.');
    }
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

module.exports = pool;
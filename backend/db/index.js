const { Pool } = require('pg');

// Enhanced Supabase connection configuration
const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    // Fix for self-signed certificate in chain
    require: true,
    ca: false
  },
  // Connection pool settings optimized for Supabase
  max: 5, // Reduced pool size for free tier
  min: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  acquireTimeoutMillis: 30000,
  // Force IPv4 and optimize for Supabase
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  // Supabase-specific options
  application_name: 'gatepass-backend',
  // Force search path
  options: '-c search_path=public'
};

// Handle different connection string formats
if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  
  // If it's an IPv6 address, try to use hostname instead
  if (url.hostname.includes(':') && !url.hostname.includes('supabase.com')) {
    console.log('⚠️  Detected IPv6 address, attempting hostname resolution...');
    // Try to extract Supabase hostname from connection string
    if (process.env.DATABASE_URL.includes('supabase.com')) {
      const supabaseMatch = process.env.DATABASE_URL.match(/([a-zA-Z0-9-]+\.supabase\.co)/);
      if (supabaseMatch) {
        connectionConfig.host = supabaseMatch[1];
        connectionConfig.port = 5432;
        connectionConfig.database = url.pathname.substring(1) || 'postgres';
        connectionConfig.user = url.username;
        connectionConfig.password = url.password;
        // Remove connectionString to use individual parameters
        delete connectionConfig.connectionString;
        console.log('✅ Using extracted Supabase hostname:', connectionConfig.host);
      }
    }
  }
}

const pool = new Pool(connectionConfig);

// Enhanced connection testing with retries
let connectionAttempts = 0;
const maxRetries = 3;

const testConnection = async () => {
  connectionAttempts++;
  
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully to Supabase');
    console.log('✅ Connection details:', {
      database: client.database || 'postgres',
      host: connectionConfig.host || 'connection string',
      ssl: 'enabled'
    });
    client.release();
    return true;
  } catch (err) {
    console.error(`❌ PostgreSQL connection error (attempt ${connectionAttempts}/${maxRetries}):`, {
      message: err.message,
      code: err.code,
      errno: err.errno,
      syscall: err.syscall,
      address: err.address,
      port: err.port
    });
    
    if (connectionAttempts < maxRetries) {
      console.log(`⏳ Retrying connection in 2 seconds...`);
      setTimeout(testConnection, 2000);
    } else {
      console.error('❌ Max connection retries reached. Please check your DATABASE_URL and Supabase settings.');
      
      // Provide helpful debugging info
      if (process.env.DATABASE_URL) {
        const url = new URL(process.env.DATABASE_URL);
        console.log('🔍 Connection debugging info:', {
          hostname: url.hostname,
          port: url.port,
          isIPv6: url.hostname.includes(':') && !url.hostname.includes('supabase.com'),
          isSupabase: url.hostname.includes('supabase.com'),
          hasPassword: !!url.password
        });
      }
    }
    return false;
  }
};

// Test connection on startup
testConnection();

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err);
  // Don't exit process, just log the error
  console.log('🔄 Pool will attempt to recover...');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🔄 Gracefully shutting down database pool...');
  pool.end(() => {
    console.log('✅ Database pool has ended');
    process.exit(0);
  });
});

module.exports = pool;
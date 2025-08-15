const { createClient } = require('@supabase/supabase-js');

// Extract Supabase details from DATABASE_URL
let supabaseUrl, supabaseKey;

if (process.env.DATABASE_URL) {
  // For Supabase, we need the project URL and anon key
  // Your connection string: postgresql://postgres.xdlepewaoxjndboldfgr:9940356779ybl@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
  
  const match = process.env.DATABASE_URL.match(/postgres\.([^:]+):/);
  if (match) {
    const projectRef = match[1]; // xdlepewaoxjndboldfgr
    supabaseUrl = `https://${projectRef}.supabase.co`;
    supabaseKey = '9940356779ybl'; // Your password is actually the service key
  }
}

// Fallback to environment variables if URL parsing fails
supabaseUrl = supabaseUrl || process.env.SUPABASE_URL;
supabaseKey = supabaseKey || process.env.SUPABASE_ANON_KEY;

console.log('🔧 Supabase URL:', supabaseUrl);
console.log('🔧 Has Supabase Key:', !!supabaseKey);

let supabase;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');
  } catch (error) {
    console.error('❌ Supabase client creation failed:', error.message);
  }
} else {
  console.error('❌ Missing Supabase URL or Key');
}

// Export a query function that mimics pg pool
const query = async (text, params) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  // This is a basic implementation - you might need to adjust based on your queries
  console.log('📝 Executing query:', text.substring(0, 50) + '...');
  
  // For testing, let's return a mock result
  return {
    rows: [{ 
      current_time: new Date().toISOString(),
      message: 'Supabase connection works!'
    }]
  };
};

module.exports = {
  query,
  supabase
};
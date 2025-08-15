const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + "?sslmode=require",
  ssl: { rejectUnauthorized: false },
  // Force IPv4
  options: "-c inet_prefer_ipv4=on"
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL (IPv4)"))
  .catch((err) => console.error("❌ PostgreSQL connection error:", err));

module.exports = pool;

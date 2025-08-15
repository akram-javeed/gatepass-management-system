const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + "?sslmode=require",
  ssl: { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL (IPv4)"))
  .catch((err) => console.error("❌ PostgreSQL connection error:", err));

module.exports = pool;

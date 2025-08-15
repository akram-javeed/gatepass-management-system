const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + "?sslmode=require",
  ssl: { rejectUnauthorized: false },
  keepAlive: true,
  statement_timeout: 5000,
  options: "-c inet_prefer_ipv4=on"
});

const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/sse - Get all SSE users
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        full_name as name,
        employee_id,
        email
      FROM users 
      WHERE role = 'sse' 
        AND is_active = true
      ORDER BY full_name
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching SSEs:", error);
    res.status(500).json({ error: "Failed to fetch SSEs" });
  }
});

module.exports = router;
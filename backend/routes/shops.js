const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/shops - Get all shops
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        name,
        location
      FROM shops 
      ORDER BY name
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching shops:", error);
    res.status(500).json({ error: "Failed to fetch shops" });
  }
});

module.exports = router;
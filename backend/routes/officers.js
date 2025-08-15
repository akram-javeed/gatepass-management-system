const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/officers - Get all officers (officer1 and officer2)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        full_name as name, 
        employee_id,
        role,
        email
      FROM users 
      WHERE role IN ('officer1', 'officer2') 
        AND is_active = true
      ORDER BY role, full_name
    `);
    
    // Transform data to match expected format
    const officers = result.rows.map(officer => ({
      id: officer.id,
      name: officer.name,
      employee_id: officer.employee_id,
      role: officer.role,
      email: officer.email
    }));
    
    res.json(officers);
  } catch (error) {
    console.error("Error fetching officers:", error);
    res.status(500).json({ error: "Failed to fetch officers" });
  }
});

module.exports = router;
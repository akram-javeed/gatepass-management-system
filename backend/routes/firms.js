// backend/routes/firms.js
const express = require("express")
const router = express.Router()
const pool = require("../db");
// GET /api/firms
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM firms")
    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching firms:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
})
// ✅ POST /api/firms
router.post("/", async (req, res) => {
  const {
    firmName,
    address,
    contactPerson,
    phone,
    email,
    contractorName,
    pan,
    gst,
  } = req.body;

  if (!firmName || !contractorName || !pan || !gst) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO firms 
       (firm_name, address, contact_person, phone, email, contractor_name, pan, gst)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [firmName, address, contactPerson, phone, email, contractorName, pan, gst]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting firm:", err);
    res.status(500).json({ error: "Database insert failed." });
  }
});

module.exports = router;
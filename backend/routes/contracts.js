const express = require("express")
const router = express.Router()
const pool = require("../db");
router.post("/", async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      loaNumber,
      date,
      workDescription,
      shopId,
      firm_id,
      contractorName,
      pan,
      gst,
      address,
      email,
      phone,
      contractPeriodFrom,
      contractPeriodTo,
      shiftTiming,
      executingSSEId,    // This is now users.id directly
      approvedOfficerId, // This is now users.id directly
    } = req.body;

    console.log("Creating contract with SSE User ID:", executingSSEId);
    console.log("Creating contract with Officer User ID:", approvedOfficerId);

    // Validate that the executing SSE user exists and has correct role
    if (executingSSEId) {
      const sseUserResult = await client.query(
        'SELECT id, full_name, employee_id FROM users WHERE id = $1 AND role = $2 AND is_active = true',
        [executingSSEId, 'sse']
      );

      if (sseUserResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          error: "Invalid executing SSE user ID or user is not active",
          executingSSEId: executingSSEId
        });
      }
      
      console.log("Valid SSE user found:", sseUserResult.rows[0]);
    }

    // Validate that the approved officer user exists and has correct role
    if (approvedOfficerId) {
      const officerUserResult = await client.query(
        'SELECT id, full_name, employee_id, role FROM users WHERE id = $1 AND role IN ($2, $3) AND is_active = true',
        [approvedOfficerId, 'officer1', 'officer2']
      );

      if (officerUserResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          error: "Invalid approved officer user ID or user is not active",
          approvedOfficerId: approvedOfficerId
        });
      }
      
      console.log("Valid officer user found:", officerUserResult.rows[0]);
    }

    // Insert the contract directly using user IDs
    const result = await client.query(
      `INSERT INTO contracts (
        loa_number,
        loa_date,
        work_description,
        shop_id,
        firm_id,
        contractor_name,
        pan,
        gst,
        address,
        email,
        phone,
        contract_period_from,
        contract_period_to,
        shift_timing,
        executing_sse_id,
        approved_officer_id,
        created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, NOW()
      ) RETURNING *`,
      [
        loaNumber,
        date,
        workDescription,
        shopId,
        firm_id,
        contractorName,
        pan,
        gst,
        address,
        email,
        phone,
        contractPeriodFrom,
        contractPeriodTo,
        shiftTiming,
        executingSSEId,    // Direct user ID
        approvedOfficerId, // Direct user ID
      ]
    );

    await client.query('COMMIT');

    console.log("Contract created successfully:", {
      id: result.rows[0].id,
      loa_number: result.rows[0].loa_number,
      executing_sse_id: result.rows[0].executing_sse_id,
      approved_officer_id: result.rows[0].approved_officer_id
    });

    res.json({ 
      message: "Contract saved successfully",
      contract: result.rows[0]
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error saving contract:", error);
    
    // More specific error messages
    if (error.message.includes('executing_sse_id')) {
      res.status(400).json({ 
        error: "Invalid SSE user assignment. Please select a valid SSE user.",
        details: error.message
      });
    } else if (error.message.includes('approved_officer_id')) {
      res.status(400).json({ 
        error: "Invalid officer user assignment. Please select a valid officer user.",
        details: error.message
      });
    } else {
      res.status(500).json({ 
        error: "Failed to save contract",
        details: error.message
      });
    }
  } finally {
    client.release();
  }
});

// Also update the GET route to return proper user information
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;

    let result;
    if (q) {
      result = await pool.query(
        `SELECT 
           c.id, c.loa_number, c.loa_date, c.work_description, 
           c.contractor_name, c.pan, c.gst, c.address, c.email, c.phone, 
           c.contract_period_from, c.contract_period_to, c.shift_timing,
           c.created_at,
           s.name AS shop_name,
           f.firm_name AS firm_name,
           sse_user.full_name AS sse_name,
           sse_user.employee_id AS sse_employee_id,
           officer_user.full_name AS officer_name,
           officer_user.employee_id AS officer_employee_id,
           officer_user.role AS officer_role
         FROM contracts c
         LEFT JOIN shops s ON c.shop_id = s.id
         LEFT JOIN firms f ON c.firm_id = f.id
         LEFT JOIN users sse_user ON c.executing_sse_id = sse_user.id
         LEFT JOIN users officer_user ON c.approved_officer_id = officer_user.id
         WHERE LOWER(c.loa_number) LIKE $1
         ORDER BY c.id DESC`,
        [`%${q.toLowerCase()}%`]
      );
    } else {
      result = await pool.query(
        `SELECT 
           c.id, c.loa_number, c.loa_date, c.work_description, 
           c.contractor_name, c.pan, c.gst, c.address, c.email, c.phone, 
           c.contract_period_from, c.contract_period_to, c.shift_timing,
           c.created_at,
           s.name AS shop_name,
           f.firm_name AS firm_name,
           sse_user.full_name AS sse_name,
           sse_user.employee_id AS sse_employee_id,
           officer_user.full_name AS officer_name,
           officer_user.employee_id AS officer_employee_id,
           officer_user.role AS officer_role
         FROM contracts c
         LEFT JOIN shops s ON c.shop_id = s.id
         LEFT JOIN firms f ON c.firm_id = f.id
         LEFT JOIN users sse_user ON c.executing_sse_id = sse_user.id
         LEFT JOIN users officer_user ON c.approved_officer_id = officer_user.id
         ORDER BY c.id DESC`
      );
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching contracts:", err);
    res.status(500).json({ error: "Failed to fetch contracts" });
  }
});


module.exports = router

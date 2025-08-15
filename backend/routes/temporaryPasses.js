// backend/routes/temporaryPasses.js

const express = require('express');
const router = express.Router();
const pool = require('../db');
const emailService = require('../services/emailService');

// POST: Create temporary pass
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const body = req.body;
    
    // Calculate duration
    const periodFrom = new Date(body.period_from);
    const periodTo = new Date(body.period_to);
    const daysDiff = Math.ceil((periodTo - periodFrom) / (1000 * 60 * 60 * 24)) + 1;
    
    // Generate temp pass number
    const tempPassNumber = `TEMP/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`;
    
    // Insert into database
    const insertQuery = `
      INSERT INTO temporary_gate_passes (
        temp_pass_number, firm_name, firm_address, representative_name,
        phone_number, email, aadhar_number, number_of_persons,
        nature_of_work, period_from, period_to, duration_days,
        forward_to_user_id, forward_to_role, forward_to_name,
        status, current_officer_id, submitted_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;
    
    const status = body.forward_to_role === 'officer1' ? 'pending_with_officer1' : 'pending_with_officer2';
    
    const values = [
      tempPassNumber, body.firm_name, body.address, body.representative_name,
      body.phone_number, body.email, body.aadhar_number, parseInt(body.number_of_persons),
      body.nature_of_work, body.period_from, body.period_to, daysDiff,
      body.forward_to_user_id, body.forward_to_role, body.forward_to_name,
      status, body.forward_to_user_id, new Date()
    ];
    
    const result = await client.query(insertQuery, values);
    const tempPass = result.rows[0];
    
    // Send email to applicant
    await emailService.sendApplicationEmail(
      body.email,
      'temp_pass_submitted',
      {
        tempPassNumber,
        firmName: body.firm_name,
        representativeName: body.representative_name,
        natureOfWork: body.nature_of_work,
        periodFrom: body.period_from,
        periodTo: body.period_to,
        duration: daysDiff,
        numberOfPersons: body.number_of_persons,
        forwardedTo: body.forward_to_name
      }
    );
    
    // Send email to officer
    const officerQuery = await client.query(
      "SELECT email, full_name FROM users WHERE id = $1",
      [body.forward_to_user_id]
    );
    
    if (officerQuery.rows.length > 0) {
      const officer = officerQuery.rows[0];
      
      await emailService.sendApplicationEmail(
        officer.email,
        'temp_pass_officer_notification',
        {
          tempPassNumber,
          firmName: body.firm_name,
          representativeName: body.representative_name,
          phoneNumber: body.phone_number,
          natureOfWork: body.nature_of_work,
          periodFrom: body.period_from,
          periodTo: body.period_to,
          duration: daysDiff,
          numberOfPersons: body.number_of_persons,
          officerName: officer.full_name,
          userRole: body.forward_to_role.toUpperCase()
        }
      );
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: "Temporary pass submitted successfully",
      application: tempPass
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error creating temporary pass:", error);
    res.status(500).json({
      success: false,
      error: "Failed to submit temporary pass",
      details: error.message
    });
  } finally {
    client.release();
  }
});

// Add more routes for approve, generate-pdf, etc...

module.exports = router;
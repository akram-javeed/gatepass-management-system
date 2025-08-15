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
// GET: Fetch temporary gate passes with filters
router.get('/', async (req, res) => {
  try {
    const { status, officer_id, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    let query = `
      SELECT 
        tp.*,
        u.full_name as officer_name,
        u.employee_id as officer_employee_id
      FROM temporary_gate_passes tp
      LEFT JOIN users u ON tp.current_officer_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    // Filter by status
    if (status) {
      query += ` AND tp.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    // Filter by current officer (for pending approvals)
    if (officer_id && status && (status === 'pending_with_officer1' || status === 'pending_with_officer2')) {
      query += ` AND tp.current_officer_id = $${paramCount}`;
      params.push(officer_id);
      paramCount++;
    }
    
    // Order and pagination
    query += ` ORDER BY tp.submitted_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limitNum, offset);
    
    console.log("Fetching temporary passes with query:", query);
    console.log("Parameters:", params);
    
    const result = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM temporary_gate_passes tp
      WHERE 1=1
    `;
    
    const countParams = [];
    paramCount = 1;
    
    if (status) {
      countQuery += ` AND tp.status = $${paramCount}`;
      countParams.push(status);
      paramCount++;
    }
    
    if (officer_id && status && (status === 'pending_with_officer1' || status === 'pending_with_officer2')) {
      countQuery += ` AND tp.current_officer_id = $${paramCount}`;
      countParams.push(officer_id);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    
    console.log(`Found ${result.rows.length} temporary passes`);
    
    return res.json({
      success: true,
      applications: result.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
    
  } catch (error) {
    console.error("Error fetching temporary passes:", error);
    return res.json({
      success: false,
      error: "Failed to fetch temporary passes",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// PATCH: Update temporary gate pass status
router.patch('/', async (req, res) => {
  try {
    const body = req.body;
    const { id, status, remarks } = body;
    
    if (!id || !status) {
      return res.json({
        success: false,
        error: "ID and status are required"
      });
    }
    
    const updateQuery = `
      UPDATE temporary_gate_passes 
      SET 
        status = $1,
        updated_at = CURRENT_TIMESTAMP
        ${remarks ? ', officer_remarks = $3' : ''}
      WHERE id = $2
      RETURNING *
    `;
    
    const params = remarks ? [status, id, remarks] : [status, id];
    const result = await pool.query(updateQuery, params);
    
    if (result.rows.length === 0) {
      return res.json({
        success: false,
        error: "Temporary pass not found"
      });
    }
    
    // Log the status change
    await pool.query(
      `INSERT INTO temporary_pass_logs (
        temp_pass_id, action, remarks, new_status, timestamp
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [
        id,
        'status_updated',
        remarks || `Status changed to ${status}`,
        status
      ]
    );
    
    return res.json({
      success: true,
      message: "Status updated successfully",
      application: result.rows[0]
    });
    
  } catch (error) {
    console.error("Error updating temporary pass:", error);
    return res.json({
      success: false,
      error: "Failed to update temporary pass"
    });
  }
});

// DELETE: Delete temporary gate pass (for testing/cleanup)
router.delete('/', async (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.json({
        success: false,
        error: "ID is required"
      });
    }
    
    const result = await pool.query(
      "DELETE FROM temporary_gate_passes WHERE id = $1 RETURNING *",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.json({
        success: false,
        error: "Temporary pass not found"
      });
    }
    
    return res.json({
      success: true,
      message: "Temporary pass deleted successfully",
      deleted: result.rows[0]
    });
    
  } catch (error) {
    console.error("Error deleting temporary pass:", error);
    return res.json({
      success: false,
      error: "Failed to delete temporary pass"
    });
  }
});

// POST: Approve temporary gate pass
router.post('/:id/approve', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const body = req.body;
    
    console.log("Approving temporary gate pass:", id);
    console.log("Request body:", body);

    const { officer_id, officer_name, remarks, role } = body;

    if (!officer_id || !role) {
      await client.query('ROLLBACK');
      return res.json({
        success: false,
        error: "Officer ID and role are required"
      });
    }

    // Update temporary gate pass status to pending_with_chos after officer approval
    const updateQuery = `
      UPDATE temporary_gate_passes 
      SET 
        status = 'pending_with_chos',
        approved_by_officer_id = $1,
        officer_approval_date = CURRENT_TIMESTAMP,
        officer_remarks = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await client.query(updateQuery, [
      officer_id,
      remarks || `Approved by ${role}`,
      id
    ]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.json({
        success: false,
        error: "Temporary gate pass not found"
      });
    }

    const updatedPass = result.rows[0];

    // Log the approval action
    await client.query(
      `INSERT INTO temporary_pass_logs (
        temp_pass_id, 
        action, 
        performed_by_user_id,
        performed_by_role,
        remarks, 
        old_status,
        new_status,
        timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
      [
        id,
        'officer_approved',
        officer_id,
        role,
        `Approved by ${officer_name || role}: ${remarks || 'No remarks'}`,
        role === 'officer1' ? 'pending_with_officer1' : 'pending_with_officer2',
        'pending_with_chos'
      ]
    );

    await client.query('COMMIT');

    console.log("Temporary gate pass approved successfully:", updatedPass.temp_pass_number);

    return res.json({
      success: true,
      message: "Temporary gate pass approved and forwarded to Ch.OS/NPB",
      application: updatedPass
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error approving temporary gate pass:", error);
    return res.json({
      success: false,
      error: "Failed to approve temporary gate pass",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  } finally {
    client.release();
  }
});

// POST: Reject temporary gate pass
router.post('/:id/reject', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const body = req.body;
    
    console.log("Rejecting temporary gate pass:", id);
    console.log("Request body:", body);

    const { officer_id, officer_name, rejection_reason, role } = body;

    if (!officer_id || !rejection_reason) {
      await client.query('ROLLBACK');
      return res.json({
        success: false,
        error: "Officer ID and rejection reason are required"
      });
    }

    // Update temporary gate pass status to rejected
    const updateQuery = `
      UPDATE temporary_gate_passes 
      SET 
        status = 'rejected',
        rejected_by_user_id = $1,
        rejection_date = CURRENT_TIMESTAMP,
        rejection_reason = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await client.query(updateQuery, [
      officer_id,
      rejection_reason,
      id
    ]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.json({
        success: false,
        error: "Temporary gate pass not found"
      });
    }

    const updatedPass = result.rows[0];

    // Log the rejection action
    await client.query(
      `INSERT INTO temporary_pass_logs (
        temp_pass_id, 
        action, 
        performed_by_user_id,
        performed_by_role,
        remarks, 
        old_status,
        new_status,
        timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
      [
        id,
        'officer_rejected',
        officer_id,
        role,
        `Rejected by ${officer_name || role}: ${rejection_reason}`,
        role === 'officer1' ? 'pending_with_officer1' : 'pending_with_officer2',
        'rejected'
      ]
    );

    await client.query('COMMIT');

    console.log("Temporary gate pass rejected:", updatedPass.temp_pass_number);

    return res.json({
      success: true,
      message: "Temporary gate pass has been rejected",
      application: updatedPass
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error rejecting temporary gate pass:", error);
    return res.json({
      success: false,
      error: "Failed to reject temporary gate pass",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  } finally {
    client.release();
  }
});

// POST: Generate PDF for temporary gate pass
router.post('/:id/generate-pdf', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const body = req.body;
    
    const { chos_id, chos_name, signature } = body;

    // Update temporary gate pass after Ch.OS/NPB approval
    const updateQuery = `
      UPDATE temporary_gate_passes 
      SET 
        status = 'approved',
        approved_by_chos_id = $1,
        chos_approval_date = CURRENT_TIMESTAMP,
        pdf_generated = true,
        gate_permit_number = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    // Generate unique gate permit number
    const permitNumber = `GP/TEMP/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`;

    const result = await client.query(updateQuery, [
      chos_id,
      permitNumber,
      id
    ]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.json({
        success: false,
        error: "Temporary gate pass not found"
      });
    }

    // Log the final approval
    await client.query(
      `INSERT INTO temporary_pass_logs (
        temp_pass_id, 
        action, 
        performed_by_user_id,
        performed_by_role,
        remarks, 
        new_status,
        timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
      [
        id,
        'chos_approved_and_generated_pdf',
        chos_id,
        'chos',
        `Gate pass generated by ${chos_name}`,
        'approved'
      ]
    );

    await client.query('COMMIT');

    return res.json({
      success: true,
      message: "Temporary gate pass approved and PDF generated",
      application: result.rows[0],
      permitNumber: permitNumber
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error generating temporary gate pass PDF:", error);
    return res.json({
      success: false,
      error: "Failed to generate PDF",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  } finally {
    client.release();
  }
});

module.exports = router;
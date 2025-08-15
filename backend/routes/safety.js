const express = require("express")
const router = express.Router()
const pool = require("../db");

// Modify Gate Pass Period
router.post("/:id/modify-period", async (req, res) => {
  const { id } = req.params;
  const { 
    gatePassPeriodFrom, 
    gatePassPeriodTo, 
    safetyOfficerId, 
    remarks 
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    // Validate inputs
    if (!gatePassPeriodFrom || !gatePassPeriodTo) {
      return res.status(400).json({ 
        success: false,
        error: "Both from and to dates are required" 
      });
    }

    // Validate dates
    const fromDate = new Date(gatePassPeriodFrom);
    const toDate = new Date(gatePassPeriodTo);
    
    if (fromDate >= toDate) {
      return res.status(400).json({ 
        success: false,
        error: "From date must be before to date" 
      });
    }

    // Get current application details for logging
    const currentApp = await client.query(
      "SELECT * FROM gate_pass_applications WHERE id = $1",
      [id]
    );

    if (currentApp.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        error: "Application not found" 
      });
    }

    const app = currentApp.rows[0];
    const oldFromDate = app.gate_pass_period_from;
    const oldToDate = app.gate_pass_period_to;

    // Update the gate pass period
    const result = await client.query(
      `UPDATE gate_pass_applications
       SET gate_pass_period_from = $1,
           gate_pass_period_to = $2,
           safety_remarks = COALESCE(safety_remarks, '') || 
             E'\n[Period Modified] ' || $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [
        gatePassPeriodFrom, 
        gatePassPeriodTo, 
        remarks || `Period changed from ${oldFromDate} - ${oldToDate} to ${gatePassPeriodFrom} - ${gatePassPeriodTo}`,
        id
      ]
    );

    // Log the change
    if (safetyOfficerId) {
      await client.query(
        `INSERT INTO application_logs 
         (application_id, changed_by_user_id, changed_by_role, old_status, new_status, action, remarks)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          id,
          safetyOfficerId,
          'safety_officer',
          app.status,
          app.status,
          'modify_period',
          `Gate pass period modified from ${oldFromDate} - ${oldToDate} to ${gatePassPeriodFrom} - ${gatePassPeriodTo}. ${remarks || ''}`
        ]
      );
    }

    await client.query('COMMIT');

    res.status(200).json({ 
      success: true,
      message: "Gate pass period updated successfully",
      application: result.rows[0],
      changes: {
        old: {
          from: oldFromDate,
          to: oldToDate
        },
        new: {
          from: gatePassPeriodFrom,
          to: gatePassPeriodTo
        }
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error modifying gate pass period:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to update gate pass period",
      details: error.message
    });
  } finally {
    client.release();
  }
});

// 2. Approve Application
router.post("/:id/approve", async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `UPDATE gate_pass_applications
       SET status = 'approved_by_safety'
       WHERE id = $1`,
      [id]
    )
    res.status(200).json({ message: "Application approved by safety officer" })
  } catch (error) {
    console.error("Error approving application:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
})

// 3. Reject Application
router.post("/:id/reject", async (req, res) => {
  const { id } = req.params
  const { remarks } = req.body

  try {
    const result = await pool.query(
      `UPDATE gate_pass_applications
       SET status = 'rejected_by_safety',
           rejection_remarks = $1
       WHERE id = $2`,
      [remarks, id]
    )
    res.status(200).json({ message: "Application rejected by safety officer" })
  } catch (error) {
    console.error("Error rejecting application:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
})

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM gate_pass_applications
       WHERE status IN ('approved_by_sse_pending_with_safety', 'approved_by_safety', 'rejected_by_safety')
       ORDER BY submitted_date DESC`
    )
    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error fetching applications:", error)
    res.status(500).json({ error: "Failed to fetch applications" })
  }
})

// Add these routes to your existing safety.js file

// GET: Applications assigned to specific safety officer
router.get("/assigned/:safetyOfficerId", async (req, res) => {
  const { safetyOfficerId } = req.params;
  
  try {
    if (!/^\d+$/.test(safetyOfficerId)) {
      return res.status(400).json({ error: "Invalid safety officer ID format" });
    }

    const result = await pool.query(`
      SELECT 
        gpa.id,
        gpa.loa_number,
        gpa.contract_supervisor_name as supervisor_name,
        gpa.supervisor_phone,
        gpa.gate_pass_period_from,
        gpa.gate_pass_period_to,
        gpa.number_of_persons,
        gpa.number_of_supervisors,
        CONCAT(TO_CHAR(gpa.gate_pass_period_from, 'YYYY-MM-DD'), ' to ', TO_CHAR(gpa.gate_pass_period_to, 'YYYY-MM-DD')) as gate_pass_period,
        gpa.status,
        gpa.tool_items,
        gpa.insurance_coverage,
        gpa.esi_insurance_no,
        gpa.labour_license_no,
        gpa.migration_license_no,
        TO_CHAR(gpa.submitted_date, 'YYYY-MM-DD') as submitted_date,
        gpa.officerl_remarks as sse_remarks,
        gpa.special_timing,
        gpa.special_timing_from,
        gpa.special_timing_to,
        gpa.has_insurance,
        gpa.insurance_no,
        gpa.insurance_persons,
        gpa.has_esi,
        gpa.esi_number,
        gpa.esi_persons,
        gpa.labour_remarks,
        gpa.migration_details,
        gpa.migration_remarks,
        f.firm_name,
        f.contractor_name,
        f.email,
        f.phone as firm_phone,
        f.address as firm_address,
        f.pan as firm_pan,
        f.gst as firm_gst,
        sse_user.full_name as approved_by_sse
      FROM gate_pass_applications gpa
      LEFT JOIN firms f ON gpa.firm_id = f.id
      LEFT JOIN users sse_user ON sse_user.role = 'sse'
      WHERE gpa.assigned_safety_officer_id = $1 
        AND gpa.status = 'forwarded_to_safety'
      ORDER BY gpa.submitted_date DESC
    `, [safetyOfficerId]);
    
    // Transform data for frontend
    const applications = result.rows.map(app => {
      // Parse tool_items
      let toolsAndMaterials = [];
      if (app.tool_items) {
        try {
          toolsAndMaterials = JSON.parse(app.tool_items);
        } catch (error) {
          console.error("Error parsing tool items:", error);
          toolsAndMaterials = [];
        }
      }

      return {
        id: app.id.toString(),
        loaNumber: app.loa_number,
        firmName: app.firm_name,
        contractorName: app.contractor_name,
        supervisorName: app.supervisor_name,
        supervisorPhone: app.supervisor_phone,
        numberOfPersons: app.number_of_persons?.toString() || "0",
        numberOfSupervisors: app.number_of_supervisors?.toString() || "0",
        gatePassPeriodFrom: app.gate_pass_period_from,
        gatePassPeriodTo: app.gate_pass_period_to,
        submittedDate: app.submitted_date,
        status: "approved_by_sse_pending_safety",
        toolsAndMaterials: toolsAndMaterials,
        insuranceInfo: {
          coverage: app.insurance_coverage,
          esiNo: app.esi_insurance_no,
          labourLicense: app.labour_license_no,
          migrationLicense: app.migration_license_no
        },
        contractInfo: {
          contractPeriodFrom: app.gate_pass_period_from,
          contractPeriodTo: app.gate_pass_period_to,
          pan: app.firm_pan,
          gst: app.firm_gst,
          address: app.firm_address,
          email: app.email,
          phone: app.firm_phone
        },
        // Additional fields
        specialTiming: app.special_timing,
        specialTimingFrom: app.special_timing_from,
        specialTimingTo: app.special_timing_to,
        hasInsurance: app.has_insurance,
        insuranceNo: app.insurance_no,
        insurancePersons: app.insurance_persons,
        hasEsi: app.has_esi,
        esiNumber: app.esi_number,
        esiPersons: app.esi_persons,
        labourRemarks: app.labour_remarks,
        migrationDetails: app.migration_details,
        migrationRemarks: app.migration_remarks,
        sseRemarks: app.sse_remarks,
        approvedBySSE: app.approved_by_sse
      };
    });
    
    res.json({
      success: true,
      applications: applications,
      count: applications.length
    });
  } catch (err) {
    console.error("Error fetching assigned safety officer applications:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch assigned applications" 
    });
  }
});

// POST: Safety Officer Approve Application
router.post("/:id/approve", async (req, res) => {
  const { id } = req.params;
  const { safetyOfficerId, remarks } = req.body;
  
  try {
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: "Invalid application ID format" });
    }

    // Verify this application is assigned to this safety officer
    const checkAssignment = await pool.query(
      'SELECT assigned_safety_officer_id FROM gate_pass_applications WHERE id = $1',
      [id]
    );

    if (checkAssignment.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (checkAssignment.rows[0].assigned_safety_officer_id != safetyOfficerId) {
      return res.status(403).json({ error: "You are not assigned to this application" });
    }

    const result = await pool.query(
      `UPDATE gate_pass_applications
       SET status = 'approved_by_safety',
           officer2_status = 'approved',
           officer2_remarks = $1,
           officer2_reviewed_date = NOW()
       WHERE id = $2 RETURNING *`,
      [remarks || "Approved by Safety Officer", id]
    );

    res.json({
      success: true,
      message: "Application approved by Safety Officer",
      application: result.rows[0]
    });
  } catch (error) {
    console.error("Error approving application:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to approve application" 
    });
  }
});

// POST: Safety Officer Reject Application
router.post("/:id/reject", async (req, res) => {
  const { id } = req.params;
  const { safetyOfficerId, remarks } = req.body;

  try {
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: "Invalid application ID format" });
    }

    if (!remarks || !remarks.trim()) {
      return res.status(400).json({ error: "Remarks are required for rejection" });
    }

    // Verify this application is assigned to this safety officer
    const checkAssignment = await pool.query(
      'SELECT assigned_safety_officer_id FROM gate_pass_applications WHERE id = $1',
      [id]
    );

    if (checkAssignment.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (checkAssignment.rows[0].assigned_safety_officer_id != safetyOfficerId) {
      return res.status(403).json({ error: "You are not assigned to this application" });
    }

    const result = await pool.query(
      `UPDATE gate_pass_applications
       SET status = 'rejected_by_safety',
           officer2_status = 'rejected',
           officer2_remarks = $1,
           officer2_reviewed_date = NOW()
       WHERE id = $2 RETURNING *`,
      [remarks, id]
    );

    res.json({
      success: true,
      message: "Application rejected by Safety Officer",
      application: result.rows[0]
    });
  } catch (error) {
    console.error("Error rejecting application:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to reject application" 
    });
  }
});

module.exports = router

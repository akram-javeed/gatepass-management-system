const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const PDFDocument = require('pdfkit');
const emailService = require('../services/emailService');

// Ensure uploads directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  }
});

// Status mapping for different roles
const roleStatusMap = {
  sse: "pending_with_sse",
  safety_officer: "pending_with_safety", 
  officer1: "pending_with_officer1",
  officer2: "pending_with_officer2",
  chos_npb: "pending_with_chos"
};

// Helper function to log application changes
const logApplicationChange = async (applicationId, userId, userRole, oldStatus, newStatus, action, remarks = null) => {
  try {
    await pool.query(
      `INSERT INTO application_logs (application_id, changed_by_user_id, changed_by_role, old_status, new_status, action, remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [applicationId, userId, userRole, oldStatus, newStatus, action, remarks]
    );
  } catch (error) {
    console.error("Error logging application change:", error);
  }
};

// Helper function to send email notification
//sendEmailNotification function
const sendEmailNotification = async (applicationId, recipientEmail, emailType, subject, applicationData) => {
  try {
    // Log to database (keep existing functionality)
    await pool.query(
      `INSERT INTO email_notifications (application_id, recipient_email, email_type, subject, status)
       VALUES ($1, $2, $3, $4, 'pending')`,
      [applicationId, recipientEmail, emailType, subject]
    );

    // Actually send the email
    const emailResult = await emailService.sendApplicationEmail(recipientEmail, emailType, applicationData);
    
    if (emailResult.success) {
      // Update status to sent
      await pool.query(
        `UPDATE email_notifications 
         SET status = 'sent', sent_at = NOW(), message_id = $1 
         WHERE application_id = $2 AND recipient_email = $3 AND email_type = $4 AND status = 'pending'`,
        [emailResult.messageId, applicationId, recipientEmail, emailType]
      );
      console.log(`Email sent successfully to ${recipientEmail}`);
    } else {
      // Update status to failed
      await pool.query(
        `UPDATE email_notifications 
         SET status = 'failed', error_message = $1 
         WHERE application_id = $2 AND recipient_email = $3 AND email_type = $4 AND status = 'pending'`,
        [emailResult.error, applicationId, recipientEmail, emailType]
      );
      console.error(`Email failed to send to ${recipientEmail}:`, emailResult.error);
    }

    return emailResult.success;
  } catch (error) {
    console.error("Error in email notification:", error);
    return false;
  }
};

// Function to notify approver about new application
const notifyApprover = async (applicationId, approverEmail, approverName, userRole, applicationData) => {
  try {
    const notificationData = {
      ...applicationData,
      approverName: approverName,
      userRole: userRole
    };

    return await sendEmailNotification(
      applicationId,
      approverEmail,
      'new_application_notification',
      `New Gate Pass Application ${applicationData.loaNumber} - Action Required`,
      notificationData
    );
  } catch (error) {
    console.error('Error sending approver notification:', error);
    return false;
  }
};

// Function to notify contractor about approval
const notifyContractorApproval = async (applicationId, contractorEmail, approvedBy, applicationData) => {
  try {
    const notificationData = {
      ...applicationData,
      approvedBy: approvedBy
    };

    return await sendEmailNotification(
      applicationId,
      contractorEmail,
      'approval',
      `Gate Pass Application ${applicationData.loaNumber} - Approved by ${approvedBy}`,
      notificationData
    );
  } catch (error) {
    console.error('Error sending contractor approval notification:', error);
    return false;
  }
};

// Function to notify contractor about rejection
const notifyContractorRejection = async (applicationId, contractorEmail, rejectedBy, rejectionReason, applicationData) => {
  try {
    const notificationData = {
      ...applicationData,
      rejectedBy: rejectedBy,
      rejectionReason: rejectionReason
    };

    return await sendEmailNotification(
      applicationId,
      contractorEmail,
      'rejection',
      `Gate Pass Application ${applicationData.loaNumber} - Rejected by ${rejectedBy}`,
      notificationData
    );
  } catch (error) {
    console.error('Error sending contractor rejection notification:', error);
    return false;
  }
};

// Function to notify next approver about forwarded application
const notifyForwardedApprover = async (applicationId, approverEmail, approverName, userRole, forwardedBy, applicationData) => {
  try {
    const notificationData = {
      ...applicationData,
      approverName: approverName,
      userRole: userRole,
      forwardedBy: forwardedBy
    };

    return await sendEmailNotification(
      applicationId,
      approverEmail,
      'forwarded_notification',
      `Gate Pass Application ${applicationData.loaNumber} - Forwarded for Your Review`,
      notificationData
    );
  } catch (error) {
    console.error('Error sending forwarded approver notification:', error);
    return false;
  }
};

// POST: Create new gate pass application
router.post("/", upload.fields([
  { name: 'factory_manager_approval_file', maxCount: 1 },
  { name: 'insurance_file', maxCount: 1 },
  { name: 'esi_file', maxCount: 1 },
  { name: 'uploadedFile', maxCount: 1 }
]), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Backend - Received gate pass application');
    console.log('Backend - Form data keys:', Object.keys(req.body));
    console.log('Backend - Files received:', req.files ? Object.keys(req.files) : 'No files');

    // Extract form data
    const {
      loa_number,
      contract_supervisor_name,
      supervisors,
      supervisor_phone,
      gate_pass_period_from,
      gate_pass_period_to,
      number_of_persons,
      number_of_supervisors,
      special_timing,
      special_timing_from,
      special_timing_to,
      labour_license,
      license_no,
      employee_count,
      labour_remarks,
      inter_state_migration,
      migration_license_no,
      migration_details,
      migration_remarks,
      has_insurance,
      insurance_no,
      insurance_persons,
      insurance_from,
      insurance_to,
      has_esi,
      esi_number,
      esi_persons,
      esi_date_of_issue,
      tool_items
    } = req.body;
    
    console.log('Backend - Received LOA number:', loa_number);
    
    // Validate required fields
    if (!loa_number || !contract_supervisor_name || !supervisor_phone) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['loa_number', 'contract_supervisor_name', 'supervisor_phone'],
        received: {
          loa_number: !!loa_number,
          contract_supervisor_name: !!contract_supervisor_name,
          supervisor_phone: !!supervisor_phone
        }
      });
    }

    if (!gate_pass_period_from || !gate_pass_period_to) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Gate pass period dates are required'
      });
    }

    // FETCH THE EXECUTING SSE FROM THE CONTRACT
    console.log('Backend - Fetching contract and firm details for LOA:', loa_number);
    const contractResult = await client.query(
      `SELECT 
        c.id as contract_id,
        c.executing_sse_id, 
        c.work_description, 
        c.shift_timing,
        c.firm_id,
        f.id as firm_table_id,
        f.firm_name,
        f.contractor_name,
        f.email,
        f.phone,
        f.address,
        f.pan,
        f.gst
      FROM contracts c
      LEFT JOIN firms f ON c.firm_id = f.id
      WHERE c.loa_number = $1`,
      [loa_number]
    );

    if (contractResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Invalid LOA number - contract not found',
        loa_number: loa_number
      });
    }

    const contractInfo = contractResult.rows[0];
    const executingSseId = contractInfo.executing_sse_id;
    const contractFirmId = contractInfo.firm_id;

    console.log('Backend - Contract details:', {
      contract_id: contractInfo.contract_id,
      firm_id: contractFirmId,
      firm_name: contractInfo.firm_name,
      executing_sse_id: executingSseId
    });

    if (!executingSseId) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'No executing SSE assigned to this contract. Please contact Contract Section.',
        loa_number: loa_number
      });
    }

    // Parse tool items if present
    let parsedToolItems = [];
    if (tool_items) {
      try {
        parsedToolItems = JSON.parse(tool_items);
      } catch (error) {
        console.log('Backend - Could not parse tool_items:', error);
        parsedToolItems = [];
      }
    }

    // Parse supervisors data
    let supervisorsData = [];
    let primarySupervisor = { name: contract_supervisor_name, phone: supervisor_phone };
    
    if (supervisors) {
      try {
        supervisorsData = JSON.parse(supervisors);
        if (Array.isArray(supervisorsData) && supervisorsData.length > 0) {
          primarySupervisor = supervisorsData[0];
        }
      } catch (e) {
        console.log('Could not parse supervisors, using individual fields');
        supervisorsData = [{
          id: '1',
          name: contract_supervisor_name,
          phone: supervisor_phone
        }];
      }
    } else {
      supervisorsData = [{
        id: '1',
        name: contract_supervisor_name,
        phone: supervisor_phone
      }];
    }
    console.log("Supervisors for application:", supervisorsData);

    // Process uploaded files
    const files = {};
    if (req.files) {
      if (req.files.factory_manager_approval_file) {
        files.factory_manager_approval = req.files.factory_manager_approval_file[0].filename;
      }
      if (req.files.insurance_file) {
        files.insurance_file = req.files.insurance_file[0].filename;
      }
      if (req.files.esi_file) {
        files.esi_file = req.files.esi_file[0].filename;
      }
      if (req.files.uploadedFile) {
        files.main_file = req.files.uploadedFile[0].filename;
      }
    }

    // Prepare data for database insertion WITH firm details
    const applicationData = {
      firm_id: contractFirmId ? contractFirmId.toString() : null,
      loa_number,
      // Store supervisors as JSON
      supervisors: supervisorsData ? JSON.stringify(supervisorsData) : null,
      // Keep primary supervisor for backward compatibility
      contract_supervisor_name: primarySupervisor.name || contract_supervisor_name,
      supervisor_phone: primarySupervisor.phone || supervisor_phone,
      // Firm details from joined query
      firm_name: contractInfo.firm_name || null,
      contractor_name: contractInfo.contractor_name || null,
      contractor_email: contractInfo.email || null,
      contractor_phone: contractInfo.phone || null,
      contractor_address: contractInfo.address || null,
      firm_pan: contractInfo.pan || null,
      firm_gst: contractInfo.gst || null,
      // Gate pass details
      gate_pass_period_from,
      gate_pass_period_to,
      number_of_persons: parseInt(number_of_persons) || 0,
      number_of_supervisors: parseInt(number_of_supervisors) || 0,
      // Special timing
      special_timing: special_timing === 'true',
      special_timing_from: special_timing === 'true' ? special_timing_from : null,
      special_timing_to: special_timing === 'true' ? special_timing_to : null,
      // Labour license
      labour_license: labour_license === 'true',
      license_no: license_no || null,
      employee_count: parseInt(employee_count) || 0,
      labour_remarks: labour_remarks || null,
      // Migration
      inter_state_migration: inter_state_migration === 'true',
      migration_license_no: migration_license_no || null,
      migration_details: migration_details || null,
      migration_remarks: migration_remarks || null,
      // Insurance
      has_insurance: has_insurance === 'true',
      insurance_no: has_insurance === 'true' ? insurance_no : null,
      insurance_persons: has_insurance === 'true' ? insurance_persons : null,
      insurance_from: has_insurance === 'true' ? insurance_from : null,
      insurance_to: has_insurance === 'true' ? insurance_to : null,
      // ESI
      has_esi: has_esi === 'true',
      esi_number: has_esi === 'true' ? esi_number : null,
      esi_persons: has_esi === 'true' ? esi_persons : null,
      esi_date_of_issue: has_esi === 'true' ? esi_date_of_issue : null,
      // Tools and files
      tool_items: JSON.stringify(parsedToolItems),
      uploaded_files: JSON.stringify(files),
      // Workflow fields
      executing_sse_id: executingSseId,
      status: 'pending_with_sse',
      submitted_date: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };
    
    console.log('Backend - Application data prepared');
    console.log('Backend - Firm ID:', applicationData.firm_id);
    console.log('Backend - Number of supervisors:', supervisorsData.length);
    
    // Build the INSERT query dynamically
    const columns = Object.keys(applicationData).filter(key => applicationData[key] !== undefined);
    const values = columns.map(key => applicationData[key]);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const insertQuery = `
      INSERT INTO gate_pass_applications (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    console.log('Backend - Executing insert query with firm details...');
    const result = await client.query(insertQuery, values);
    const newApplication = result.rows[0];

    console.log('Backend - Application created successfully with firm details:', {
      id: newApplication.id,
      loa_number: newApplication.loa_number,
      firm_name: newApplication.firm_name,
      contractor_name: newApplication.contractor_name,
      status: newApplication.status,
      executing_sse_id: newApplication.executing_sse_id
    });
    
    // Log the application creation
    try {
      await client.query(
        `INSERT INTO application_logs 
        (application_id, changed_by_user_id, changed_by_role, old_status, new_status, action, remarks)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          newApplication.id,
          null, // No user ID for public submission
          'contractor', 
          null, 
          'pending_with_sse', 
          'create', 
          `Application submitted by contractor and assigned to SSE ID: ${executingSseId}`
        ]
      );
      console.log('Application change logged successfully');
    } catch (logError) {
      console.error('Error logging application change:', logError);
      // Don't fail the whole transaction for logging error
    }

    await client.query('COMMIT');
    console.log('Transaction committed successfully');
    
    // Send email notification WITHIN the same transaction
    if (contractInfo.email) {
      try {
        const fromDate = new Date(gate_pass_period_from).toLocaleDateString('en-IN');
        const toDate = new Date(gate_pass_period_to).toLocaleDateString('en-IN');
        
        // 1. Send confirmation to contractor
        await sendEmailNotification(
          newApplication.id,
          contractInfo.email,
          'application_submitted',
          `Gate Pass Application ${loa_number} - Received`,
          {
            applicationId: newApplication.id.toString(),
            loaNumber: newApplication.loa_number,
            firmName: newApplication.firm_name,
            contractorName: newApplication.contractor_name,
            numberOfPersons: newApplication.number_of_persons?.toString() || '0',
            gatePassPeriod: `${fromDate} to ${toDate}`,
            submittedDate: new Date().toLocaleDateString('en-IN')
          }
        );

        // 2. Notify executing SSE about new application
        if (executingSseId) {
          const sseDetails = await client.query(
            'SELECT email, full_name FROM users WHERE id = $1 AND role = $2',
            [executingSseId, 'sse']
          );
          
          if (sseDetails.rows.length > 0) {
            const sse = sseDetails.rows[0];
            await notifyApprover(
              newApplication.id,
              sse.email,
              sse.full_name,
              'sse',
              {
                applicationId: newApplication.id.toString(),
                loaNumber: newApplication.loa_number,
                firmName: newApplication.firm_name,
                contractorName: newApplication.contractor_name,
                numberOfPersons: newApplication.number_of_persons?.toString() || '0',
                gatePassPeriod: `${fromDate} to ${toDate}`,
                submittedDate: new Date().toLocaleDateString('en-IN')
              }
            );
          }
        }

        console.log(`Email notifications sent for application ${newApplication.id}`);
      } catch (emailError) {
        console.error('Error sending email notifications:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Gate pass application submitted successfully',
      application: {
        id: newApplication.id.toString(),
        loa_number: newApplication.loa_number,
        firm_id: newApplication.firm_id,
        firm_name: newApplication.firm_name,
        contractor_name: newApplication.contractor_name || contractInfo.contractor_name,
        status: newApplication.status,
        submitted_date: newApplication.submitted_date.toISOString(),
        executing_sse_id: newApplication.executing_sse_id
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Backend - Error creating gate pass application:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});

// Temporary GET route for testing
router.get("/test-email", (req, res) => {
  res.json({ message: "Test email route exists! Use POST method with email in body." });
});
// POST: Test email functionality
router.post("/test-email", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: "Email address is required" 
      });
    }
    
    console.log(`Testing email service with: ${email}`);
    
    const testData = {
      applicationId: "TEST-001",
      loaNumber: "LOA/2024/TEST",
      firmName: "Test Company Pvt Ltd",
      contractorName: "Test Contractor",
      numberOfPersons: "5",
      gatePassPeriod: "01/01/2024 to 31/01/2024",
      submittedDate: new Date().toLocaleDateString('en-IN')
    };

    console.log("Attempting to send test email...");
    const result = await emailService.sendApplicationEmail(
      email, 
      'application_submitted', 
      testData
    );

    if (result.success) {
      console.log("Test email sent successfully!");
      res.json({ 
        success: true, 
        message: "Test email sent successfully!",
        messageId: result.messageId,
        sentTo: email
      });
    } else {
      console.error("Test email failed:", result.error);
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Test email route error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
// Simple test route - add this near the end, before module.exports
router.get("/ping", (req, res) => {
  res.json({ 
    success: true, 
    message: "Gate pass API is working!", 
    timestamp: new Date().toISOString() 
  });
});

// POST: Fix all missing firm data in existing applications
router.post("/fix-all-firm-data", async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log("=== Starting comprehensive firm data fix ===");
    
    // Step 1: Check how many applications have missing firm data
    const checkMissing = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN firm_name IS NULL OR firm_name = '' OR firm_name = 'N/A' THEN 1 END) as missing_firm_name,
        COUNT(CASE WHEN contractor_name IS NULL OR contractor_name = '' OR contractor_name = 'N/A' THEN 1 END) as missing_contractor_name
      FROM gate_pass_applications
    `);
    
    console.log("Current status:", checkMissing.rows[0]);
    
    // Step 2: Update using direct firm_id (integer comparison)
    console.log("Step 2: Updating using direct firm_id...");
    const updateDirect = await client.query(`
      UPDATE gate_pass_applications gpa
      SET 
        firm_name = f.firm_name,
        contractor_name = f.contractor_name,
        contractor_email = COALESCE(gpa.contractor_email, f.email),
        contractor_phone = COALESCE(gpa.contractor_phone, f.phone),
        contractor_address = COALESCE(gpa.contractor_address, f.address),
        firm_pan = COALESCE(gpa.firm_pan, f.pan),
        firm_gst = COALESCE(gpa.firm_gst, f.gst),
        updated_at = NOW()
      FROM firms f
      WHERE gpa.firm_id = f.id  -- Direct integer comparison
        AND (gpa.firm_name IS NULL OR gpa.firm_name = '' OR gpa.firm_name = 'N/A' 
             OR gpa.contractor_name IS NULL OR gpa.contractor_name = '' OR gpa.contractor_name = 'N/A')
      RETURNING gpa.id, gpa.loa_number, f.firm_name, f.contractor_name
    `);
    
    console.log(`Updated ${updateDirect.rows.length} applications using direct firm_id`);
    
    // Step 3: Update using contract's firm_id
    console.log("Step 3: Updating using contract firm_id...");
    const updateViaContract = await client.query(`
      UPDATE gate_pass_applications gpa
      SET 
        firm_name = f.firm_name,
        contractor_name = f.contractor_name,
        contractor_email = COALESCE(gpa.contractor_email, f.email),
        contractor_phone = COALESCE(gpa.contractor_phone, f.phone),
        contractor_address = COALESCE(gpa.contractor_address, f.address),
        firm_pan = COALESCE(gpa.firm_pan, f.pan),
        firm_gst = COALESCE(gpa.firm_gst, f.gst),
        updated_at = NOW()
      FROM contracts c
      INNER JOIN firms f ON c.firm_id = f.id
      WHERE gpa.loa_number = c.loa_number
        AND (gpa.firm_name IS NULL OR gpa.firm_name = '' OR gpa.firm_name = 'N/A' 
             OR gpa.contractor_name IS NULL OR gpa.contractor_name = '' OR gpa.contractor_name = 'N/A')
      RETURNING gpa.id, gpa.loa_number, f.firm_name, f.contractor_name
    `);
    
    console.log(`Updated ${updateViaContract.rows.length} applications using contract firm_id`);
    
    // Step 4: Final check
    const finalCheck = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN firm_name IS NULL OR firm_name = '' OR firm_name = 'N/A' THEN 1 END) as still_missing_firm_name,
        COUNT(CASE WHEN contractor_name IS NULL OR contractor_name = '' OR contractor_name = 'N/A' THEN 1 END) as still_missing_contractor_name
      FROM gate_pass_applications
    `);
    
    // Step 5: Get details of remaining problematic records
    const problematicRecords = await client.query(`
      SELECT 
        id,
        loa_number,
        firm_id,
        firm_name,
        contractor_name,
        status
      FROM gate_pass_applications
      WHERE (firm_name IS NULL OR firm_name = '' OR firm_name = 'N/A' 
             OR contractor_name IS NULL OR contractor_name = '' OR contractor_name = 'N/A')
      LIMIT 10
    `);
    
    await client.query('COMMIT');
    
    const totalFixed = updateDirect.rows.length + updateViaContract.rows.length;
    
    res.json({
      success: true,
      message: `Fixed firm data for ${totalFixed} applications`,
      before: checkMissing.rows[0],
      after: finalCheck.rows[0],
      details: {
        fixedDirectly: updateDirect.rows.length,
        fixedViaContract: updateViaContract.rows.length,
        totalFixed: totalFixed
      },
      problematicRecords: problematicRecords.rows
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error fixing firm data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fix firm data",
      details: error.message
    });
  } finally {
    client.release();
  }
});

// GET: Diagnose firm data issues for a specific application
router.get("/diagnose-firm-data/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        gpa.id,
        gpa.loa_number,
        gpa.firm_id,
        gpa.firm_name as stored_firm_name,
        gpa.contractor_name as stored_contractor_name,
        f1.id as direct_firm_id,
        f1.firm_name as direct_firm_name,
        f1.contractor_name as direct_contractor_name,
        c.firm_id as contract_firm_id,
        f2.firm_name as contract_firm_name,
        f2.contractor_name as contract_contractor_name
      FROM gate_pass_applications gpa
      LEFT JOIN firms f1 ON gpa.firm_id = f1.id
      LEFT JOIN contracts c ON gpa.loa_number = c.loa_number
      LEFT JOIN firms f2 ON c.firm_id = f2.id
      WHERE gpa.id = $1
    `, [applicationId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }
    
    res.json({
      success: true,
      diagnosis: result.rows[0],
      analysis: {
        has_firm_id: result.rows[0].firm_id !== null,
        firm_id_matches: result.rows[0].direct_firm_id !== null,
        has_contract_firm: result.rows[0].contract_firm_id !== null,
        stored_data_exists: result.rows[0].stored_firm_name !== null && result.rows[0].stored_firm_name !== 'N/A'
      }
    });
    
  } catch (error) {
    console.error("Error diagnosing firm data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to diagnose firm data",
      details: error.message
    });
  }
});

// GET: Applications assigned to specific SSE user
router.get("/sse/:sseUserId", async (req, res) => {
  try {
    const { sseUserId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    console.log(`=== SSE Applications Debug ===`);
    console.log(`SSE User ID: ${sseUserId}`);
    
    // Validate SSE user ID
    if (!/^\d+$/.test(sseUserId)) {
      console.log("Invalid SSE user ID format");
      return res.status(400).json({ 
        success: false, 
        error: "Invalid SSE user ID format" 
      });
    }

    // Step 1: Verify user exists and is SSE
    console.log("Step 1: Verifying SSE user...");
    const sseUserCheck = await pool.query(
      'SELECT id, full_name, employee_id, role FROM users WHERE id = $1 AND role = $2',
      [sseUserId, 'sse']
    );

    if (sseUserCheck.rows.length === 0) {
      console.log("SSE user not found");
      return res.status(400).json({
        success: false,
        error: "SSE user not found",
        sseUserId: sseUserId
      });
    }

    const sseUser = sseUserCheck.rows[0];
    console.log(`Found SSE user: ${sseUser.full_name} (ID: ${sseUser.id})`);

    // Step 2: Query applications with proper firm data joins
    console.log("Step 2: Fetching applications assigned to this SSE...");
    const query = `
      SELECT 
        gpa.id,
        gpa.loa_number,
        gpa.contract_supervisor_name as supervisor_name,
        gpa.supervisor_phone,
        gpa.gate_pass_period_from,
        gpa.gate_pass_period_to,
        gpa.number_of_persons,
        gpa.number_of_supervisors,
        CONCAT(TO_CHAR(gpa.gate_pass_period_from, 'DD/MM/YYYY'), ' to ', TO_CHAR(gpa.gate_pass_period_to, 'DD/MM/YYYY')) as gate_pass_period,
        gpa.status,
        gpa.rejection_reason,
        TO_CHAR(gpa.submitted_date, 'DD Mon YYYY') as submitted_date,
        TO_CHAR(gpa.updated_at, 'YYYY-MM-DD HH24:MI') as updated_at,
        gpa.tool_items,
        gpa.special_timing,
        gpa.special_timing_from,
        gpa.special_timing_to,
        gpa.has_insurance,
        gpa.has_esi,
        gpa.labour_license,
        gpa.inter_state_migration,
        gpa.firm_id,
        -- First check if firm data is already stored in gate_pass_applications
        -- If not, get it from firms table using firm_id
        CASE 
          WHEN gpa.firm_name IS NOT NULL AND gpa.firm_name != '' AND gpa.firm_name != 'N/A' 
          THEN gpa.firm_name
          WHEN f1.firm_name IS NOT NULL 
          THEN f1.firm_name
          WHEN f2.firm_name IS NOT NULL 
          THEN f2.firm_name
          ELSE 'N/A'
        END as firm_name,
        CASE 
          WHEN gpa.contractor_name IS NOT NULL AND gpa.contractor_name != '' AND gpa.contractor_name != 'N/A' 
          THEN gpa.contractor_name
          WHEN f1.contractor_name IS NOT NULL 
          THEN f1.contractor_name
          WHEN f2.contractor_name IS NOT NULL 
          THEN f2.contractor_name
          ELSE 'N/A'
        END as contractor_name,
        COALESCE(gpa.contractor_email, f1.email, f2.email) as contractor_email,
        COALESCE(gpa.contractor_phone, f1.phone, f2.phone) as contractor_phone,
        COALESCE(gpa.contractor_address, f1.address, f2.address) as contractor_address,
        COALESCE(gpa.firm_pan, f1.pan, f2.pan) as pan,
        COALESCE(gpa.firm_gst, f1.gst, f2.gst) as gst,
        c.work_description,
        c.shift_timing,
        c.contract_period_from,
        c.contract_period_to
      FROM gate_pass_applications gpa
      LEFT JOIN firms f1 ON gpa.firm_id::integer = f1.id  -- Direct join using firm_id with type cast
      LEFT JOIN contracts c ON gpa.loa_number = c.loa_number
      LEFT JOIN firms f2 ON c.firm_id = f2.id     -- Firm via contract
      WHERE gpa.executing_sse_id = $1 
        AND gpa.status = 'pending_with_sse'
      ORDER BY gpa.submitted_date DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [sseUserId, limit, offset]);
    console.log(`Query executed. Found ${result.rows.length} pending applications`);

    // Debug first application's firm data
    if (result.rows.length > 0) {
      console.log("First application firm data:", {
        id: result.rows[0].id,
        firm_id: result.rows[0].firm_id,
        firm_name: result.rows[0].firm_name,
        contractor_name: result.rows[0].contractor_name
      });
    }

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) 
      FROM gate_pass_applications 
      WHERE executing_sse_id = $1 AND status = 'pending_with_sse'
    `;
    const countResult = await pool.query(countQuery, [sseUserId]);
    const totalCount = parseInt(countResult.rows[0].count);

    // Transform the data
    const applications = result.rows.map(app => {
      let toolsItems = [];
      if (app.tool_items) {
        try {
          toolsItems = JSON.parse(app.tool_items);
        } catch (error) {
          console.error("Error parsing tool items:", error);
          toolsItems = [];
        }
      }

      return {
        id: app.id.toString(),
        loaNumber: app.loa_number,
        firmName: app.firm_name || 'N/A',
        contractorName: app.contractor_name || 'N/A',
        supervisorName: app.supervisor_name || 'N/A',
        supervisorPhone: app.supervisor_phone,
        numberOfPersons: app.number_of_persons?.toString() || "0",
        numberOfSupervisors: app.number_of_supervisors?.toString() || "0",
        gatePassPeriod: app.gate_pass_period,
        gatePassPeriodFrom: app.gate_pass_period_from,
        gatePassPeriodTo: app.gate_pass_period_to,
        status: app.status,
        rejectionReason: app.rejection_reason,
        submittedDate: app.submitted_date,
        updatedAt: app.updated_at,
        toolsItems: toolsItems,
        specialTiming: app.special_timing,
        specialTimingFrom: app.special_timing_from,
        specialTimingTo: app.special_timing_to,
        hasInsurance: app.has_insurance,
        hasEsi: app.has_esi,
        labourLicense: app.labour_license,
        interStateMigration: app.inter_state_migration,
        contractorEmail: app.contractor_email,
        contractorPhone: app.contractor_phone,
        contractorAddress: app.contractor_address,
        firmPan: app.pan,
        firmGst: app.gst,
        workDescription: app.work_description,
        shiftTiming: app.shift_timing,
        contractPeriodFrom: app.contract_period_from,
        contractPeriodTo: app.contract_period_to,
        assignedSSE: sseUser.full_name,
        sseEmployeeId: sseUser.employee_id
      };
    });

    console.log(`Returning ${applications.length} applications for SSE ${sseUser.full_name}`);

    res.json({
      success: true,
      applications: applications,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      sseUser: {
        id: sseUser.id.toString(),
        name: sseUser.full_name,
        employeeId: sseUser.employee_id
      }
    });

  } catch (error) {
    console.error("=== SSE Applications Error ===");
    console.error("Error details:", error);
    
    res.status(500).json({
      success: false,
      error: "Failed to fetch SSE assigned applications",
      details: error.message
    });
  }
});

// GET: Applications filtered by role/status (for non-SSE users)
router.get("/:role", async (req, res) => {
  try {
    const { role } = req.params;
    
    // Skip SSE role here since it's handled by the specific SSE route above
    if (role === 'sse') {
      return res.status(400).json({ 
        success: false, 
        error: "Use /sse/:sseUserId endpoint for SSE applications" 
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Validate role
    if (!roleStatusMap[role]) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid role provided" 
      });
    }

    const statusFilter = roleStatusMap[role];
    let query = `
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
        gpa.rejection_reason,
        TO_CHAR(gpa.submitted_date, 'YYYY-MM-DD HH24:MI') as submitted_date,
        TO_CHAR(gpa.updated_at, 'YYYY-MM-DD HH24:MI') as updated_at,
        gpa.tool_items,
        gpa.special_timing,
        gpa.has_insurance,
        gpa.has_esi,
        gpa.labour_license,
        gpa.inter_state_migration,
        f.firm_name,
        f.contractor_name,
        f.email as contractor_email,
        f.phone as contractor_phone,
        f.address as contractor_address,
        f.pan,
        f.gst,
        u_sse.full_name as sse_name,
        u_safety.full_name as safety_officer_name,
        u_off1.full_name as officer1_name,
        u_off2.full_name as officer2_name
      FROM gate_pass_applications gpa
      LEFT JOIN firms f ON gpa.firm_id::integer = f.id
      LEFT JOIN users u_sse ON gpa.assigned_safety_officer_id = u_sse.id AND u_sse.role = 'sse'
      LEFT JOIN users u_safety ON gpa.assigned_safety_officer_id = u_safety.id AND u_safety.role = 'safety_officer'
      LEFT JOIN users u_off1 ON gpa.assigned_officer1_id = u_off1.id AND u_off1.role = 'officer1'
      LEFT JOIN users u_off2 ON gpa.assigned_officer2_id = u_off2.id AND u_off2.role = 'officer2'
      WHERE gpa.status = $1
      ORDER BY gpa.submitted_date DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [statusFilter, limit, offset]);
    
    // Get total count
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM gate_pass_applications WHERE status = $1",
      [statusFilter]
    );
    const totalCount = parseInt(countResult.rows[0].count);

    // Transform the data
    const applications = result.rows.map(app => {
      let toolsItems = [];
      if (app.tool_items) {
        try {
          toolsItems = JSON.parse(app.tool_items);
        } catch (error) {
          console.error("Error parsing tool items:", error);
          toolsItems = [];
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
        gatePassPeriod: app.gate_pass_period,
        gatePassPeriodFrom: app.gate_pass_period_from,
        gatePassPeriodTo: app.gate_pass_period_to,
        status: app.status,
        rejectionReason: app.rejection_reason,
        submittedDate: app.submitted_date,
        updatedAt: app.updated_at,
        toolsItems: toolsItems,
        specialTiming: app.special_timing,
        hasInsurance: app.has_insurance,
        hasEsi: app.has_esi,
        labourLicense: app.labour_license,
        interStateMigration: app.inter_state_migration,
        contractorEmail: app.contractor_email,
        contractorPhone: app.contractor_phone,
        contractorAddress: app.contractor_address,
        firmPan: app.pan,
        firmGst: app.gst,
        sseName: app.sse_name,
        safetyOfficerName: app.safety_officer_name,
        officer1Name: app.officer1_name,
        officer2Name: app.officer2_name
      };
    });

    res.json({
      success: true,
      applications: applications,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      roleFilter: role,
      statusFilter: statusFilter
    });

  } catch (error) {
    console.error("Error fetching applications by role:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch applications",
      details: error.message
    });
  }
});

// GET: Get specific application with full details
router.get("/details/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: "Invalid application ID format" });
    }

    const result = await pool.query(`
      SELECT 
        gpa.*,
        f.firm_name, 
        f.contractor_name, 
        f.email as contractor_email, 
        f.phone as contractor_phone,
        f.address as contractor_address, 
        f.pan, 
        f.gst,
        c.work_description,
        c.shift_timing,
        c.contract_period_from,
        c.contract_period_to,
        c.executing_sse_id,
        u_sse.full_name as sse_name,
        u_sse.employee_id as sse_employee_id,
        u_safety.full_name as safety_officer_name,
        u_off1.full_name as officer1_name,
        u_off2.full_name as officer2_name
      FROM gate_pass_applications gpa
      LEFT JOIN firms f ON gpa.firm_id::integer = f.id
      LEFT JOIN contracts c ON gpa.loa_number = c.loa_number
      LEFT JOIN users u_sse ON gpa.executing_sse_id = u_sse.id AND u_sse.role = 'sse'
      LEFT JOIN users u_safety ON gpa.assigned_safety_officer_id = u_safety.id AND u_safety.role = 'safety_officer'
      LEFT JOIN users u_off1 ON gpa.assigned_officer1_id = u_off1.id AND u_off1.role = 'officer1'
      LEFT JOIN users u_off2 ON gpa.assigned_officer2_id = u_off2.id AND u_off2.role = 'officer2'
      WHERE gpa.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }
    
    const application = result.rows[0];
    
    // Parse tool_items
    if (application.tool_items) {
      try {
        application.tool_items = JSON.parse(application.tool_items);
      } catch (err) {
        console.error("Error parsing tool_items:", err);
        application.tool_items = [];
      }
    }

    // Get application logs for audit trail
    const logsResult = await pool.query(`
      SELECT 
        al.*,
        u.full_name as changed_by_name
      FROM application_logs al
      LEFT JOIN users u ON al.changed_by_user_id = u.id
      WHERE al.application_id = $1
      ORDER BY al.timestamp DESC
    `, [id]);

    application.auditLogs = logsResult.rows;
    
    res.json({
      success: true,
      application: application
    });
  } catch (err) {
    console.error("Error fetching application details:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch application details" 
    });
  }
});

// POST: Approve application
router.post("/:id/approve", async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { userId, userRole, remarks, forwardTo, forwardToUserId } = req.body;
    
    // Validate inputs
    if (!/^\d+$/.test(id)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "Invalid application ID format" });
    }

    if (!userId || !userRole) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "User ID and role are required" });
    }

    // Get current application
    const currentApp = await pool.query(
      "SELECT * FROM gate_pass_applications WHERE id = $1",
      [id]
    );

    if (currentApp.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Application not found" });
    }

    const application = currentApp.rows[0];
    const oldStatus = application.status;
    let newStatus;
    let updateQuery;
    let queryParams;

    // Determine new status and build query based on current role
    switch (userRole) {
      case 'sse':
        if (oldStatus !== 'pending_with_sse') {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: "Invalid status transition" });
        }
        newStatus = 'pending_with_safety';
        
        updateQuery = `
          UPDATE gate_pass_applications 
          SET 
            status = $1,
            sse_remarks = $2,
            sse_action = 'approved',
            approved_by_sse_id = $3,
            approved_by_sse_date = NOW(),
            updated_at = NOW()
          WHERE id = $4 
          RETURNING *
        `;
        queryParams = [newStatus, remarks || 'Approved by SSE', userId, id];
        break;

      case 'safety_officer':
        if (oldStatus !== 'pending_with_safety') {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: "Invalid status transition" });
        }
        
        // Safety officer can forward to officer1 or officer2
        if (!forwardTo || !['officer1', 'officer2'].includes(forwardTo)) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: "Must specify forwardTo: officer1 or officer2" });
        }
        
        newStatus = `pending_with_${forwardTo}`;
        
        updateQuery = `
          UPDATE gate_pass_applications 
          SET 
            status = $1,
            safety_remarks = $2,
            safety_action = 'approved',
            approved_by_safety_id = $3,
            approved_by_safety_date = NOW(),
            forwarded_to_officer = $4,
            ${forwardTo === 'officer1' ? 'assigned_officer1_id' : 'assigned_officer2_id'} = $5,
            updated_at = NOW()
          WHERE id = $6 
          RETURNING *
        `;
        queryParams = [
          newStatus, 
          remarks || 'Approved by Safety Officer', 
          userId, 
          forwardTo,
          forwardToUserId || userId,
          id
        ];
        break;

      case 'officer1':
        // Officer1 → Officer2 (NEW FLOW)
        if (oldStatus !== 'pending_with_officer1') {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: "Invalid status transition" });
        }
        newStatus = 'pending_with_officer2';  // Forward to Officer2
        
        updateQuery = `
          UPDATE gate_pass_applications 
          SET 
            status = $1,
            officer1_status = 'approved',
            officer1_remarks = $2,
            officer1_reviewed_date = NOW(),
            approved_by_officer1_date = NOW(),
            assigned_officer1_id = $3,
            updated_at = NOW()
          WHERE id = $4 
          RETURNING *
        `;
        queryParams = [newStatus, remarks || 'Approved by Officer 1', userId, id];
        break;

      case 'officer2':
        // Officer2 → Ch.OS/NPB
        if (oldStatus !== 'pending_with_officer2' && oldStatus !== 'pending_with_officer1') {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: "Invalid status transition" });
        }
        newStatus = 'pending_with_chos';  // Forward to Ch.OS/NPB
        
        updateQuery = `
          UPDATE gate_pass_applications 
          SET 
            status = $1,
            officer2_status = 'approved',
            officer2_remarks = $2,
            officer2_reviewed_date = NOW(),
            approved_by_officer2_date = NOW(),
            assigned_officer2_id = $3,
            updated_at = NOW()
          WHERE id = $4 
          RETURNING *
        `;
        queryParams = [newStatus, remarks || 'Approved by Officer 2', userId, id];
        break;

      case 'chos_npb':
        // Ch.OS/NPB → Final Approval (WITH DSC)
        if (oldStatus !== 'pending_with_chos') {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: "Invalid status transition" });
        }
        newStatus = 'approved';
        
        updateQuery = `
          UPDATE gate_pass_applications 
          SET 
            status = $1,
            approved_by_chos_date = NOW(),
            final_status = 'approved',
            chos_remarks = $2,
            chos_dsc_signature = $3,
            gate_permit_number = $4,
            updated_at = NOW()
          WHERE id = $5 
          RETURNING *
        `;
        // Generate gate permit number
        const gatePermitNumber = `GP-${new Date().getFullYear()}-${String(id).padStart(6, '0')}`;
        
        queryParams = [
          newStatus, 
          remarks || 'Approved with DSC by Ch.OS/NPB',
          'DSC_SIGNED', // This would be actual DSC signature data
          gatePermitNumber,
          id
        ];
        break;

      default:
        await client.query('ROLLBACK');
        return res.status(400).json({ error: "Invalid user role" });
    }

    // Execute the update
    const result = await client.query(updateQuery, queryParams);

    // Log the change
    await logApplicationChange(id, userId, userRole, oldStatus, newStatus, 'approve', remarks);

    // In the approve route (around line 1200), UPDATE the email notification call:
    // FIND this section and REPLACE it:
    if (application.firm_id) {
      const firmResult = await client.query("SELECT email FROM firms WHERE id = $1", [parseInt(application.firm_id)]);
      if (firmResult.rows.length > 0) {
        const contractorEmail = firmResult.rows[0].email;
        
        // Notify contractor about approval
        await notifyContractorApproval(
          id,
          contractorEmail,
          userRole.toUpperCase(),
          {
            applicationId: id,
            loaNumber: application.loa_number,
            contractorName: application.contractor_name,
            currentStatus: newStatus,
            remarks: remarks
          }
        );

        // Notify next approver based on the new status
        let nextApproverQuery = '';
        let nextUserRole = '';
        
        switch (newStatus) {
          case 'pending_with_safety':
            nextApproverQuery = 'SELECT email, full_name FROM users WHERE role = $1 LIMIT 5';
            nextUserRole = 'safety_officer';
            break;
          case 'pending_with_officer1':
            nextApproverQuery = 'SELECT email, full_name FROM users WHERE id = $1';
            nextUserRole = 'officer1';
            break;
          case 'pending_with_officer2':
            nextApproverQuery = 'SELECT email, full_name FROM users WHERE role = $1 LIMIT 1';
            nextUserRole = 'officer2';
            break;
          case 'pending_with_chos':
            nextApproverQuery = 'SELECT email, full_name FROM users WHERE role = $1 LIMIT 3';
            nextUserRole = 'chos_npb';
            break;
        }

        if (nextApproverQuery) {
          const nextApproverResult = await client.query(
            nextApproverQuery, 
            nextUserRole === 'officer1' ? [forwardToUserId || userId] : [nextUserRole]
          );
          
          // IMPORTANT: Loop through ALL approvers, not just the first one
          if (nextApproverResult.rows.length > 0) {
            console.log(`Found ${nextApproverResult.rows.length} ${nextUserRole}(s) to notify`);
            
            // Send email to EACH approver
            for (const approver of nextApproverResult.rows) {
              console.log(`Sending notification to ${approver.full_name} (${approver.email})`);
              
              await notifyForwardedApprover(
                id,
                approver.email,
                approver.full_name,
                nextUserRole,
                userRole.toUpperCase(),
                {
                  applicationId: id,
                  loaNumber: application.loa_number,
                  firmName: application.firm_name,
                  contractorName: application.contractor_name,
                  numberOfPersons: application.number_of_persons?.toString() || '0',
                  gatePassPeriod: `${new Date(application.gate_pass_period_from).toLocaleDateString('en-IN')} to ${new Date(application.gate_pass_period_to).toLocaleDateString('en-IN')}`,
                  submittedDate: new Date(application.submitted_date).toLocaleDateString('en-IN')
                }
              );
            }
            
            console.log(`Email notifications sent to all ${nextApproverResult.rows.length} ${nextUserRole}(s)`);
          }
        }
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `Application ${newStatus === 'approved' ? 'fully approved' : 'approved and forwarded'}`,
      application: result.rows[0],
      oldStatus,
      newStatus
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error approving application:", error);
    res.status(500).json({
      success: false,
      error: "Failed to approve application",
      details: error.message
    });
  } finally {
    client.release();
  }
});

// POST: Reject application
router.post("/:id/reject", async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { userId, userRole, remarks } = req.body;
    
    // Validate inputs
    if (!/^\d+$/.test(id)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "Invalid application ID format" });
    }

    if (!userId || !userRole) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "User ID and role are required" });
    }

    if (!remarks || !remarks.trim()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "Rejection remarks are required" });
    }

    // Get current application
    const currentApp = await pool.query(
      "SELECT * FROM gate_pass_applications WHERE id = $1",
      [id]
    );

    if (currentApp.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Application not found" });
    }

    const application = currentApp.rows[0];
    const oldStatus = application.status;
    let newStatus;
    let updateQuery;
    let queryParams;

    // Determine rejection status and build query based on current role
    switch (userRole) {
      case 'sse':
        newStatus = 'rejected_by_sse';
        
        updateQuery = `
          UPDATE gate_pass_applications 
          SET 
            status = $1,
            rejection_reason = $2,
            sse_remarks = $3,
            sse_action = 'rejected',
            approved_by_sse_id = $4,
            approved_by_sse_date = NOW(),
            final_status = 'rejected',
            updated_at = NOW()
          WHERE id = $5 
          RETURNING *
        `;
        queryParams = [newStatus, remarks, remarks, userId, id];
        break;
        
      case 'safety_officer':
        newStatus = 'rejected_by_safety';
        
        updateQuery = `
          UPDATE gate_pass_applications 
          SET 
            status = $1,
            rejection_reason = $2,
            safety_remarks = $3,
            safety_action = 'rejected',
            approved_by_safety_id = $4,
            approved_by_safety_date = NOW(),
            final_status = 'rejected',
            updated_at = NOW()
          WHERE id = $5 
          RETURNING *
        `;
        queryParams = [newStatus, remarks, remarks, userId, id];
        break;
        
      case 'officer1':
        newStatus = 'rejected_by_officer';
        
        updateQuery = `
          UPDATE gate_pass_applications 
          SET 
            status = $1,
            rejection_reason = $2,
            officer1_status = 'rejected',
            officer1_remarks = $3,
            officer1_reviewed_date = NOW(),
            assigned_officer1_id = $4,
            final_status = 'rejected',
            updated_at = NOW()
          WHERE id = $5 
          RETURNING *
        `;
        queryParams = [newStatus, remarks, remarks, userId, id];
        break;
        
      case 'officer2':
        newStatus = 'rejected_by_officer';
        
        updateQuery = `
          UPDATE gate_pass_applications 
          SET 
            status = $1,
            rejection_reason = $2,
            officer2_status = 'rejected',
            officer2_remarks = $3,
            officer2_reviewed_date = NOW(),
            assigned_officer2_id = $4,
            final_status = 'rejected',
            updated_at = NOW()
          WHERE id = $5 
          RETURNING *
        `;
        queryParams = [newStatus, remarks, remarks, userId, id];
        break;
        
      case 'chos_npb':
        newStatus = 'rejected_by_chos';
        
        updateQuery = `
          UPDATE gate_pass_applications 
          SET 
            status = $1,
            rejection_reason = $2,
            final_status = 'rejected',
            updated_at = NOW()
          WHERE id = $3 
          RETURNING *
        `;
        queryParams = [newStatus, remarks, id];
        break;
        
      default:
        await client.query('ROLLBACK');
        return res.status(400).json({ error: "Invalid user role" });
    }

    // Execute the update
    const result = await client.query(updateQuery, queryParams);

    // Log the change
    await logApplicationChange(id, userId, userRole, oldStatus, newStatus, 'reject', remarks);

    // In the reject route (around line 1400), UPDATE the email notification call:
    if (application.firm_id) {
      const firmResult = await client.query("SELECT email FROM firms WHERE id = $1", [parseInt(application.firm_id)]);
      if (firmResult.rows.length > 0) {
        const contractorEmail = firmResult.rows[0].email;
        
        await notifyContractorRejection(
          id,
          contractorEmail,
          userRole.toUpperCase(),
          remarks,
          {
            applicationId: id,
            loaNumber: application.loa_number,
            contractorName: application.contractor_name
          }
        );
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `Application rejected by ${userRole}`,
      application: result.rows[0],
      oldStatus,
      newStatus,
      rejectionReason: remarks
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error rejecting application:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reject application",
      details: error.message
    });
  } finally {
    client.release();
  }
});

// POST: Generate PDF for application (Ch.OS/NPB only)
router.post("/:id/generate-pdf", async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { userId, userRole } = req.body;
    
    console.log("Backend - Generating PDF for application:", id);
    console.log("Backend - Request body:", { userId, userRole });
    
    // Validate inputs
    if (!/^\d+$/.test(id)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: "Invalid application ID format" 
      });
    }

    if (!userId || !userRole) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: "User ID and role are required" 
      });
    }

    if (userRole !== 'chos_npb') {
      await client.query('ROLLBACK');
      return res.status(403).json({ 
        success: false,
        error: "Only Ch.OS/NPB can generate PDFs" 
      });
    }

    // Get current application with full details
    console.log("Backend - Fetching application details for ID:", id);
    const currentApp = await client.query(`
      SELECT 
        gpa.*,
        gpa.supervisors,
        f.firm_name, 
        f.contractor_name, 
        f.email as contractor_email, 
        f.phone as contractor_phone,
        f.address as contractor_address, 
        f.pan, 
        f.gst
      FROM gate_pass_applications gpa
      LEFT JOIN firms f ON gpa.firm_id::integer = f.id
      WHERE gpa.id = $1
    `, [id]);

    if (currentApp.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        error: "Application not found" 
      });
    }

    const application = currentApp.rows[0];
    const oldStatus = application.status;
    
    console.log("Backend - Current application status:", oldStatus);

    // Validate current status
    if (oldStatus !== 'pending_with_chos') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: `Invalid status transition. Application must be pending with Ch.OS/NPB. Current status: ${oldStatus}`,
        currentStatus: oldStatus
      });
    }

    // Parse supervisors
    let supervisors = [];
    if (application.supervisors) {
      try {
        supervisors = typeof application.supervisors === 'string' 
          ? JSON.parse(application.supervisors) 
          : application.supervisors;
      } catch (e) {
        console.log("Error parsing supervisors for PDF:", e);
      }
    }

    // Fallback to old format if no JSON supervisors
    if ((!supervisors || supervisors.length === 0) && application.contract_supervisor_name) {
      supervisors = [{
        id: '1',
        name: application.contract_supervisor_name,
        phone: application.supervisor_phone
      }];
    }

    console.log("PDF Generation - Application supervisors field:", application.supervisors);
    console.log("PDF Generation - Parsed supervisors:", supervisors);
    console.log("PDF Generation - Number of supervisors:", supervisors.length);

    // Check if PDFKit is installed
    let PDFDocument;
    try {
      PDFDocument = require('pdfkit');
      console.log("Backend - PDFKit loaded successfully");
    } catch (pdfError) {
      console.log("Backend - PDFKit not found, using text placeholder");
    }

    // Generate PDF filename - SANITIZE the LOA number
    const sanitizedLOA = application.loa_number
      .replace(/\//g, '_')     // Replace forward slashes with underscore
      .replace(/\\/g, '_')     // Replace backslashes with underscore
      .replace(/:/g, '_')      // Replace colons with underscore
      .replace(/\*/g, '_')     // Replace asterisks with underscore
      .replace(/\?/g, '_')     // Replace question marks with underscore
      .replace(/"/g, '_')      // Replace quotes with underscore
      .replace(/</g, '_')      // Replace less than with underscore
      .replace(/>/g, '_')      // Replace greater than with underscore
      .replace(/\|/g, '_')     // Replace pipe with underscore
      .replace(/\s+/g, '-'); 
    
    const timestamp = Date.now();
    const pdfFileName = `gate-pass-${sanitizedLOA}-${timestamp}.pdf`;
    const pdfFilePath = `uploads/pdfs/${pdfFileName}`;

    console.log("Backend - Original LOA:", application.loa_number);
    console.log("Backend - Sanitized LOA:", sanitizedLOA);
    console.log("Backend - Generated PDF filename:", pdfFileName);

    // Ensure PDFs directory exists
    const pdfDir = path.join(__dirname, '..', 'uploads', 'pdfs');
    if (!fs.existsSync(pdfDir)) {
      console.log("Backend - Creating PDF directory:", pdfDir);
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Generate gate permit number
    const gatePermitNo = `GP/${new Date().getFullYear()}/${String(application.id).padStart(4, '0')}`;
    console.log("Backend - Generated gate permit number:", gatePermitNo);

    const fullPdfPath = path.join(__dirname, '..', pdfFilePath);
    console.log("Backend - Full PDF path:", fullPdfPath);

    // Define all the date variables BEFORE creating the PDF
    const fromDate = application.gate_pass_period_from 
      ? new Date(application.gate_pass_period_from).toLocaleDateString('en-IN') 
      : 'N/A';
      
    const toDate = application.gate_pass_period_to 
      ? new Date(application.gate_pass_period_to).toLocaleDateString('en-IN') 
      : 'N/A';

    if (PDFDocument) {
      // Create actual PDF using PDFKit
      console.log("Backend - Creating PDF with PDFKit");
      
      // First, get all the required data with proper queries
      // Fix: Get firm details from the application's firm_id
      let firmData = {};
      if (application.firm_id) {
        const firmQuery = await client.query(
          `SELECT * FROM firms WHERE id = $1`,
          [parseInt(application.firm_id)]
        );
        firmData = firmQuery.rows[0] || {};
        console.log("Firm data fetched:", firmData);
      }
      
      // If no firm data from firm_id, try to get it via contracts table
      if (!firmData.firm_name && application.loa_number) {
        const contractFirmQuery = await client.query(
          `SELECT f.* 
           FROM contracts c
           LEFT JOIN firms f ON c.firm_id = f.id
           WHERE c.loa_number = $1`,
          [application.loa_number]
        );
        if (contractFirmQuery.rows.length > 0) {
          firmData = contractFirmQuery.rows[0];
          console.log("Firm data from contract:", firmData);
        }
      }
      
      // Get contract details with shop and user info
      const contractQuery = await client.query(
        `SELECT 
          c.work_description,
          c.shift_timing,
          s.name as shop_name,
          s.location as shop_location,
          sse.full_name as sse_name,
          sse.employee_id as sse_employee_id,
          officer.full_name as officer_name,
          officer.employee_id as officer_employee_id,
          officer.role as officer_role
         FROM contracts c
         LEFT JOIN shops s ON c.shop_id = s.id
         LEFT JOIN users sse ON c.executing_sse_id = sse.id
         LEFT JOIN users officer ON c.approved_officer_id = officer.id
         WHERE c.loa_number = $1`,
        [application.loa_number]
      );
      const contractData = contractQuery.rows[0] || {};
      
      console.log("Contract data:", contractData);
      console.log("Application firm_id:", application.firm_id);
      console.log("Final firm data:", firmData);
      
      const doc = new PDFDocument({ 
        size: 'A4', 
        margins: {
          top: 30,
          bottom: 30,
          left: 40,
          right: 40
        }
      });
      const stream = fs.createWriteStream(fullPdfPath);
      
      doc.pipe(stream);
      
      // Helper function for drawing lines
      const drawLine = (startX, startY, endX, endY) => {
        doc.moveTo(startX, startY).lineTo(endX, endY).stroke();
      };
      
      // CENTERED HEADER SECTION - No Logo
      // Calculate center position for the entire page width (A4 = 595 points width)
      const pageWidth = 595;
      const textStartX = 40;
      const textWidth = pageWidth - 80; // 40 margin on each side
      
      // Main title - SOUTHERN RAILWAY
      doc.fontSize(16).font('Helvetica-Bold')
        .text('SOUTHERN RAILWAY', textStartX, 40, { 
          width: textWidth,
          align: 'center' 
        });
      
      // Subtitle - Carriage and Wagon Works, Perambur
      doc.fontSize(14).font('Helvetica')
        .text('Carriage and Wagon Works, Perambur', textStartX, 60, { 
          width: textWidth,
          align: 'center' 
        });
      
      // Address
      doc.fontSize(11)
        .text('Ayanavaram, Chennai -600023', textStartX, 78, { 
          width: textWidth,
          align: 'center' 
        });
      
      // Draw a line under the header
      doc.moveTo(40, 100).lineTo(555, 100).stroke();
      
      // Gate Entry Permit Title
      doc.fontSize(13).font('Helvetica-Bold')
        .text('Gate – Entry Permit (Contract workers)', textStartX, 110, { 
          width: textWidth,
          align: 'center' 
        });
      
      doc.fontSize(8).font('Helvetica-Oblique')
        .text('*Gate entry permit is only valid with company /Firm Identity Card (ID card) & aadhar card', 
          textStartX, 127, { 
            width: textWidth,
            align: 'center' 
          });
      
      // Create table-like structure
      let currentY = 150;
      
      // Gate Permit Number Box
      doc.rect(40, currentY, 180, 22).stroke();
      doc.fontSize(9).font('Helvetica-Bold')
        .text('Gate – Permit no:', 45, currentY + 6);
      doc.font('Helvetica')
        .text(gatePermitNo || 'N/A', 130, currentY + 6);
      
      // Validity Box
      doc.rect(340, currentY, 215, 22).stroke();
      doc.fillColor('black').rect(340, currentY, 100, 22).fill();
      doc.fillColor('white').fontSize(9).font('Helvetica-Bold')
        .text('Gate Entry Permit', 345, currentY + 2);
      doc.text('validity', 380, currentY + 12);
      
      doc.fillColor('black').font('Helvetica-Bold')
        .text('From: ' + fromDate, 445, currentY + 2);
      doc.text('To: ' + toDate, 445, currentY + 12);
      
      currentY += 22;
      
      // Company/Firm Name - Fixed to use firm data properly
      doc.rect(40, currentY, 515, 25).stroke();
      doc.fontSize(9).font('Helvetica')
        .text('Name of the Company / Firm', 45, currentY + 4);
      doc.font('Helvetica-Bold');
      
      // Use firm data with fallbacks
      const firmName = firmData.firm_name || application.firm_name || 'N/A';
      const contractorName = firmData.contractor_name || application.contractor_name || 'N/A';
      doc.text(`${firmName} / ${contractorName}`, 45, currentY + 14);
      
      currentY += 25;
      
      // Address - Use firm data with fallbacks
      doc.rect(40, currentY, 245, 35).stroke();
      doc.fontSize(9).font('Helvetica')
        .text('Address of the Company/ Firm', 45, currentY + 4);
      doc.fontSize(8);
      const address = firmData.address || application.contractor_address || 'N/A';
      doc.text(address, 45, currentY + 14, {
        width: 235,
        height: 18
      });
      
      // Phone and Email - Use firm data with fallbacks
      doc.rect(285, currentY, 270, 35).stroke();
      doc.fontSize(9).font('Helvetica')
        .text('Ph.No:', 290, currentY + 8);
      const phone = firmData.phone || application.contractor_phone || 'N/A';
      doc.text(phone, 325, currentY + 8);
      
      doc.text('e-mail:', 290, currentY + 20);
      doc.fontSize(8);
      const email = firmData.email || application.contractor_email || 'N/A';
      doc.text(email, 325, currentY + 20);
      
      currentY += 35;
      
      // LOA Details
      doc.rect(40, currentY, 515, 20).stroke();
      doc.fontSize(9).font('Helvetica')
        .text('Details of Letter of acceptance', 45, currentY + 3);
      doc.text('(LOA) / Work order / Purchase order', 45, currentY + 11);
      doc.font('Helvetica-Bold')
        .text(application.loa_number || 'N/A', 250, currentY + 7);
      
      currentY += 20;
      
      // Work Description
      doc.rect(40, currentY, 515, 30).stroke();
      doc.fontSize(9).font('Helvetica')
        .text('Brief description of work awarded', 45, currentY + 4);
      doc.fontSize(8).font('Helvetica')
        .text(contractData.work_description || 'Work as per LOA', 45, currentY + 14, {
          width: 505,
          height: 14,
          ellipsis: true
        });
      
      currentY += 30;
      
      // Insurance/ESI
      doc.rect(40, currentY, 350, 20).stroke();
      doc.fontSize(9).font('Helvetica')
        .text('ECA Insurance /ESI', 45, currentY + 6);
      
      let insuranceText = 'N/A';
      if (application.insurance_no) {
        insuranceText = `Insurance No: ${application.insurance_no}`;
      } else if (application.esi_number) {
        insuranceText = `ESI No: ${application.esi_number}`;
      }
      doc.text(insuranceText, 150, currentY + 6);
      
      doc.rect(390, currentY, 165, 20).stroke();
      doc.text('Validity:', 395, currentY + 6);
      
      let validityText = 'N/A';
      if (application.insurance_from && application.insurance_to) {
        const insFromDate = new Date(application.insurance_from).toLocaleDateString('en-IN');
        const insToDate = new Date(application.insurance_to).toLocaleDateString('en-IN');
        validityText = `${insFromDate} - ${insToDate}`;
      } else if (application.esi_date_of_issue) {
        validityText = new Date(application.esi_date_of_issue).toLocaleDateString('en-IN');
      }
      doc.fontSize(8).text(validityText, 435, currentY + 6);
      
      currentY += 20;
      
      // Specific place of work
      doc.rect(40, currentY, 275, 20).stroke();
      doc.fontSize(9).font('Helvetica')
        .text('Specific place of work inside CW/PER', 45, currentY + 6);
      
      doc.rect(315, currentY, 240, 20).stroke();
      const shopName = contractData.shop_name || 'CW/PER Premises';
      doc.text(shopName, 320, currentY + 6);
      if (contractData.shop_location) {
        doc.fontSize(8).text(contractData.shop_location, 430, currentY + 6);
      }
      
      currentY += 20;
      
      // Contract executing Supervisor (SSE)
      doc.rect(40, currentY, 275, 28).stroke();
      doc.fontSize(9).font('Helvetica')
        .text('Contract executing Supervisor in CW/PER', 45, currentY + 4);
      doc.font('Helvetica-Bold')
        .text(contractData.sse_name || 'N/A', 45, currentY + 16);
      
      // Controlling officer (Approved Officer)
      doc.rect(315, currentY, 240, 28).stroke();
      doc.font('Helvetica')
        .text('Controlling officer/CW/PER.', 320, currentY + 10);
      doc.font('Helvetica-Bold')
        .text(contractData.officer_name || 'N/A', 320, currentY + 18);
      
      currentY += 28;
      
      // Contract workers particulars header
      doc.fontSize(10).font('Helvetica-Bold')
        .text('Contract workers particulars', 40, currentY + 3);
      currentY += 15;
      
      // Number of persons - Reduced size
      doc.rect(40, currentY, 275, 32).stroke();
      doc.fontSize(9).font('Helvetica')
        .text('Maximum number of person to be employed', 45, currentY + 3);
      doc.text('on any day for the above work (No of workers)', 45, currentY + 11);
      
      doc.rect(315, currentY, 120, 16).stroke();
      doc.text('No. of Supervisors:', 320, currentY + 5);
      doc.font('Helvetica-Bold')
        .text((application.number_of_supervisors || '0').toString(), 420, currentY + 5);
      
      doc.rect(315, currentY + 16, 120, 16).stroke();
      doc.font('Helvetica')
        .text('No. of Workers:', 320, currentY + 21);
      doc.font('Helvetica-Bold')
        .text((application.number_of_persons || '0').toString(), 420, currentY + 21);
      
      doc.rect(435, currentY, 120, 32).stroke();
      
      currentY += 32;
      
      // Supervisor details - Enhanced for multiple supervisors
      doc.rect(40, currentY, 275, 60).stroke();
      doc.fontSize(9).font('Helvetica')
        .text('Name(s) of the contract site Supervisor(s)', 45, currentY + 3);
      doc.text('responsible for safety, compliance to all', 45, currentY + 11);
      doc.text('applicable Rules:', 45, currentY + 19);

      // Right side - Supervisor table
      doc.rect(315, currentY, 240, 60).stroke();

      // Table headers
      doc.fontSize(8).font('Helvetica-Bold');
      doc.text('S.No.', 320, currentY + 3);
      doc.text('Name of the supervisor', 355, currentY + 3);
      doc.text('Contact no.', 470, currentY + 3);

      // Draw header line
      drawLine(315, currentY + 12, 555, currentY + 12);

      // Display supervisors (up to 6 rows)
      doc.font('Helvetica').fontSize(7);
      let supervisorY = currentY + 15;

      for (let i = 0; i < 6; i++) {
        doc.text(`${i + 1}.`, 320, supervisorY);
        
        if (i < supervisors.length && supervisors[i]) {
          // Actual supervisor data
          const supervisor = supervisors[i];
          doc.font('Helvetica-Bold').fontSize(7);
          doc.text(supervisor.name || 'N/A', 330, supervisorY, {
            width: 135,
            ellipsis: true
          });
          doc.font('Helvetica').fontSize(7);
          doc.text(supervisor.phone || 'N/A', 470, supervisorY);
        } else {
          // Empty row with lines for manual filling if needed
          doc.font('Helvetica').fontSize(7);
          doc.text('_________________', 330, supervisorY);
          doc.text('__________', 470, supervisorY);
        }
        
        supervisorY += 8;
      }

      currentY += 60;
      
      // Tools and Equipment Section - Compact
      doc.fontSize(10).font('Helvetica-Bold')
        .text('Machines, tools and equipments particulars', 40, currentY + 3);
      currentY += 12;
      
      // Tools table - Reduced size
      doc.rect(40, currentY, 515, 65).stroke();
      doc.fontSize(8).font('Helvetica')
        .text('Details of the equipments, machines, tools going to be used to execute the awarded work', 45, currentY + 3);
      doc.fontSize(7).font('Helvetica-Oblique')
        .text('(*if required separate list to be attached with the authorization of concerned SSE/CW)', 45, currentY + 11);
      
      // Table headers for tools
      currentY += 18;
      drawLine(40, currentY, 555, currentY);
      doc.fontSize(8).font('Helvetica-Bold');
      doc.text('Vehicle details', 50, currentY + 3);
      doc.text('Machinery details', 210, currentY + 3);
      doc.text('Tools / equipment details', 370, currentY + 3);
      
      currentY += 10;
      drawLine(40, currentY, 555, currentY);
      doc.fontSize(7).font('Helvetica');
      doc.text('Vehicle type', 50, currentY + 3);
      doc.text('Reg.No', 120, currentY + 3);
      doc.text('Machine type', 210, currentY + 3);
      doc.text('Nos.', 310, currentY + 3);
      doc.text('Tools/equip.type', 370, currentY + 3);
      doc.text('Nos.', 500, currentY + 3);
      
      // Parse and add tool items
      if (application.tool_items) {
        try {
          const tools = typeof application.tool_items === 'string' 
            ? JSON.parse(application.tool_items) 
            : application.tool_items;
          
          if (tools && tools.length > 0) {
            let toolY = currentY + 10;
            doc.fontSize(7);
            
            tools.forEach((item, index) => {
              if (index < 3 && toolY < currentY + 35) {
                if (item.type === 'Vehicle') {
                  doc.text(item.description, 50, toolY);
                  doc.text(item.quantity, 120, toolY);
                } else if (item.type === 'Machine') {
                  doc.text(item.description, 210, toolY);
                  doc.text(item.quantity, 310, toolY);
                } else {
                  doc.text(item.description, 370, toolY);
                  doc.text(item.quantity, 500, toolY);
                }
                toolY += 8;
              }
            });
          }
        } catch (e) {
          console.log("Could not parse tool items:", e);
        }
      }
      
      currentY += 65;
      
      // Footer section - Compact
      doc.rect(40, currentY, 245, 30).stroke();
      doc.fontSize(9).font('Helvetica-Bold')
        .fillColor('blue')
        .rect(40, currentY, 245, 15).fill()
        .fillColor('white')
        .text('Permitted Timings inside CW/PER', 45, currentY + 4);
      
      doc.fillColor('black').font('Helvetica')
        .text(contractData.shift_timing || '08:00 - 17:00', 45, currentY + 20);
      
      // Approval text
      doc.fontSize(9).font('Helvetica-Oblique')
        .text('This gate permit issued with the approval of Factory Manager.', 40, currentY + 38);
      
      // Signature section - On same page
      doc.fontSize(10).font('Helvetica-Bold')
        .text('For Chief Workshop Manager/CW/PER', 340, currentY + 50);
      
      // Digital signature stamp
      doc.rect(400, currentY, 140, 35).stroke();
      doc.fontSize(8).font('Helvetica')
        .text('Digitally Signed', 410, currentY + 8);
      doc.text('Ch.OS/NPB', 410, currentY + 18);
      doc.fontSize(7)
        .text(new Date().toLocaleString('en-IN'), 410, currentY + 26);
      
      doc.end();
      
      // Wait for PDF to be written
      await new Promise((resolve, reject) => {
        stream.on('finish', () => {
          console.log("Backend - PDF created successfully");
          resolve(true);
        });
        stream.on('error', (err) => {
          console.error("Backend - Error writing PDF:", err);
          reject(err);
        });
      });
    } else {
      // Fallback if PDFKit is not installed
      console.log("Backend - Creating text placeholder PDF");
      const pdfContent = `
    SOUTHERN RAILWAY
    Gate Pass Application - ${application.loa_number}
    Generated: ${new Date().toLocaleString()}
    Gate Permit No: ${gatePermitNo}
      `;
      
      fs.writeFileSync(fullPdfPath, pdfContent);
      console.log("Backend - Text file created successfully");
    }

    // Update application status to pdf_generated
    console.log("Backend - Updating application status to pdf_generated");
    const updateQuery = `
      UPDATE gate_pass_applications 
      SET 
        status = $1, 
        pdf_generated = true,
        pdf_file_path = $2,
        gate_permit_number = $3,
        approved_by_chos_date = NOW(),
        chos_remarks = 'PDF generated with digital signature',
        updated_at = NOW()
      WHERE id = $4 
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, [
      'pdf_generated',
      pdfFilePath,
      gatePermitNo,
      id
    ]);

    console.log("Backend - Application updated successfully");

    // Log the change
    await logApplicationChange(
      id, 
      userId, 
      userRole, 
      oldStatus, 
      'pdf_generated', 
      'generate_pdf', 
      'PDF generated with digital signature'
    );

    await client.query('COMMIT');
    console.log("Backend - PDF generation completed successfully");

    res.json({
      success: true,
      message: "PDF generated successfully with digital signature",
      application: result.rows[0],
      pdfPath: pdfFilePath,
      gatePermitNumber: gatePermitNo,
      oldStatus,
      newStatus: 'pdf_generated'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Backend - Error generating PDF:", error);
    console.error("Backend - Error stack:", error.stack);
    res.status(500).json({
      success: false,
      error: "Failed to generate PDF",
      details: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  } finally {
    client.release();
  }
});

// GET: Download generated PDF
router.get("/:id/download-pdf", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: "Invalid application ID format" });
    }

    // Get application with PDF path
    const result = await pool.query(
      "SELECT pdf_file_path, loa_number FROM gate_pass_applications WHERE id = $1",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    const { pdf_file_path, loa_number } = result.rows[0];
    
    if (!pdf_file_path) {
      return res.status(404).json({ error: "PDF not generated for this application" });
    }
    
    // Check if file exists
    if (!fs.existsSync(pdf_file_path)) {
      return res.status(404).json({ error: "PDF file not found on server" });
    }

    // Set appropriate headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="gate-pass-${loa_number}.pdf"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(pdf_file_path);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error("Error downloading PDF:", error);
    res.status(500).json({ error: "Failed to download PDF" });
  }
});

// POST: Send PDF to contractor (Email + WhatsApp simulation)
router.post("/:id/send-pdf", async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { userId, userRole } = req.body;
    
    // Validate inputs
    if (!/^\d+$/.test(id)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "Invalid application ID format" });
    }

    if (!userId || !userRole) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "User ID and role are required" });
    }

    if (userRole !== 'chos_npb') {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: "Only Ch.OS/NPB can send PDFs" });
    }

    // Get current application
    const currentApp = await pool.query(`
      SELECT 
        gpa.*,
        f.firm_name, 
        f.contractor_name, 
        f.email as contractor_email, 
        f.phone as contractor_phone
      FROM gate_pass_applications gpa
      LEFT JOIN firms f ON gpa.firm_id::integer = f.id
      WHERE gpa.id = $1
    `, [id]);

    if (currentApp.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Application not found" });
    }

    const application = currentApp.rows[0];
    const oldStatus = application.status;

    // Validate current status
    if (oldStatus !== 'pdf_generated') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: "Invalid status transition. PDF must be generated first",
        currentStatus: oldStatus
      });
    }

    // Update application status to approved (final status)
    const sentDate = new Date().toISOString().split('T')[0];
    const result = await client.query(
      `UPDATE gate_pass_applications 
       SET status = $1, 
           email_sent_date = NOW()
       WHERE id = $2 
       RETURNING *`,
      ['approved', id]
    );

    // Log the change
    await logApplicationChange(id, userId, userRole, oldStatus, 'approved', 'send_pdf', 'Gate pass sent to contractor via email and WhatsApp');

    // Send email notification to contractor
    if (application.contractor_email) {
      await sendEmailNotification(
        id, 
        application.contractor_email, 
        'pdf_sent', 
        `Gate Pass ${application.loa_number} - Approved and Ready`,
        {
          applicationId: id,
          loaNumber: application.loa_number,
          contractorName: application.contractor_name,
          gatePermitNumber: application.gate_permit_number,
          validFrom: new Date(application.gate_pass_period_from).toLocaleDateString('en-IN'),
          validTo: new Date(application.gate_pass_period_to).toLocaleDateString('en-IN'),
          numberOfPersons: application.number_of_persons?.toString() || '0',
          pdfPath: application.pdf_file_path
        }
      );
    }

    console.log(`WhatsApp message would be sent to: ${application.contractor_phone}`);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: "Gate pass sent to contractor successfully via email and WhatsApp",
      application: result.rows[0],
      sentTo: {
        email: application.contractor_email,
        phone: application.contractor_phone
      },
      sentDate: sentDate,
      oldStatus,
      newStatus: 'approved'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error sending PDF:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send PDF to contractor",
      details: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  } finally {
    client.release();
  }
});

router.get("/email-status/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const result = await pool.query(
      `SELECT * FROM email_notifications 
       WHERE application_id = $1 
       ORDER BY created_at DESC`,
      [applicationId]
    );
    
    res.json({
      success: true,
      emails: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
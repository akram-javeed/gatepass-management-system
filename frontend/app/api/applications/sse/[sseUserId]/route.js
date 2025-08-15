// app/api/applications/sse/[sseUserId]/route.js
import { NextResponse } from "next/server"
import { pool } from "@/lib/db"

export async function GET(request, { params }) {
  try {
    const { sseUserId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    console.log(`=== SSE Applications API Debug ===`);
    console.log(`SSE User ID: ${sseUserId}`);
    console.log(`Type of sseUserId: ${typeof sseUserId}`);
    
    // Convert to number explicitly
    const sseId = Number(sseUserId);
    
    console.log(`Converted SSE ID: ${sseId}, Type: ${typeof sseId}`);
    
    // Step 1: Verify user exists and is SSE
    console.log("Step 1: Verifying SSE user...");
    // Add this diagnostic query
    console.log("Running diagnostic query...");
    const testQuery = await pool.query(
      `SELECT id, loa_number, executing_sse_id, status 
      FROM gate_pass_applications 
      WHERE executing_sse_id IS NOT NULL`
    );
    console.log("Sample data from database:");
    testQuery.rows.forEach(row => {
      console.log(`- App ${row.id}: executing_sse_id=${row.executing_sse_id} (type: ${typeof row.executing_sse_id}), status=${row.status}`);
    });
    const sseUserCheck = await pool.query(
      'SELECT id, full_name, employee_id, role FROM users WHERE id = $1 AND role = $2',
      [sseId, 'sse']
    );

    if (sseUserCheck.rows.length === 0) {
      console.log("SSE user not found");
      return NextResponse.json({
        success: false,
        error: "SSE user not found",
        sseUserId: sseUserId
      }, { status: 400 });
    }

    const sseUser = sseUserCheck.rows[0];
    console.log(`Found SSE user: ${sseUser.full_name} (ID: ${sseUser.id})`);

    // Step 2: Get applications - SIMPLE QUERY
    console.log("Step 2: Fetching applications for this SSE...");
    
    // ✅ SIMPLEST POSSIBLE QUERY
    const query = `
      SELECT 
        gpa.id,
        gpa.loa_number,
        gpa.contract_supervisor_name,
        gpa.supervisor_phone,
        gpa.gate_pass_period_from,
        gpa.gate_pass_period_to,
        gpa.number_of_persons,
        gpa.number_of_supervisors,
        gpa.status,
        gpa.rejection_reason,
        gpa.submitted_date,
        gpa.updated_at,
        gpa.tool_items,
        gpa.special_timing,
        gpa.special_timing_from,
        gpa.special_timing_to,
        gpa.has_insurance,
        gpa.has_esi,
        gpa.labour_license,
        gpa.inter_state_migration,
        gpa.executing_sse_id,
        f.firm_name,
        f.contractor_name,
        f.email as contractor_email,
        f.phone as contractor_phone,
        f.address as contractor_address,
        f.pan,
        f.gst,
        c.work_description,
        c.shift_timing
      FROM gate_pass_applications gpa
      LEFT JOIN firms f ON gpa.firm_id::integer = f.id::integer
      LEFT JOIN contracts c ON gpa.loa_number = c.loa_number
      WHERE gpa.executing_sse_id = $1
        AND gpa.status = $2
      ORDER BY gpa.submitted_date DESC
      LIMIT $3 OFFSET $4
    `;

    console.log(`Executing query with params: [${sseId}, 'pending_with_sse', ${limit}, ${offset}]`);
    
    const result = await pool.query(query, [sseId, 'pending_with_sse', limit, offset]);
    
    console.log(`Query executed. Found ${result.rows.length} applications`);

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM gate_pass_applications WHERE executing_sse_id = $1 AND status = $2',
      [sseId, 'pending_with_sse']
    );
    
    const totalCount = parseInt(countResult.rows[0].count);

    // Transform the data
    const applications = result.rows.map(app => {
      let toolsItems = [];
      if (app.tool_items) {
        try {
          toolsItems = JSON.parse(app.tool_items);
        } catch (error) {
          toolsItems = [];
        }
      }

      // In the transform section, update the gatePassPeriod formatting:

      return {
        id: app.id.toString(),
        loaNumber: app.loa_number,
        firmName: app.firm_name || 'N/A',
        contractorName: app.contractor_name || 'N/A',
        supervisorName: app.contract_supervisor_name,
        supervisorPhone: app.supervisor_phone,
        numberOfPersons: app.number_of_persons?.toString() || "0",
        numberOfSupervisors: app.number_of_supervisors?.toString() || "0",
        // ✅ FIX: Format dates properly
        gatePassPeriod: `${new Date(app.gate_pass_period_from).toLocaleDateString('en-IN')} to ${new Date(app.gate_pass_period_to).toLocaleDateString('en-IN')}`,
        gatePassPeriodFrom: app.gate_pass_period_from,
        gatePassPeriodTo: app.gate_pass_period_to,
        status: app.status,
        rejectionReason: app.rejection_reason,
        // ✅ FIX: Format submitted date
        submittedDate: new Date(app.submitted_date).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        updatedAt: app.updated_at ? new Date(app.updated_at).toLocaleDateString('en-IN') : '',
        toolsItems: toolsItems,
        specialTiming: app.special_timing,
        specialTimingFrom: app.special_timing_from,
        specialTimingTo: app.special_timing_to,
        hasInsurance: app.has_insurance,
        hasEsi: app.has_esi,
        labourLicense: app.labour_license,
        interStateMigration: app.inter_state_migration,
        contractorEmail: app.contractor_email || 'N/A',
        contractorPhone: app.contractor_phone || 'N/A',
        contractorAddress: app.contractor_address || 'N/A',
        firmPan: app.pan || 'N/A',
        firmGst: app.gst || 'N/A',
        // Add work description for the review dialog
        workDescription: app.work_description || 'N/A',
        shiftTiming: app.shift_timing || 'N/A'
      };
    });

    return NextResponse.json({
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
    console.error("=== SSE Applications API Error ===");
    console.error("Error details:", error);
    
    return NextResponse.json({
      success: false,
      error: "Failed to fetch SSE assigned applications",
      details: error.message
    }, { status: 500 });
  }
}
// app/api/applications/safety_officer/route.js
import { NextResponse } from "next/server"
import { pool } from "@/lib/db"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    console.log("Fetching applications for Safety Officer");
    console.log(`Page: ${page}, Limit: ${limit}, Offset: ${offset}`);
    
    // Query for applications pending with safety officer
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
        gpa.status,
        gpa.rejection_reason,
        gpa.submitted_date,
        gpa.updated_at,
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
        f.gst
      FROM gate_pass_applications gpa
      LEFT JOIN firms f ON gpa.firm_id::text = f.id::text
      WHERE gpa.status = 'pending_with_safety'
      ORDER BY gpa.submitted_date DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    
    console.log(`Found ${result.rows.length} applications pending with safety`);
    
    // Get total count
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM gate_pass_applications WHERE status = 'pending_with_safety'"
    );
    const totalCount = parseInt(countResult.rows[0].count);
    
    console.log(`Total applications pending with safety: ${totalCount}`);
    
    // Transform the data
    const applications = result.rows.map(app => {
      let toolsItems = [];
      if (app.tool_items) {
        try {
          toolsItems = typeof app.tool_items === 'string' 
            ? JSON.parse(app.tool_items) 
            : app.tool_items;
        } catch (error) {
          console.error("Error parsing tool items:", error);
          toolsItems = [];
        }
      }
      
      // Format dates
      const formatDate = (date) => {
        if (!date) return '';
        try {
          return new Date(date).toLocaleDateString('en-IN');
        } catch {
          return date;
        }
      };
      
      return {
        id: app.id.toString(),
        loaNumber: app.loa_number,
        firmName: app.firm_name || 'N/A',
        contractorName: app.contractor_name || 'N/A',
        supervisorName: app.supervisor_name,
        supervisorPhone: app.supervisor_phone,
        numberOfPersons: app.number_of_persons?.toString() || "0",
        numberOfSupervisors: app.number_of_supervisors?.toString() || "0",
        gatePassPeriod: `${formatDate(app.gate_pass_period_from)} to ${formatDate(app.gate_pass_period_to)}`,
        gatePassPeriodFrom: app.gate_pass_period_from,
        gatePassPeriodTo: app.gate_pass_period_to,
        status: app.status,
        rejectionReason: app.rejection_reason,
        submittedDate: formatDate(app.submitted_date),
        updatedAt: formatDate(app.updated_at),
        toolsItems: toolsItems,
        specialTiming: app.special_timing,
        hasInsurance: app.has_insurance,
        hasEsi: app.has_esi,
        labourLicense: app.labour_license,
        interStateMigration: app.inter_state_migration,
        contractorEmail: app.contractor_email || 'N/A',
        contractorPhone: app.contractor_phone || 'N/A',
        contractorAddress: app.contractor_address || 'N/A',
        firmPan: app.pan || 'N/A',
        firmGst: app.gst || 'N/A'
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
      debug: {
        totalFound: totalCount,
        currentPage: page,
        statusFilter: 'pending_with_safety'
      }
    });
    
  } catch (error) {
    console.error("Error fetching safety officer applications:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch applications",
      details: error.message
    }, { status: 500 });
  }
}
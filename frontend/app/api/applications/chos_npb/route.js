import { NextResponse } from "next/server"
import { pool } from "@/lib/db"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    console.log("Fetching applications for Ch.OS/NPB");
    
    // Query for applications pending with Ch.OS/NPB or already processed by them
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
        gpa.pdf_generated,
        gpa.pdf_file_path,
        gpa.sent_date,
        gpa.email_sent_date,
        gpa.gate_permit_number,
        COALESCE(f1.firm_name, f2.firm_name) as firm_name,
        COALESCE(f1.contractor_name, f2.contractor_name, c.contractor_name) as contractor_name,
        COALESCE(f1.email, f2.email, c.email) as contractor_email,
        COALESCE(f1.phone, f2.phone, c.phone) as contractor_phone,
        COALESCE(f1.address, f2.address, c.address) as contractor_address,
        COALESCE(f1.pan, f2.pan, c.pan) as pan,
        COALESCE(f1.gst, f2.gst, c.gst) as gst
      FROM gate_pass_applications gpa
      LEFT JOIN firms f1 ON gpa.firm_id::text = f1.id::text
      LEFT JOIN contracts c ON gpa.loa_number = c.loa_number
      LEFT JOIN firms f2 ON c.firm_id::text = f2.id::text
      WHERE gpa.status IN ('pending_with_chos', 'pdf_generated', 'approved')
      ORDER BY 
        CASE 
          WHEN gpa.status = 'pending_with_chos' THEN 1
          WHEN gpa.status = 'pdf_generated' THEN 2
          ELSE 3
        END,
        gpa.submitted_date DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    
    console.log(`Found ${result.rows.length} applications for Ch.OS/NPB`);
    
    // Get total count
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM gate_pass_applications WHERE status IN ('pending_with_chos', 'pdf_generated', 'approved')"
    );
    const totalCount = parseInt(countResult.rows[0].count);
    
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
        supervisorName: app.supervisor_name || 'N/A',
        supervisorPhone: app.supervisor_phone || 'N/A',
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
        specialTiming: Boolean(app.special_timing),
        hasInsurance: Boolean(app.has_insurance),
        hasEsi: Boolean(app.has_esi),
        labourLicense: Boolean(app.labour_license),
        interStateMigration: Boolean(app.inter_state_migration),
        contractorEmail: app.contractor_email || 'N/A',
        contractorPhone: app.contractor_phone || 'N/A',
        contractorAddress: app.contractor_address || 'N/A',
        firmPan: app.pan || 'N/A',
        firmGst: app.gst || 'N/A',
        pdfGenerated: Boolean(app.pdf_generated),
        pdfFilePath: app.pdf_file_path,
        sentDate: formatDate(app.sent_date || app.email_sent_date),
        gatePermitNumber: app.gate_permit_number
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
      summary: {
        pending: applications.filter(a => a.status === 'pending_with_chos').length,
        pdfGenerated: applications.filter(a => a.status === 'pdf_generated').length,
        approved: applications.filter(a => a.status === 'approved').length
      }
    });
    
  } catch (error) {
    console.error("Error fetching Ch.OS/NPB applications:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch applications",
      details: error.message
    }, { status: 500 });
  }
}
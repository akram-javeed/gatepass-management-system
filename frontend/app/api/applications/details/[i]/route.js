// app/api/applications/details/[id]/route.js
import { NextResponse } from "next/server"
import { pool } from "@/lib/db"

export async function GET(request, { params }) {
  try {
    // Get the ID from the URL directly
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    console.log("Extracted ID from URL:", id);
    
    if (!id || !/^\d+$/.test(id)) {
      console.log("Invalid ID:", id);
      return NextResponse.json({ 
        success: false,
        error: "Invalid application ID",
        receivedId: id
      }, { status: 400 });
    }
    
    const applicationId = parseInt(id);
    console.log("Querying for application ID:", applicationId);

    // Updated query with text type casting for all joins (matching the working SQL)
    const result = await pool.query(`
      SELECT 
        gpa.*,
        f.firm_name,
        f.contractor_name,
        f.email as contractor_email,
        f.phone as contractor_phone,
        f.address as contractor_address,
        f.pan as firm_pan,
        f.gst as firm_gst,
        c.work_description,
        c.shift_timing,
        c.contract_period_from,
        c.contract_period_to,
        c.contractor_name as contract_contractor_name,
        u.full_name as sse_name,
        u.employee_id as sse_employee_id
      FROM gate_pass_applications gpa
      LEFT JOIN firms f ON gpa.firm_id::text = f.id::text
      LEFT JOIN contracts c ON gpa.loa_number = c.loa_number
      LEFT JOIN users u ON gpa.executing_sse_id::text = u.id::text
      WHERE gpa.id = $1
    `, [applicationId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: "Application not found",
        searchedId: applicationId
      }, { status: 404 });
    }
    
    const application = result.rows[0];
    
    // If firm_name is still null but we have contract contractor name, use that
    if (!application.firm_name && application.contract_contractor_name) {
      console.log("Using contractor name from contract");
      application.contractor_name = application.contract_contractor_name;
    }
    
    // If still no firm details, try to get from contract's firm
    if (!application.firm_name && application.loa_number) {
      console.log("Attempting to get firm details from contract");
      const contractFirmResult = await pool.query(`
        SELECT 
          f.firm_name,
          f.contractor_name as firm_contractor_name,
          f.email,
          f.phone,
          f.address,
          f.pan,
          f.gst,
          c.contractor_name as contract_contractor_name
        FROM contracts c
        LEFT JOIN firms f ON c.firm_id::text = f.id::text
        WHERE c.loa_number = $1
      `, [application.loa_number]);
      
      if (contractFirmResult.rows.length > 0) {
        const contractData = contractFirmResult.rows[0];
        application.firm_name = application.firm_name || contractData.firm_name;
        application.contractor_name = application.contractor_name || contractData.contract_contractor_name || contractData.firm_contractor_name;
        application.contractor_email = application.contractor_email || contractData.email;
        application.contractor_phone = application.contractor_phone || contractData.phone;
        application.contractor_address = application.contractor_address || contractData.address;
        application.firm_pan = application.firm_pan || contractData.pan;
        application.firm_gst = application.firm_gst || contractData.gst;
      }
    }
    
    console.log("Application details found:", {
      id: application.id,
      loa_number: application.loa_number,
      firm_id: application.firm_id,
      firm_name: application.firm_name,
      contractor_name: application.contractor_name,
      status: application.status
    });
    
    // Parse JSON fields
    if (application.tool_items && typeof application.tool_items === 'string') {
      try {
        application.tool_items = JSON.parse(application.tool_items);
      } catch {
        application.tool_items = [];
      }
    }
    
    if (application.uploaded_files && typeof application.uploaded_files === 'string') {
      try {
        application.uploaded_files = JSON.parse(application.uploaded_files);
      } catch {
        application.uploaded_files = {};
      }
    }
    
    // Remove the extra contract_contractor_name field from response
    delete application.contract_contractor_name;
    
    return NextResponse.json({
      success: true,
      application: application
    });
    
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
// app/api/applications/[id]/history/route.js

import { NextResponse } from "next/server"
import { pool } from "@/lib/db"

export async function GET(request, { params }) {
  try {
    // FIX: Await params before accessing its properties
    const { id } = await params;
    
    console.log("Fetching approval history for application:", id);
    
    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid application ID"
      }, { status: 400 });
    }
    
    const applicationId = parseInt(id);
    
    // Fetch application with all approval data and user details
    const query = `
      SELECT 
        gpa.*,
        -- SSE details
        u_sse.full_name as sse_name,
        u_sse.employee_id as sse_employee_id,
        -- Safety Officer details
        u_safety.full_name as safety_officer_name,
        u_safety.employee_id as safety_officer_employee_id,
        -- Officer 1 details
        u_officer1.full_name as officer1_name,
        u_officer1.employee_id as officer1_employee_id,
        -- Officer 2 details
        u_officer2.full_name as officer2_name,
        u_officer2.employee_id as officer2_employee_id,
        -- Firm details
        f.firm_name,
        f.contractor_name
      FROM gate_pass_applications gpa
      LEFT JOIN users u_sse ON gpa.approved_by_sse_id = u_sse.id
      LEFT JOIN users u_safety ON gpa.approved_by_safety_id = u_safety.id
      LEFT JOIN users u_officer1 ON gpa.assigned_officer1_id = u_officer1.id
      LEFT JOIN users u_officer2 ON gpa.assigned_officer2_id = u_officer2.id
      LEFT JOIN firms f ON gpa.firm_id::text = f.id::text
      WHERE gpa.id = $1
    `;
    
    const result = await pool.query(query, [applicationId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: "Application not found"
      }, { status: 404 });
    }
    
    const app = result.rows[0];
    
    // Build approval history timeline
    const approvalHistory = [];
    
    // 1. Submission
    approvalHistory.push({
      stage: 'submission',
      title: 'Application Submitted',
      status: 'completed',
      date: app.submitted_date,
      user: app.contractor_name || 'Contractor',
      userRole: 'Contractor',
      remarks: 'Application submitted for review',
      icon: 'FileText'
    });
    
    // 2. SSE Review
    if (app.sse_action) {
      approvalHistory.push({
        stage: 'sse_review',
        title: 'SSE Review',
        status: app.sse_action === 'approved' ? 'approved' : 'rejected',
        date: app.approved_by_sse_date,
        user: app.sse_name || 'SSE',
        userId: app.approved_by_sse_id,
        employeeId: app.sse_employee_id,
        userRole: 'Senior Section Engineer',
        action: app.sse_action,
        remarks: app.sse_remarks,
        icon: 'UserCheck'
      });
    } else if (app.status === 'pending_with_sse') {
      approvalHistory.push({
        stage: 'sse_review',
        title: 'SSE Review',
        status: 'pending',
        user: 'Pending SSE Review',
        userRole: 'Senior Section Engineer',
        icon: 'Clock'
      });
    }
    
    // 3. Safety Officer Review
    if (app.safety_action) {
      approvalHistory.push({
        stage: 'safety_review',
        title: 'Safety Officer Review',
        status: app.safety_action === 'approved' ? 'approved' : 'rejected',
        date: app.approved_by_safety_date,
        user: app.safety_officer_name || 'Safety Officer',
        userId: app.approved_by_safety_id,
        employeeId: app.safety_officer_employee_id,
        userRole: 'Safety Officer',
        action: app.safety_action,
        remarks: app.safety_remarks,
        forwardedTo: app.forwarded_to_officer,
        icon: 'Shield'
      });
    } else if (app.status === 'pending_with_safety') {
      approvalHistory.push({
        stage: 'safety_review',
        title: 'Safety Officer Review',
        status: 'pending',
        user: 'Pending Safety Review',
        userRole: 'Safety Officer',
        icon: 'Clock'
      });
    }
    
    // 4. Officer Review (Officer1 or Officer2)
    if (app.forwarded_to_officer === 'officer1' && (app.officer1_status || app.status === 'pending_with_officer1')) {
      approvalHistory.push({
        stage: 'officer1_review',
        title: 'Officer 1 Review',
        status: app.officer1_status === 'approved' ? 'approved' : 
                app.officer1_status === 'rejected' ? 'rejected' : 'pending',
        date: app.officer1_reviewed_date,
        user: app.officer1_name || 'Officer 1',
        userId: app.assigned_officer1_id,
        employeeId: app.officer1_employee_id,
        userRole: 'Officer 1',
        action: app.officer1_status,
        remarks: app.officer1_remarks,
        icon: app.officer1_status === 'approved' ? 'CheckCircle' : 
              app.officer1_status === 'rejected' ? 'XCircle' : 'Clock'
      });
    }
    
    if (app.forwarded_to_officer === 'officer2' && (app.officer2_status || app.status === 'pending_with_officer2')) {
      approvalHistory.push({
        stage: 'officer2_review',
        title: 'Factory Manager Review',
        status: app.officer2_status === 'approved' ? 'approved' : 
                app.officer2_status === 'rejected' ? 'rejected' : 'pending',
        date: app.officer2_reviewed_date,
        user: app.officer2_name || 'Factory Manager',
        userId: app.assigned_officer2_id,
        employeeId: app.officer2_employee_id,
        userRole: 'Factory Manager (Officer 2)',
        action: app.officer2_status,
        remarks: app.officer2_remarks,
        icon: app.officer2_status === 'approved' ? 'CheckCircle' : 
              app.officer2_status === 'rejected' ? 'XCircle' : 'Clock'
      });
    }
    
    // 5. Final Status
    if (app.final_status === 'approved') {
      approvalHistory.push({
        stage: 'final',
        title: 'Application Approved',
        status: 'completed',
        date: app.updated_at,
        remarks: 'Gate pass application fully approved',
        icon: 'CheckCircle'
      });
    } else if (app.final_status === 'rejected') {
      approvalHistory.push({
        stage: 'final',
        title: 'Application Rejected',
        status: 'rejected',
        date: app.updated_at,
        remarks: app.rejection_reason,
        icon: 'XCircle'
      });
    }
    
    // Format dates
    const formatDate = (date) => {
      if (!date) return null;
      return new Date(date).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    approvalHistory.forEach(item => {
      if (item.date) {
        item.formattedDate = formatDate(item.date);
      }
    });
    
    return NextResponse.json({
      success: true,
      applicationId: applicationId,
      loaNumber: app.loa_number,
      currentStatus: app.status,
      finalStatus: app.final_status,
      approvalHistory: approvalHistory,
      summary: {
        totalStages: approvalHistory.length,
        completedStages: approvalHistory.filter(h => h.status === 'approved' || h.status === 'completed').length,
        pendingStages: approvalHistory.filter(h => h.status === 'pending').length,
        rejectedStages: approvalHistory.filter(h => h.status === 'rejected').length
      }
    });
    
  } catch (error) {
    console.error("Error fetching approval history:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch approval history",
      details: error.message
    }, { status: 500 });
  }
}
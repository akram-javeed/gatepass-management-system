// app/api/temporary-gate-pass/route.ts

import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log("Temporary gate pass application received:", body)

    // Validate required fields
    const requiredFields = [
      'firm_name', 'address', 'representative_name', 'phone_number',
      'email', 'aadhar_number', 'number_of_persons', 'nature_of_work',
      'period_from', 'period_to', 'forward_to_user_id', 'forward_to_role'
    ]
    
    const missingFields = requiredFields.filter(field => !body[field])
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 })
    }

    // Calculate duration with proper type conversion
    const periodFrom = new Date(body.period_from)
    const periodTo = new Date(body.period_to)
    const timeDiff = periodTo.getTime() - periodFrom.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1
    
    if (daysDiff > 3) {
      return NextResponse.json({
        success: false,
        error: "Temporary gate pass cannot exceed 3 days"
      }, { status: 400 })
    }

    // Generate temporary LOA number
    const tempLOA = `TEMP/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`
    
    // Determine status based on forward_to_role
    const status = body.forward_to_role === 'officer1' ? 'pending_with_officer1' : 'pending_with_officer2'

    // Insert into database
    const insertQuery = `
      INSERT INTO temporary_gate_passes (
        temp_pass_number,
        firm_name,
        firm_address,
        representative_name,
        phone_number,
        email,
        aadhar_number,
        number_of_persons,
        nature_of_work,
        period_from,
        period_to,
        duration_days,
        forward_to_user_id,
        forward_to_role,
        forward_to_name,
        status,
        current_officer_id,
        submitted_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `

    const values = [
      tempLOA,
      body.firm_name,
      body.address,
      body.representative_name,
      body.phone_number,
      body.email,
      body.aadhar_number,
      parseInt(body.number_of_persons),
      body.nature_of_work,
      body.period_from,
      body.period_to,
      daysDiff,
      body.forward_to_user_id,
      body.forward_to_role,
      body.forward_to_name,
      status,
      body.forward_to_user_id,
      new Date()
    ]

    const result = await pool.query(insertQuery, values)
    const tempPass = result.rows[0]
    
    // Log the submission
    await pool.query(
      `INSERT INTO temporary_pass_logs (
        temp_pass_id, action, remarks, new_status, timestamp
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        tempPass.id,
        'submitted',
        `Temporary gate pass submitted and forwarded to ${body.forward_to_name}`,
        status,
        new Date()
      ]
    )

    // Call backend email service for notifications
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      
      // Send notification through backend
      const emailResponse = await fetch(`${backendUrl}/api/temporary-passes/send-notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tempPassId: tempPass.id,
          tempPassNumber: tempLOA,
          applicantEmail: body.email,
          applicantName: body.representative_name,
          firmName: body.firm_name,
          natureOfWork: body.nature_of_work,
          periodFrom: body.period_from,
          periodTo: body.period_to,
          duration: daysDiff,
          numberOfPersons: body.number_of_persons,
          forwardedToUserId: body.forward_to_user_id,
          forwardedToName: body.forward_to_name,
          forwardedToRole: body.forward_to_role
        })
      })

      if (!emailResponse.ok) {
        console.error("Failed to send email notifications, but application was submitted")
      } else {
        console.log("Email notifications sent successfully")
      }
    } catch (emailError) {
      console.error("Error sending email notifications:", emailError)
      // Don't fail the submission if email fails
    }
    
    return NextResponse.json({
      success: true,
      message: "Temporary gate pass application submitted successfully",
      application: {
        id: tempPass.id,
        temp_pass_number: tempPass.temp_pass_number,
        status: tempPass.status
      }
    })
    
  } catch (error) {
    console.error("Error creating temporary pass:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to submit application",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const officerId = searchParams.get('officer_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    
    let query = `
      SELECT 
        tp.*,
        u.full_name as officer_name,
        u.employee_id as officer_employee_id
      FROM temporary_gate_passes tp
      LEFT JOIN users u ON tp.current_officer_id = u.id
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramCount = 1
    
    // Filter by status
    if (status) {
      query += ` AND tp.status = $${paramCount}`
      params.push(status)
      paramCount++
    }
    
    // Filter by current officer (for pending approvals)
    if (officerId && status && (status === 'pending_with_officer1' || status === 'pending_with_officer2')) {
      query += ` AND tp.current_officer_id = $${paramCount}`
      params.push(officerId)
      paramCount++
    }
    
    // Order and pagination
    query += ` ORDER BY tp.submitted_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`
    params.push(limit, offset)
    
    console.log("Fetching temporary passes with query:", query)
    console.log("Parameters:", params)
    
    const result = await pool.query(query, params)
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM temporary_gate_passes tp
      WHERE 1=1
    `
    
    const countParams: any[] = []
    paramCount = 1
    
    if (status) {
      countQuery += ` AND tp.status = $${paramCount}`
      countParams.push(status)
      paramCount++
    }
    
    if (officerId && status && (status === 'pending_with_officer1' || status === 'pending_with_officer2')) {
      countQuery += ` AND tp.current_officer_id = $${paramCount}`
      countParams.push(officerId)
    }
    
    const countResult = await pool.query(countQuery, countParams)
    const totalCount = parseInt(countResult.rows[0].count)
    
    console.log(`Found ${result.rows.length} temporary passes`)
    
    return NextResponse.json({
      success: true,
      applications: result.rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
    
  } catch (error) {
    console.error("Error fetching temporary passes:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch temporary passes",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

// DELETE endpoint for testing/cleanup (optional)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: "ID is required"
      }, { status: 400 })
    }
    
    const result = await pool.query(
      "DELETE FROM temporary_gate_passes WHERE id = $1 RETURNING *",
      [id]
    )
    
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Temporary pass not found"
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: "Temporary pass deleted successfully",
      deleted: result.rows[0]
    })
    
  } catch (error) {
    console.error("Error deleting temporary pass:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to delete temporary pass"
    }, { status: 500 })
  }
}

// PATCH endpoint for status updates (optional)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, remarks } = body
    
    if (!id || !status) {
      return NextResponse.json({
        success: false,
        error: "ID and status are required"
      }, { status: 400 })
    }
    
    const updateQuery = `
      UPDATE temporary_gate_passes 
      SET 
        status = $1,
        updated_at = CURRENT_TIMESTAMP
        ${remarks ? ', officer_remarks = $3' : ''}
      WHERE id = $2
      RETURNING *
    `
    
    const params = remarks ? [status, id, remarks] : [status, id]
    const result = await pool.query(updateQuery, params)
    
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Temporary pass not found"
      }, { status: 404 })
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
    )
    
    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
      application: result.rows[0]
    })
    
  } catch (error) {
    console.error("Error updating temporary pass:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to update temporary pass"
    }, { status: 500 })
  }
}
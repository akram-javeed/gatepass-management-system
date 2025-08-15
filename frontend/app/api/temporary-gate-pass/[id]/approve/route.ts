// app/api/temporary-gate-pass/[id]/approve/route.ts

import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Await params as required in Next.js 15+
    const { id } = await params
    const body = await request.json()
    
    console.log("Approving temporary gate pass:", id)
    console.log("Request body:", body)

    const { officer_id, officer_name, remarks, role } = body

    if (!officer_id || !role) {
      return NextResponse.json({
        success: false,
        error: "Officer ID and role are required"
      }, { status: 400 })
    }

    // Start transaction
    await pool.query('BEGIN')

    try {
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
      `

      const result = await pool.query(updateQuery, [
        officer_id,
        remarks || `Approved by ${role}`,
        id
      ])

      if (result.rows.length === 0) {
        throw new Error("Temporary gate pass not found")
      }

      const updatedPass = result.rows[0]

      // Log the approval action
      await pool.query(
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
      )

      // Send email notification to Ch.OS/NPB (optional)
      // await sendEmailToChOS(updatedPass)

      await pool.query('COMMIT')

      console.log("Temporary gate pass approved successfully:", updatedPass.temp_pass_number)

      return NextResponse.json({
        success: true,
        message: "Temporary gate pass approved and forwarded to Ch.OS/NPB",
        application: updatedPass
      })

    } catch (error) {
      await pool.query('ROLLBACK')
      throw error
    }

  } catch (error) {
    console.error("Error approving temporary gate pass:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to approve temporary gate pass",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
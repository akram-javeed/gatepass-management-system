// app/api/temporary-gate-pass/[id]/reject/route.ts

import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Await params as required in Next.js 15+
    const { id } = await params
    const body = await request.json()
    
    console.log("Rejecting temporary gate pass:", id)
    console.log("Request body:", body)

    const { officer_id, officer_name, rejection_reason, role } = body

    if (!officer_id || !rejection_reason) {
      return NextResponse.json({
        success: false,
        error: "Officer ID and rejection reason are required"
      }, { status: 400 })
    }

    // Start transaction
    await pool.query('BEGIN')

    try {
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
      `

      const result = await pool.query(updateQuery, [
        officer_id,
        rejection_reason,
        id
      ])

      if (result.rows.length === 0) {
        throw new Error("Temporary gate pass not found")
      }

      const updatedPass = result.rows[0]

      // Log the rejection action
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
          'officer_rejected',
          officer_id,
          role,
          `Rejected by ${officer_name || role}: ${rejection_reason}`,
          role === 'officer1' ? 'pending_with_officer1' : 'pending_with_officer2',
          'rejected'
        ]
      )

      // Send rejection email to applicant (optional)
      // await sendRejectionEmail(updatedPass)

      await pool.query('COMMIT')

      console.log("Temporary gate pass rejected:", updatedPass.temp_pass_number)

      return NextResponse.json({
        success: true,
        message: "Temporary gate pass has been rejected",
        application: updatedPass
      })

    } catch (error) {
      await pool.query('ROLLBACK')
      throw error
    }

  } catch (error) {
    console.error("Error rejecting temporary gate pass:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to reject temporary gate pass",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
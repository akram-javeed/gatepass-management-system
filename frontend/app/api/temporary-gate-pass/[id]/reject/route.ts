// app/api/temporary-gate-pass/[id]/reject/route.ts
import { NextRequest, NextResponse } from "next/server"
import { callBackendAPI } from "@/lib/api"

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

    // Call backend API
    const data = await callBackendAPI(`/api/temporary-gate-pass/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    console.log("Temporary gate pass rejected via backend:", data?.application?.temp_pass_number)

    return NextResponse.json(data)

  } catch (error) {
    console.error("Error rejecting temporary gate pass:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to reject temporary gate pass",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
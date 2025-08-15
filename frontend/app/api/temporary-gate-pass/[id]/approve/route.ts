// app/api/temporary-gate-pass/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server"
import { callBackendAPI } from "@/lib/api"

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

    // Call backend API
    const data = await callBackendAPI(`/api/temporary-gate-pass/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    console.log("Temporary gate pass approved successfully via backend")

    return NextResponse.json(data)

  } catch (error) {
    console.error("Error approving temporary gate pass:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to approve temporary gate pass",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
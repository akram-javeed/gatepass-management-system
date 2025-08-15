// app/api/temporary-gate-pass/[id]/generate-pdf/route.ts
import { NextRequest, NextResponse } from "next/server"
import { callBackendAPI } from "@/lib/api"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const body = await request.json()
    
    console.log("Generating PDF for temporary gate pass:", id)
    console.log("Request body:", body)

    // Call backend API
    const data = await callBackendAPI(`/api/temporary-gate-pass/${id}/generate-pdf`, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    console.log("PDF generated via backend:", data?.permitNumber)

    return NextResponse.json(data)

  } catch (error) {
    console.error("Error generating temporary gate pass PDF:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to generate PDF",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
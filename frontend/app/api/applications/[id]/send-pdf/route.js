import { NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json()

    console.log("Frontend API - Sending PDF for application:", id, "Body:", body)

    const response = await fetch(`${BACKEND_URL}/api/applications/${id}/send-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: body.userId,
        userRole: body.userRole
      }),
    })

    const data = await response.json()
    console.log("Backend response status:", response.status)
    console.log("Backend response data:", data)

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to send PDF to contractor" },
        { status: response.status }
      )
    }

    return NextResponse.json({
      ...data,
      message: data.message || "Gate pass sent successfully via email"
    })
  } catch (error) {
    console.error("Error in send-pdf route:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
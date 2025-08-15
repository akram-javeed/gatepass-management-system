import { NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

export async function POST(request, { params }) {
  try {
    // FIX 1: Add await before params
    const { id } = await params
    const body = await request.json()

    console.log("Frontend API - Approving application:", id, "Body:", body)

    // FIX 2: Check if this is a send-pdf action
    let endpoint = `${BACKEND_URL}/api/applications/${id}/approve`
    
    // If action is send-pdf, use the send-pdf endpoint instead
    if (body.action === 'send-pdf') {
      console.log("Detected send-pdf action, using send-pdf endpoint")
      endpoint = `${BACKEND_URL}/api/applications/${id}/send-pdf`
      
      // For send-pdf, we only need userId and userRole
      const response = await fetch(endpoint, {
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
          { error: data.error || "Failed to send PDF" },
          { status: response.status }
        )
      }

      return NextResponse.json(data)
    }

    // Regular approval flow
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: body.userId,
        userRole: body.userRole,
        remarks: body.remarks,
        forwardTo: body.forwardTo,
        forwardToUserId: body.forwardToUserId
      }),
    })

    const data = await response.json()
    console.log("Backend response status:", response.status)
    console.log("Backend response data:", data)

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to approve application" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in approve route:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request, { params }) {
  try {
    // FIX: Add await before params
    const { id } = await params

    const response = await fetch(`${BACKEND_URL}/api/applications/details/${id}`)
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to fetch application" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
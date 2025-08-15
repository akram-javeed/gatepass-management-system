import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000"
    const response = await fetch(`${backendUrl}/api/applications`)
    const responseText = await response.text()

    let data
    try {
      data = JSON.parse(responseText)
    } catch (err) {
      console.error("Failed to parse backend response as JSON:", err)
      return NextResponse.json(
        { error: "Invalid backend response", details: responseText },
        { status: 502 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("API Proxy Error:", error)
    return NextResponse.json(
      { error: "Failed to load applications" },
      { status: 500 }
    )
  }
}

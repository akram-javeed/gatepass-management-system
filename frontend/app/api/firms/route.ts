import { NextRequest, NextResponse } from "next/server"
import { callBackendAPI } from "@/lib/api"

// GET /api/firms
export async function GET() {
  try {
    const data = await callBackendAPI('/api/firms')
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching firms:", error)
    return NextResponse.json({ error: "Failed to fetch firms" }, { status: 500 })
  }
}

// POST /api/firms
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const data = await callBackendAPI('/api/firms', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating firm:", error)
    return NextResponse.json({ error: "Failed to create firm" }, { status: 500 })
  }
}
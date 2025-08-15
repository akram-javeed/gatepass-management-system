// app/api/applications/sse/[sseUserId]/route.js
import { NextResponse } from "next/server"
import { callBackendAPI } from "@/lib/api"

export async function GET(request, { params }) {
  try {
    const { sseUserId } = await params
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '20'
    
    console.log(`=== SSE Applications API Debug ===`)
    console.log(`SSE User ID: ${sseUserId}`)
    console.log(`Type of sseUserId: ${typeof sseUserId}`)
    
    // Forward query parameters to backend
    const queryString = `?page=${page}&limit=${limit}`
    const data = await callBackendAPI(`/api/applications/sse/${sseUserId}${queryString}`)
    
    return NextResponse.json(data)

  } catch (error) {
    console.error("=== SSE Applications API Error ===")
    console.error("Error details:", error)
    
    return NextResponse.json({
      success: false,
      error: "Failed to fetch SSE assigned applications",
      details: error.message
    }, { status: 500 })
  }
}
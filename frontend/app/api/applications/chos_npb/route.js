import { NextResponse } from "next/server"
import { callBackendAPI } from "@/lib/api"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '50'
    
    // Forward query parameters to backend
    const queryString = `?page=${page}&limit=${limit}`
    const data = await callBackendAPI(`/api/applications/chos_npb${queryString}`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching Ch.OS/NPB applications:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch applications",
      details: error.message
    }, { status: 500 })
  }
}
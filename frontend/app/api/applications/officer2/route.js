import { NextResponse } from "next/server"
import { callBackendAPI } from "@/lib/api"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '50'
    
    const queryString = `?page=${page}&limit=${limit}`
    const data = await callBackendAPI(`/api/applications/officer2${queryString}`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching officer2 applications:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch applications",
      details: error.message
    }, { status: 500 })
  }
}
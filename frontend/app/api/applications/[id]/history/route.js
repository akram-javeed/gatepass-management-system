// app/api/applications/[id]/history/route.js
import { NextResponse } from "next/server"
import { callBackendAPI } from "@/lib/api"

export async function GET(request, { params }) {
  try {
    // FIX: Await params before accessing its properties
    const { id } = await params
    
    console.log("Fetching approval history for application:", id)
    
    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid application ID"
      }, { status: 400 })
    }
    
    // Call backend API
    const data = await callBackendAPI(`/api/applications/${id}/history`)
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error("Error fetching approval history:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch approval history",
      details: error.message
    }, { status: 500 })
  }
}
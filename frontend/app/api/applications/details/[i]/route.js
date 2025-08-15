// app/api/applications/details/[id]/route.js
import { NextResponse } from "next/server"
import { callBackendAPI } from "@/lib/api"

export async function GET(request, { params }) {
  try {
    // Get the ID from the URL directly
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const id = pathParts[pathParts.length - 1]
    
    console.log("Extracted ID from URL:", id)
    
    if (!id || !/^\d+$/.test(id)) {
      console.log("Invalid ID:", id)
      return NextResponse.json({ 
        success: false,
        error: "Invalid application ID",
        receivedId: id
      }, { status: 400 })
    }
    
    // Call backend API
    const data = await callBackendAPI(`/api/applications/details/${id}`)
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
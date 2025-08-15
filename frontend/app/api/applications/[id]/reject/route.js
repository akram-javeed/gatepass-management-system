// app/api/applications/[id]/reject/route.js
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json()
    
    console.log("Frontend API - Rejecting application:", id, "Body:", body)
    
    // Validate required fields
    if (!body.userId || !body.userRole) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User ID and role are required' 
        },
        { status: 400 }
      )
    }

    if (!body.remarks || !body.remarks.trim()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rejection remarks are required' 
        },
        { status: 400 }
      )
    }
    
    const response = await fetch(`${BACKEND_URL}/api/applications/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    
    console.log("Backend response status:", response.status)
    
    const data = await response.json()
    console.log("Backend response data:", data)
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Frontend API - Error rejecting application:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reject application',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
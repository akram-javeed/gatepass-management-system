import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json()
    
    console.log("Frontend API - Forwarding application:", id, "Body:", body)
    
    const response = await fetch(`${BACKEND_URL}/api/applications/${id}/forward`, {
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
    console.error('Frontend API - Error forwarding application:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to forward application',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
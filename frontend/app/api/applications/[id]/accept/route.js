import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json()
    
    console.log("Frontend API - Accepting application:", id)
    
    const response = await fetch(`${BACKEND_URL}/api/applications/${id}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Frontend API - Error accepting application:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to accept application',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
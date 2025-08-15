import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export async function POST(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    
    console.log("Frontend API - Modifying period for application:", id)
    console.log("Frontend API - Period data:", body)
    
    // Validate required fields
    if (!body.gatePassPeriodFrom || !body.gatePassPeriodTo) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Both from and to dates are required' 
        },
        { status: 400 }
      )
    }
    
    const response = await fetch(`${BACKEND_URL}/api/safety/${id}/modify-period`, {
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
    console.error('Frontend API - Error modifying period:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to modify gate pass period',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
// frontend/app/api/applications/safety/[safetyOfficerId]/route.js
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export async function GET(request, { params }) {
  try {
    const { safetyOfficerId } = params
    
    console.log("Frontend API - Fetching applications for safety officer:", safetyOfficerId)
    
    const response = await fetch(`${BACKEND_URL}/api/safety/assigned/${safetyOfficerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    console.log("Safety officer applications response:", data)
    
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`)
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Frontend API - Error fetching safety officer applications:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch applications',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
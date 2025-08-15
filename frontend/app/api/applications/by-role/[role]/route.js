// app/api/applications/[role]/route.js
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export async function GET(request, { params }) {
  try {
    const { role } = params
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '20'
    
    console.log("Frontend API - Fetching applications for role:", role)
    
    const response = await fetch(`${BACKEND_URL}/api/applications/${role}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    console.log("Backend response:", data)
    
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}: ${data.error || 'Unknown error'}`)
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Frontend API - Error fetching applications by role:', error)
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
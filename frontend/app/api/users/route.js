import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const roles = searchParams.get('roles')
    
    // Build the backend URL with proper query parameters
    let url = `${BACKEND_URL}/api/users`
    
    // Add query parameters
    if (role) {
      url += `?role=${encodeURIComponent(role)}`
    } else if (roles) {
      url += `?roles=${encodeURIComponent(roles)}`
    }
    
    console.log("Frontend API - Fetching users from:", url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    console.log("Frontend API - Users response:", data)
    
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}: ${data.error || 'Unknown error'}`)
    }
    
    // Return the data as-is since backend now returns proper format
    return NextResponse.json(data)
  } catch (error) {
    console.error('Frontend API - Error fetching users:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
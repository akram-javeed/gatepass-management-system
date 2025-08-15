import { NextRequest, NextResponse } from 'next/server'
import { callBackendAPI } from "@/lib/api"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    // Call your backend auth endpoint
    const data = await callBackendAPI('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })

    // If backend returns error, pass it through
    if (!data.id) {
      return NextResponse.json({ error: data.error || 'Authentication failed' }, { status: 401 })
    }

    // Add redirect path based on role
    const responseData = {
      ...data,
      redirect: getRedirectPath(data.role),
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getRedirectPath(role: string): string {
  switch (role) {
    case 'sse':
      return '/sse-dashboard'
    case 'safety_officer':
      return '/safety-officer'
    case 'officer1':
    case 'officer2':
      return '/officer-dashboard'
    case 'chos_npb':
      return '/chos-dashboard'
    case 'contract_section':
      return '/contract-section'
    case 'admin':
      return '/admin-dashboard'
    default:
      return '/'
  }
}
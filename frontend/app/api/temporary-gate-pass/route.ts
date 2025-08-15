// app/api/temporary-gate-pass/route.ts
import { NextRequest, NextResponse } from "next/server"
import { callBackendAPI } from "@/lib/api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log("Temporary gate pass application received:", body)

    // Validate required fields
    const requiredFields = [
      'firm_name', 'address', 'representative_name', 'phone_number',
      'email', 'aadhar_number', 'number_of_persons', 'nature_of_work',
      'period_from', 'period_to', 'forward_to_user_id', 'forward_to_role'
    ]
    
    const missingFields = requiredFields.filter(field => !body[field])
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 })
    }

    // Call backend API
    const data = await callBackendAPI('/api/temporary-gate-pass', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error("Error creating temporary pass:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to submit application",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const officerId = searchParams.get('officer_id')
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '20'
    
    // Forward all query parameters to backend
    const queryString = new URLSearchParams()
    if (status) queryString.append('status', status)
    if (officerId) queryString.append('officer_id', officerId)
    queryString.append('page', page)
    queryString.append('limit', limit)
    
    console.log("Fetching temporary passes with params:", queryString.toString())
    
    const data = await callBackendAPI(`/api/temporary-gate-pass?${queryString.toString()}`)
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error("Error fetching temporary passes:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch temporary passes",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: "ID is required"
      }, { status: 400 })
    }
    
    const data = await callBackendAPI(`/api/temporary-gate-pass?id=${id}`, {
      method: 'DELETE'
    })
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error("Error deleting temporary pass:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to delete temporary pass"
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, remarks } = body
    
    if (!id || !status) {
      return NextResponse.json({
        success: false,
        error: "ID and status are required"
      }, { status: 400 })
    }
    
    const data = await callBackendAPI('/api/temporary-gate-pass', {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error("Error updating temporary pass:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to update temporary pass"
    }, { status: 500 })
  }
}
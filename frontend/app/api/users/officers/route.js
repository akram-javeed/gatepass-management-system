import { NextResponse } from "next/server"
import { callBackendAPI } from "@/lib/api"

export async function GET(request) {
  try {
    // Call backend API to get raw officer data
    const data = await callBackendAPI('/api/users/officers')
    
    // If backend returns the data in the format we expect
    if (data.success && data.officers) {
      return NextResponse.json(data)
    }
    
    // If backend returns raw data, transform it here
    const officers = data.map(officer => ({
      id: officer.id,
      name: officer.full_name,
      employeeId: officer.employee_id,
      role: officer.role,
      email: officer.email,
      displayName: `${officer.full_name} (${officer.role === 'officer2' ? 'Factory Manager' : 'Officer 1'})${officer.employee_id ? ' - ' + officer.employee_id : ''}`
    }))
    
    console.log(`Found ${officers.length} officers`)
    
    return NextResponse.json({
      success: true,
      officers: officers
    })
    
  } catch (error) {
    console.error("Error fetching officers:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch officers",
      details: error.message
    }, { status: 500 })
  }
}
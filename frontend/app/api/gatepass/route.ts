// app/api/gatepass/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("API Route - Starting gate pass submission")
    
    // Get the form data from the request
    const formData = await request.formData()
    
    // Log the form data keys (without sensitive values)
    const formDataKeys = Array.from(formData.keys())
    console.log("API Route - Received form data keys:", formDataKeys)

    // Get backend URL - your Express server is on port 5000 (update if different)
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
    const endpoint = `${backendUrl}/api/applications`
    
    console.log(`API Route - Calling backend: ${endpoint}`)

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      // Don't set Content-Type header - let the browser set it for FormData
    })

    console.log("API Route - Backend response status:", response.status)
    console.log("API Route - Backend response ok:", response.ok)

    // Get response text first
    const responseText = await response.text()
    console.log("API Route - Backend response preview:", responseText.substring(0, 300))

    if (response.ok) {
      // Try to parse as JSON
      let data
      try {
        data = JSON.parse(responseText)
        console.log("API Route - Successfully parsed backend response")
      } catch (parseError) {
        console.error("API Route - Could not parse success response as JSON:", parseError)
        // Create a fallback response that matches your frontend expectations
        data = { 
          success: true, 
          message: "Application submitted successfully",
          application: {
            id: Date.now().toString(),
            loa_number: formData.get("loa_number") as string,
            status: "pending_with_sse",
            submitted_date: new Date().toISOString()
          }
        }
      }

      return NextResponse.json(data, { status: 200 })
    } else {
      // Handle error response
      let errorData
      try {
        errorData = JSON.parse(responseText)
        console.log("API Route - Parsed backend error:", errorData)
      } catch (parseError) {
        console.error("API Route - Failed to parse backend error response as JSON:", parseError)
        errorData = { 
          error: `Backend error: ${response.status} ${response.statusText}`,
          details: responseText.substring(0, 500),
          message: response.status === 404 ? 
            "Backend endpoint not found. Make sure you added the POST route to routes/applications.js" : 
            "Backend server error"
        }
      }

      console.log("API Route - Returning error response:", errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

  } catch (error) {
    console.error("API Route - Unexpected error:", error)
    
    // More specific error handling
    let errorMessage = "Internal server error"
    let errorDetails = error instanceof Error ? error.message : "Unknown error"
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = "Cannot connect to backend server"
      errorDetails = `Failed to connect to backend at ${process.env.BACKEND_URL || "http://localhost:5000"}. Make sure the Express server is running.`
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        backendUrl: process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
      },
      { status: 500 }
    )
  }
}
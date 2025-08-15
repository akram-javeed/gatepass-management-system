import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    
    console.log("Frontend - Downloading PDF for application:", id)
    
    // Call backend to get the PDF
    const response = await fetch(`${BACKEND_URL}/api/applications/${id}/download-pdf`)
    
    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }
    
    // Get the PDF as blob
    const pdfBlob = await response.blob()
    
    // Return the PDF with appropriate headers
    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="gate-pass-${id}.pdf"`
      }
    })
    
  } catch (error) {
    console.error('Error downloading PDF:', error)
    return NextResponse.json(
      { error: 'Failed to download PDF' },
      { status: 500 }
    )
  }
}
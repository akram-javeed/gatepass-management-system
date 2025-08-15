import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request, { params }) {
  try {
    // Handle the params properly
    const pathSegments = await params.path;
    const filePath = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;
    
    console.log('Requested file path:', filePath);
    
    // Construct the full path to the uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const fullPath = path.join(uploadsDir, filePath);
    
    console.log('Full file path:', fullPath);
    
    // Security check - prevent directory traversal
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(uploadsDir)) {
      console.error('Invalid path attempted:', normalizedPath);
      return NextResponse.json({ error: 'Invalid file path' }, { status: 403 });
    }
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.error('File not found:', fullPath);
      return NextResponse.json({ error: 'File not found', path: filePath }, { status: 404 });
    }
    
    // Read the file
    const file = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    
    // Determine content type
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (['.jpg', '.jpeg'].includes(ext)) contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.doc') contentType = 'application/msword';
    else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(fullPath)}"`,
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ 
      error: 'Failed to serve file',
      details: error.message 
    }, { status: 500 });
  }
}
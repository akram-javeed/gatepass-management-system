import { NextResponse } from "next/server"
import { pool } from "@/lib/db"

export async function GET(request) {
  try {
    // Fetch users with role 'officer1' or 'officer2'
    const result = await pool.query(`
      SELECT 
        id,
        full_name,
        employee_id,
        role,
        email
      FROM users 
      WHERE role IN ('officer1', 'officer2')
      AND is_active = true
      ORDER BY role, full_name
    `);
    
    console.log(`Found ${result.rows.length} officers`);
    
    const officers = result.rows.map(officer => ({
      id: officer.id,
      name: officer.full_name,
      employeeId: officer.employee_id,
      role: officer.role,
      email: officer.email,
      displayName: `${officer.full_name} (${officer.role === 'officer2' ? 'Factory Manager' : 'Officer 1'})${officer.employee_id ? ' - ' + officer.employee_id : ''}`
    }));
    
    return NextResponse.json({
      success: true,
      officers: officers
    });
    
  } catch (error) {
    console.error("Error fetching officers:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch officers",
      details: error.message
    }, { status: 500 });
  }
}
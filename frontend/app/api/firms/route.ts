import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db" // Make sure this file exports a PostgreSQL pool or client

// GET /api/firms
export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM firms ORDER BY firm_name")
    const firms = result.rows.map((row) => ({
      id: row.id,
      firmName: row.firm_name,
      address: row.address,
      contactPerson: row.contact_person,
      phone: row.phone,
      email: row.email,
      contractorName: row.contractor_name,
      pan: row.pan,
      gst: row.gst,
    }))
    return NextResponse.json(firms)
  } catch (error) {
    console.error("Error fetching firms:", error)
    return NextResponse.json({ error: "Failed to fetch firms" }, { status: 500 })
  }
}


// POST /api/firms
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      firmName,
      address,
      contactPerson,
      phone,
      email,
      contractorName,
      pan,
      gst,
    } = body

    await pool.query(
      `INSERT INTO firms (firm_name, address, contact_person, phone, email, contractor_name, pan, gst)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [firmName, address, contactPerson, phone, email, contractorName, pan, gst]
    )

    return NextResponse.json({ message: "Firm created successfully" })
  } catch (error) {
    console.error("Error creating firm:", error)
    return NextResponse.json({ error: "Failed to create firm" }, { status: 500 })
  }
}

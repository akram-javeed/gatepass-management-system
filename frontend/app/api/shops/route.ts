import { NextResponse } from "next/server"
import { pool } from "@/lib/db"

export async function GET() {
  try {
    const result = await pool.query("SELECT id, name FROM shops ORDER BY name")
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching shops:", error)
    return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 })
  }
}

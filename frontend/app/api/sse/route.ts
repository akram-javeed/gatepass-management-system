import { NextResponse } from "next/server"
import { pool } from "@/lib/db"

export async function GET() {
  try {
    const result = await pool.query("SELECT id, name FROM railway_sse ORDER BY name")
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching SSEs:", error)
    return NextResponse.json({ error: "Failed to fetch SSEs" }, { status: 500 })
  }
}

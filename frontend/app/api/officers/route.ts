import { NextResponse } from "next/server"
import { callBackendAPI } from "@/lib/api"

export async function GET() {
  try {
    const data = await callBackendAPI('/api/officers')
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching officers:", error)
    return NextResponse.json({ error: "Failed to fetch officers" }, { status: 500 })
  }
}
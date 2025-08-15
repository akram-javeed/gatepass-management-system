import { NextResponse } from "next/server"
import { callBackendAPI } from "@/lib/api"

export async function GET() {
  try {
    const data = await callBackendAPI('/api/sse')
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching SSEs:", error)
    return NextResponse.json({ error: "Failed to fetch SSEs" }, { status: 500 })
  }
}
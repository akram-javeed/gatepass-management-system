import { NextResponse } from "next/server"
import { callBackendAPI } from "@/lib/api"

export async function GET() {
  try {
    const data = await callBackendAPI('/api/shops')
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching shops:", error)
    return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 })
  }
}
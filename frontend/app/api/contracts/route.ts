// app/api/contracts/route.ts
import { NextRequest, NextResponse } from "next/server"

// GET /api/contracts - Fetch all contracts (LOAs)
export async function GET(req: NextRequest) {
  try {
    const res = await fetch("http://localhost:5000/api/contracts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      throw new Error("Backend fetch failed")
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching contracts from backend:", error)
    return NextResponse.json({ error: "Failed to fetch LOAs" }, { status: 500 })
  }
}

// POST /api/contracts - Create a new contract (LOA)
// This forwards the request to the backend server
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const res = await fetch("http://localhost:5000/api/contracts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Error forwarding contract request:", error)
    return NextResponse.json({ error: "Failed to forward contract" }, { status: 500 })
  }
}

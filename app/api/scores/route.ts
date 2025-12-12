import { NextResponse } from "next/server"
import { saveScore, getLeaderboard } from "@/lib/db/client"

export async function POST(request: Request) {
  try {
    const { playerName, score, timeRemaining, total, difficulty } = await request.json()

    if (!playerName || typeof score !== "number" || typeof timeRemaining !== "number" || typeof total !== "number") {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    const result = await saveScore(playerName, score, timeRemaining, total, difficulty || "average")

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error("[API] Error in POST /api/scores:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "100", 10)

    const result = await getLeaderboard(limit)

    if (!result.success) {
      return NextResponse.json({ error: result.error, data: [] }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error("[API] Error in GET /api/scores:", error)
    return NextResponse.json({ error: "Internal server error", data: [] }, { status: 500 })
  }
}

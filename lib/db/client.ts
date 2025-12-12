import { Pool } from "pg"

let pool: Pool | null = null

export function getPool() {
  if (pool) return pool

  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.warn("[DB] DATABASE_URL not configured - leaderboard features will be disabled")
    return null
  }

  pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  })

  return pool
}

export async function saveScore(playerName: string, score: number, timeRemaining: number, total: number) {
  const pool = getPool()

  if (!pool) {
    console.log("[DB] Database not configured - score not saved")
    return { success: false, error: "Database not configured" }
  }

  try {
    const result = await pool.query(
      `INSERT INTO scores (player_name, score, time_remaining, total)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [playerName, score, timeRemaining, total]
    )

    console.log("[DB] Score saved successfully:", result.rows[0])
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("[DB] Error saving score:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getLeaderboard(limit = 100) {
  const pool = getPool()

  if (!pool) {
    console.log("[DB] Database not configured - returning empty leaderboard")
    return { success: true, data: [] }
  }

  try {
    const result = await pool.query(
      `SELECT
        id,
        player_name,
        score,
        time_remaining,
        total,
        created_at
       FROM scores
       ORDER BY score DESC, time_remaining DESC, created_at ASC
       LIMIT $1`,
      [limit]
    )

    return { success: true, data: result.rows }
  } catch (error) {
    console.error("[DB] Error fetching leaderboard:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error", data: [] }
  }
}

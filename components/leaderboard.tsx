"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, Medal, Award, ArrowLeft, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Score {
  id: number
  player_name: string
  score: number
  total: number
  time_remaining: number
  created_at: string
}

interface LeaderboardProps {
  onBack: () => void
  highlightName?: string
}

export function Leaderboard({ onBack, highlightName }: LeaderboardProps) {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "today" | "week">("all")

  const fetchScores = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/scores?limit=100")
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch scores")
      }

      let filteredScores = result.data || []

      // Apply time filter
      if (filter === "today") {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        filteredScores = filteredScores.filter((score: Score) => new Date(score.created_at) >= today)
      } else if (filter === "week") {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        filteredScores = filteredScores.filter((score: Score) => new Date(score.created_at) >= weekAgo)
      }

      setScores(filteredScores)
    } catch (error) {
      console.error("[Leaderboard] Error fetching scores:", error)
      setScores([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScores()
  }, [filter])

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-amber-500" />
    if (index === 1) return <Medal className="h-5 w-5 text-slate-400" />
    if (index === 2) return <Award className="h-5 w-5 text-amber-700" />
    return <span className="font-mono text-sm text-muted-foreground">#{index + 1}</span>
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button onClick={onBack} variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <h1 className="font-mono text-xl sm:text-2xl md:text-3xl font-bold">Leaderboard</h1>
        </div>

        <Button onClick={fetchScores} variant="outline" size="icon" disabled={loading} className="bg-transparent h-9 w-9 sm:h-10 sm:w-10">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Filter Tabs */}
      <Card className="p-1">
        <div className="flex gap-1">
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "ghost"}
            className="flex-1 font-mono text-xs sm:text-sm"
          >
            All Time
          </Button>
          <Button
            onClick={() => setFilter("week")}
            variant={filter === "week" ? "default" : "ghost"}
            className="flex-1 font-mono text-xs sm:text-sm"
          >
            This Week
          </Button>
          <Button
            onClick={() => setFilter("today")}
            variant={filter === "today" ? "default" : "ghost"}
            className="flex-1 font-mono text-xs sm:text-sm"
          >
            Today
          </Button>
        </div>
      </Card>

      {/* Leaderboard Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 sm:w-16 font-mono text-xs sm:text-sm">Rank</TableHead>
                <TableHead className="font-mono text-xs sm:text-sm">Player</TableHead>
                <TableHead className="font-mono text-right text-xs sm:text-sm">Score</TableHead>
                <TableHead className="font-mono text-right text-xs sm:text-sm hidden sm:table-cell">Accuracy</TableHead>
                <TableHead className="font-mono text-right text-xs sm:text-sm hidden md:table-cell">Time Left</TableHead>
                <TableHead className="font-mono text-right text-xs sm:text-sm hidden lg:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto h-5 w-16" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="ml-auto h-5 w-12" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="ml-auto h-5 w-16" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="ml-auto h-5 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : scores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <p className="font-mono text-xs sm:text-sm text-muted-foreground">No scores yet. Be the first!</p>
                  </TableCell>
                </TableRow>
              ) : (
                scores.map((score, index) => {
                  const isHighlighted = highlightName && score.player_name === highlightName
                  const percentage = Math.round((score.score / score.total) * 100)

                  return (
                    <TableRow key={score.id} className={isHighlighted ? "bg-primary/5" : ""}>
                      <TableCell className="font-mono text-xs sm:text-sm">{getRankIcon(index)}</TableCell>
                      <TableCell className="font-mono font-medium text-xs sm:text-sm">
                        {score.player_name}
                        {isHighlighted && <span className="ml-2 text-xs text-primary">(You)</span>}
                      </TableCell>
                      <TableCell className="font-mono text-right font-semibold text-xs sm:text-sm">
                        {score.score}/{score.total}
                      </TableCell>
                      <TableCell className="font-mono text-right text-muted-foreground text-xs sm:text-sm hidden sm:table-cell">
                        {percentage}%
                      </TableCell>
                      <TableCell className="font-mono text-right text-muted-foreground text-xs sm:text-sm hidden md:table-cell">
                        {formatTime(score.time_remaining)}
                      </TableCell>
                      <TableCell className="font-mono text-right text-xs text-muted-foreground hidden lg:table-cell">
                        {formatDate(score.created_at)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {scores.length > 0 && (
        <p className="text-center font-mono text-xs text-muted-foreground">
          Showing top {scores.length} scores {filter !== "all" && `from ${filter === "today" ? "today" : "this week"}`}
        </p>
      )}
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trophy, Share2, RotateCcw } from "lucide-react"
import { COUNTRIES } from "@/lib/countries"
import { useState } from "react"

interface ResultsScreenProps {
  score: number
  timeRemaining: number
  playerName: string
  onRestart: () => void
  onViewLeaderboard: () => void
}

export function ResultsScreen({ score, timeRemaining, playerName, onRestart, onViewLeaderboard }: ResultsScreenProps) {
  const [copied, setCopied] = useState(false)

  const percentage = Math.round((score / COUNTRIES.length) * 100)
  const timeTaken = 900 - timeRemaining
  const minutes = Math.floor(timeTaken / 60)
  const seconds = timeTaken % 60

  const getRank = () => {
    if (score === COUNTRIES.length) return "Perfect Score!"
    if (percentage >= 90) return "Geography Expert"
    if (percentage >= 75) return "World Traveler"
    if (percentage >= 50) return "Globe Trotter"
    if (percentage >= 25) return "Explorer"
    return "Beginner"
  }

  const handleShare = async () => {
    const shareText = `I named ${score}/${COUNTRIES.length} countries (${percentage}%) in ${minutes}m ${seconds}s!\n\nCan you beat my score?`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Countries Quiz Score",
          text: shareText,
        })
      } catch (err) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } else {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-6 sm:p-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="flex justify-center">
              <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-amber-500" />
            </div>
            <h2 className="font-mono text-2xl sm:text-3xl font-bold">{getRank()}</h2>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground">Great job, {playerName}!</p>
          </div>

          {/* Stats */}
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
            <Card className="bg-muted/50 p-3 sm:p-4 text-center">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-foreground">{score}</div>
              <div className="font-mono text-xs text-muted-foreground">Countries Named</div>
            </Card>

            <Card className="bg-muted/50 p-3 sm:p-4 text-center">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-foreground">{percentage}%</div>
              <div className="font-mono text-xs text-muted-foreground">Completion</div>
            </Card>

            <Card className="bg-muted/50 p-3 sm:p-4 text-center">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-foreground">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </div>
              <div className="font-mono text-xs text-muted-foreground">Time Taken</div>
            </Card>
          </div>

          {/* Actions */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Button onClick={handleShare} variant="outline" className="font-mono bg-transparent text-sm sm:text-base">
              <Share2 className="mr-2 h-4 w-4" />
              {copied ? "Copied!" : "Share Score"}
            </Button>
            <Button onClick={onViewLeaderboard} variant="outline" className="font-mono bg-transparent text-sm sm:text-base">
              <Trophy className="mr-2 h-4 w-4" />
              View Leaderboard
            </Button>
            <Button onClick={onRestart} className="sm:col-span-2 font-mono text-sm sm:text-base">
              <RotateCcw className="mr-2 h-4 w-4" />
              Play Again
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

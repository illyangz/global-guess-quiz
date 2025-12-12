"use client"

import { useState } from "react"
import { QuizGame } from "@/components/quiz-game"
import { ResultsScreen } from "@/components/results-screen"
import { Leaderboard } from "@/components/leaderboard"
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"

type View = "game" | "results" | "leaderboard"

export default function Home() {
  const [view, setView] = useState<View>("game")
  const [gameKey, setGameKey] = useState(0)
  const [results, setResults] = useState<{
    score: number
    timeRemaining: number
    playerName: string
  } | null>(null)

  const handleFinish = (score: number, timeRemaining: number, playerName: string) => {
    setResults({ score, timeRemaining, playerName })
    setView("results")
  }

  const handleRestart = () => {
    setGameKey((prev) => prev + 1)
    setResults(null)
    setView("game")
  }

  const handleViewLeaderboard = () => {
    setView("leaderboard")
  }

  const handleBackToGame = () => {
    setView("game")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
              <span className="font-mono text-xl font-bold text-primary-foreground">🌍</span>
            </div>
            <div>
              <h1 className="font-mono text-xl font-bold">Countries Quiz</h1>
              <p className="font-mono text-xs text-muted-foreground">Name all 197 UN member states</p>
            </div>
          </div>

          {view !== "leaderboard" && (
            <Button onClick={handleViewLeaderboard} variant="outline" className="font-mono bg-transparent">
              <Trophy className="mr-2 h-4 w-4" />
              Leaderboard
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {view === "game" && <QuizGame key={gameKey} onFinish={handleFinish} />}

        {view === "results" && results && (
          <ResultsScreen
            score={results.score}
            timeRemaining={results.timeRemaining}
            playerName={results.playerName}
            onRestart={handleRestart}
            onViewLeaderboard={handleViewLeaderboard}
          />
        )}

        {view === "leaderboard" && <Leaderboard onBack={handleBackToGame} highlightName={results?.playerName} />}
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="font-mono text-xs text-muted-foreground">
            Test your geography knowledge. Share your score with friends.
          </p>
        </div>
      </footer>
    </div>
  )
}

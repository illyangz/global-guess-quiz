"use client"

import { useState } from "react"
import { QuizGame, type Difficulty } from "@/components/quiz-game"
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
    difficulty: Difficulty
  } | null>(null)

  const handleFinish = (score: number, timeRemaining: number, playerName: string, difficulty: Difficulty) => {
    setResults({ score, timeRemaining, playerName, difficulty })
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
        <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-primary">
              <span className="font-mono text-lg sm:text-xl font-bold text-primary-foreground">🌍</span>
            </div>
            <div>
              <h1 className="font-mono text-base sm:text-lg md:text-xl font-bold">Countries Quiz</h1>
              <p className="font-mono text-xs text-muted-foreground hidden sm:block">Name all countries and territories worldwide</p>
            </div>
          </div>

          {view !== "leaderboard" && (
            <Button onClick={handleViewLeaderboard} variant="outline" className="font-mono bg-transparent text-xs sm:text-sm">
              <Trophy className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {view === "game" && <QuizGame key={gameKey} onFinish={handleFinish} />}

        {view === "results" && results && (
          <ResultsScreen
            score={results.score}
            timeRemaining={results.timeRemaining}
            playerName={results.playerName}
            difficulty={results.difficulty}
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

"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { COUNTRIES, findCountryMatch } from "@/lib/countries"
import { Clock, Trophy } from "lucide-react"
import { WorldMap } from "@/components/world-map"
import { ContinentTables } from "@/components/continent-tables"

interface QuizGameProps {
  onFinish: (score: number, timeRemaining: number, playerName: string) => void
}

export function QuizGame({ onFinish }: QuizGameProps) {
  const [started, setStarted] = useState(false)
  const [playerName, setPlayerName] = useState("")
  const [input, setInput] = useState("")
  const [guessedCountries, setGuessedCountries] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes in seconds
  const [isFinished, setIsFinished] = useState(false)
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (started && timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinish()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [started, timeLeft, isFinished])

  useEffect(() => {
    if (!input.trim() || isFinished) return

    const match = findCountryMatch(input)

    if (match && !guessedCountries.has(match)) {
      // Valid new country found - auto submit!
      setGuessedCountries((prev) => new Set(prev).add(match))
      setInput("")
      setFeedback({ message: `✓ ${match}`, type: "success" })
      setTimeout(() => setFeedback(null), 1500)
    }
  }, [input, guessedCountries, isFinished])

  const handleStart = () => {
    if (playerName.trim()) {
      setStarted(true)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleFinish = async () => {
    if (isFinished) return
    setIsFinished(true)

    const score = guessedCountries.size

    try {
      console.log("[Quiz] Attempting to save score...")

      const response = await fetch("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerName,
          score,
          timeRemaining: timeLeft,
          total: COUNTRIES.length,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        console.error("[Quiz] Error saving score:", result.error)
      } else {
        console.log("[Quiz] Score saved successfully")
      }
    } catch (error) {
      console.error("[Quiz] Error saving score:", error)
      // Don't let database errors prevent the game from finishing
    }

    onFinish(score, timeLeft, playerName)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!started) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="font-mono text-2xl font-bold">Name All Countries</h2>
              <p className="text-sm text-muted-foreground">You have 15 minutes to name all 197 UN member states</p>
              <p className="text-xs text-muted-foreground">
                Just start typing - countries are submitted automatically!
              </p>
            </div>
            <div className="space-y-4">
              <Input
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                className="font-mono"
              />
              <Button onClick={handleStart} disabled={!playerName.trim()} className="w-full font-mono">
                Start Quiz
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Stats Bar */}
      <div className="flex items-center justify-between gap-4">
        <Card className="flex items-center gap-3 px-4 py-3">
          <Trophy className="h-5 w-5 text-amber-500" />
          <div className="font-mono text-sm">
            <span className="text-2xl font-bold">{guessedCountries.size}</span>
            <span className="text-muted-foreground">/{COUNTRIES.length}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-3 px-4 py-3">
          <Clock className="h-5 w-5 text-blue-500" />
          <div className="font-mono text-2xl font-bold">{formatTime(timeLeft)}</div>
        </Card>

        <Button onClick={handleFinish} variant="outline" className="font-mono bg-transparent">
          Give Up
        </Button>
      </div>

      <WorldMap guessedCountries={guessedCountries} isFinished={isFinished} allCountries={COUNTRIES} />

      {/* Input Area */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="font-mono text-sm font-medium">
              Type a country name: <span className="text-muted-foreground">(auto-submits when valid)</span>
            </label>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. France, UK, USA, Japan..."
              className="font-mono text-lg"
              disabled={isFinished}
            />
          </div>

          {feedback && (
            <div
              className={`rounded-md border px-4 py-2 font-mono text-sm ${
                feedback.type === "success"
                  ? "border-green-500/50 bg-green-500/10 text-green-600"
                  : "border-red-500/50 bg-red-500/10 text-red-600"
              }`}
            >
              {feedback.message}
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="font-mono text-sm font-medium">{isFinished ? "All Countries:" : "Countries Guessed So Far:"}</h3>
        <ContinentTables guessedCountries={guessedCountries} isFinished={isFinished} />
      </div>
    </div>
  )
}

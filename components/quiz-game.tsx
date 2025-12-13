"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { COUNTRIES, findCountryMatch } from "@/lib/countries";
import { Clock, Trophy } from "lucide-react";
import { WorldMap } from "@/components/world-map";
import { ContinentTables } from "@/components/continent-tables";

export type Difficulty = "beginner" | "average" | "expert";

interface QuizGameProps {
  onFinish: (
    score: number,
    timeRemaining: number,
    playerName: string,
    difficulty: Difficulty
  ) => void;
}

const DIFFICULTY_TIMES: Record<Difficulty, number> = {
  beginner: 1200, // 20 minutes
  average: 900, // 15 minutes
  expert: 600, // 10 minutes
};

export function QuizGame({ onFinish }: QuizGameProps) {
  const [started, setStarted] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("average");
  const [input, setInput] = useState("");
  const [guessedCountries, setGuessedCountries] = useState<Set<string>>(
    new Set()
  );
  const [timeLeft, setTimeLeft] = useState(900); // Will be set based on difficulty
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (started && timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [started, timeLeft, isFinished]);

  useEffect(() => {
    if (!input.trim() || isFinished) return;

    const match = findCountryMatch(input);

    if (match && !guessedCountries.has(match)) {
      // Valid new country found - auto submit!
      setGuessedCountries((prev) => new Set(prev).add(match));
      setInput("");
      setFeedback({ message: `✓ ${match}`, type: "success" });
      setTimeout(() => setFeedback(null), 1500);
    }
  }, [input, guessedCountries, isFinished]);

  const handleStart = () => {
    if (playerName.trim()) {
      setTimeLeft(DIFFICULTY_TIMES[difficulty]);
      setStarted(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleFinish = async () => {
    if (isFinished) return;
    setIsFinished(true);

    const score = guessedCountries.size;

    try {
      console.log("[Quiz] Attempting to save score...");

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
          difficulty,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("[Quiz] Error saving score:", result.error);
      } else {
        console.log("[Quiz] Score saved successfully");
      }
    } catch (error) {
      console.error("[Quiz] Error saving score:", error);
      // Don't let database errors prevent the game from finishing
    }

    onFinish(score, timeLeft, playerName, difficulty);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!started) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="font-mono text-2xl font-bold">
                Name All Countries
              </h2>
              <p className="text-sm text-muted-foreground">
                Can you name the countries around the world?
              </p>
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

              <div className="space-y-2">
                <label className="font-mono text-sm font-medium">
                  Select Difficulty:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={difficulty === "beginner" ? "default" : "outline"}
                    onClick={() => setDifficulty("beginner")}
                    className="font-mono text-xs"
                  >
                    <div className="flex flex-col items-center">
                      <span>Beginner</span>
                      <span className="text-[10px] opacity-70">20 min</span>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant={difficulty === "average" ? "default" : "outline"}
                    onClick={() => setDifficulty("average")}
                    className="font-mono text-xs"
                  >
                    <div className="flex flex-col items-center">
                      <span>Average</span>
                      <span className="text-[10px] opacity-70">15 min</span>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant={difficulty === "expert" ? "default" : "outline"}
                    onClick={() => setDifficulty("expert")}
                    className="font-mono text-xs"
                  >
                    <div className="flex flex-col items-center">
                      <span>Expert</span>
                      <span className="text-[10px] opacity-70">10 min</span>
                    </div>
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleStart}
                disabled={!playerName.trim()}
                className="w-full font-mono"
              >
                Start Quiz
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
      {/* Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <Card className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
          <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 flex-shrink-0" />
          <div className="font-mono text-sm">
            <span className="text-xl sm:text-2xl font-bold">
              {guessedCountries.size}
            </span>
            <span className="text-muted-foreground">/{COUNTRIES.length}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
          <div className="font-mono text-xl sm:text-2xl font-bold">
            {formatTime(timeLeft)}
          </div>
        </Card>

        <Button
          onClick={handleFinish}
          variant="outline"
          className="font-mono bg-transparent py-2.5 sm:py-3"
        >
          Give Up
        </Button>
      </div>

      <WorldMap
        guessedCountries={guessedCountries}
        isFinished={isFinished}
        allCountries={COUNTRIES}
      />

      {/* Input Area */}
      <Card className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <label className="font-mono text-xs sm:text-sm font-medium">
              Type a country name:{" "}
              <span className="text-muted-foreground hidden sm:inline">
                (auto-submits when valid)
              </span>
            </label>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. France, UK, USA, Japan..."
              className="font-mono text-base sm:text-lg"
              disabled={isFinished}
            />
          </div>

          {feedback && (
            <div
              className={`rounded-md border px-3 sm:px-4 py-2 font-mono text-xs sm:text-sm ${
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
        <h3 className="font-mono text-sm font-medium">
          {isFinished ? "All Countries:" : "Countries Guessed So Far:"}
        </h3>
        <ContinentTables
          guessedCountries={guessedCountries}
          isFinished={isFinished}
        />
      </div>
    </div>
  );
}

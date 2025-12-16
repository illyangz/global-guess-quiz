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
export type Language = "en" | "es" | "fr" | "de" | "pt" | "ar" | "ca" | "it";

interface QuizGameProps {
  onFinish: (
    score: number,
    timeRemaining: number,
    playerName: string,
    difficulty: Difficulty,
    guessedCountries: Set<string>
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
  const [language, setLanguage] = useState<Language>("en");
  const [input, setInput] = useState("");
  const [guessedCountries, setGuessedCountries] = useState<Set<string>>(
    new Set()
  );
  const [timeLeft, setTimeLeft] = useState(900); // Will be set based on difficulty
  const [isFinished, setIsFinished] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewTimeLeft, setReviewTimeLeft] = useState(180); // 3 minutes for review
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (started && timeLeft > 0 && !isFinished && !isReviewing) {
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
  }, [started, timeLeft, isFinished, isReviewing]);

  // Review period timer
  useEffect(() => {
    if (isReviewing && reviewTimeLeft > 0) {
      const timer = setInterval(() => {
        setReviewTimeLeft((prev) => {
          if (prev <= 1) {
            handleShowResults();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isReviewing, reviewTimeLeft]);

  useEffect(() => {
    if (!input.trim() || isFinished || isReviewing) return;

    const match = findCountryMatch(input);

    if (match && !guessedCountries.has(match)) {
      // Valid new country found - auto submit!
      setGuessedCountries((prev) => new Set(prev).add(match));
      setInput("");
      setFeedback({ message: `✓ ${match}`, type: "success" });
      setTimeout(() => setFeedback(null), 1500);
    }
  }, [input, guessedCountries, isFinished, isReviewing]);

  const handleStart = () => {
    if (playerName.trim()) {
      setTimeLeft(DIFFICULTY_TIMES[difficulty]);
      setStarted(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleFinish = () => {
    if (isFinished) return;
    setIsFinished(true);
    setIsReviewing(true);
    setReviewTimeLeft(180); // Reset to 3 minutes
  };

  const handleShowResults = async () => {
    if (!isFinished) return;

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

    onFinish(score, timeLeft, playerName, difficulty, guessedCountries);
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
                {/* lets put a total number of countries that we have */}
                Can you name all {COUNTRIES.length} countries and territories in
                the world?
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

              <div className="space-y-2">
                <label className="font-mono text-sm font-medium">
                  Select Language:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    type="button"
                    variant={language === "en" ? "default" : "outline"}
                    onClick={() => setLanguage("en")}
                    className="font-mono text-xs"
                  >
                    English
                  </Button>
                  <Button
                    type="button"
                    variant={language === "es" ? "default" : "outline"}
                    onClick={() => setLanguage("es")}
                    className="font-mono text-xs"
                  >
                    Español
                  </Button>
                  <Button
                    type="button"
                    variant={language === "fr" ? "default" : "outline"}
                    onClick={() => setLanguage("fr")}
                    className="font-mono text-xs"
                  >
                    Français
                  </Button>
                  <Button
                    type="button"
                    variant={language === "de" ? "default" : "outline"}
                    onClick={() => setLanguage("de")}
                    className="font-mono text-xs"
                  >
                    Deutsch
                  </Button>
                  <Button
                    type="button"
                    variant={language === "it" ? "default" : "outline"}
                    onClick={() => setLanguage("it")}
                    className="font-mono text-xs"
                  >
                    Italiano
                  </Button>
                  <Button
                    type="button"
                    variant={language === "pt" ? "default" : "outline"}
                    onClick={() => setLanguage("pt")}
                    className="font-mono text-xs"
                  >
                    Português
                  </Button>
                  <Button
                    type="button"
                    variant={language === "ar" ? "default" : "outline"}
                    onClick={() => setLanguage("ar")}
                    className="font-mono text-xs"
                  >
                    العربية
                  </Button>
                  <Button
                    type="button"
                    variant={language === "ca" ? "default" : "outline"}
                    onClick={() => setLanguage("ca")}
                    className="font-mono text-xs"
                  >
                    Català
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Type country names in your selected language
                </p>
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

  // Review screen after quiz ends
  if (isReviewing) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        {/* Review Header */}
        <Card className="p-4 sm:p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h2 className="font-mono text-lg sm:text-xl font-bold mb-1">Review Period</h2>
              <p className="font-mono text-xs sm:text-sm text-muted-foreground">
                Study the map to see which countries you missed (red) and got correct (green)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <div className="font-mono text-2xl font-bold">
                  {formatTime(reviewTimeLeft)}
                </div>
              </div>
              <Button
                onClick={handleShowResults}
                className="font-mono"
              >
                View Results
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Card className="bg-green-50 dark:bg-green-950/20 p-4 text-center border-green-200 dark:border-green-900">
            <div className="font-mono text-3xl font-bold text-green-600">
              {guessedCountries.size}
            </div>
            <div className="font-mono text-xs text-muted-foreground">Correct</div>
          </Card>
          <Card className="bg-red-50 dark:bg-red-950/20 p-4 text-center border-red-200 dark:border-red-900">
            <div className="font-mono text-3xl font-bold text-red-600">
              {COUNTRIES.length - guessedCountries.size}
            </div>
            <div className="font-mono text-xs text-muted-foreground">Missed</div>
          </Card>
        </div>

        <WorldMap
          guessedCountries={guessedCountries}
          isFinished={isFinished}
          allCountries={COUNTRIES}
        />

        <div className="space-y-3">
          <h3 className="font-mono text-sm font-medium">All Countries by Continent:</h3>
          <ContinentTables
            guessedCountries={guessedCountries}
            isFinished={isFinished}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
      {/* Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <Card className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
          <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 shrink-0" />
          <div className="font-mono text-sm">
            <span className="text-xl sm:text-2xl font-bold">
              {guessedCountries.size}
            </span>
            <span className="text-muted-foreground">/{COUNTRIES.length}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 shrink-0" />
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

"use client"

import { getCountriesByContinent } from "@/lib/countries"
import { Card } from "@/components/ui/card"
import { Check, X } from "lucide-react"

interface ContinentTablesProps {
  guessedCountries: Set<string>
  isFinished?: boolean
}

export function ContinentTables({ guessedCountries, isFinished = false }: ContinentTablesProps) {
  const continents = getCountriesByContinent()

  const continentOrder: Array<keyof typeof continents> = [
    "Europe",
    "Asia",
    "Africa",
    "North America",
    "South America",
    "Oceania",
  ]

  const getContinentStats = (continent: keyof typeof continents) => {
    const countries = continents[continent]
    const guessed = countries.filter((c) => guessedCountries.has(c)).length
    return { total: countries.length, guessed }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {continentOrder.map((continent) => {
        const countries = continents[continent]
        const stats = getContinentStats(continent)

        return (
          <Card key={continent} className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-mono text-sm font-bold">{continent}</h3>
              <span className="font-mono text-xs text-muted-foreground">
                {stats.guessed}/{stats.total}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              {countries.map((country) => {
                const isGuessed = guessedCountries.has(country)
                const shouldShow = isFinished || isGuessed

                if (!shouldShow) return null

                return (
                  <div
                    key={country}
                    className={`flex items-center gap-2 rounded px-2 py-1 font-mono transition-colors ${
                      isGuessed
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-red-500/10 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {isGuessed ? <Check className="h-3 w-3 flex-shrink-0" /> : <X className="h-3 w-3 flex-shrink-0" />}
                    <span>{country}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

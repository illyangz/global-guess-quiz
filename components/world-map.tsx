"use client"
import { Card } from "@/components/ui/card"
import { useEffect, useRef } from "react"
import { getCountryISO } from "@/lib/countries"

interface WorldMapProps {
  guessedCountries: Set<string>
  isFinished?: boolean
  allCountries?: string[]
}

export function WorldMap({ guessedCountries, isFinished = false, allCountries = [] }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const missedCountries = isFinished ? allCountries.filter((country) => !guessedCountries.has(country)) : []

  useEffect(() => {
    if (!containerRef.current) return

    const svgUrl = "/World Vector Map.svg"

    fetch(svgUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.text()
      })
      .then((svgText) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svgText

          const svg = containerRef.current.querySelector("svg")
          if (svg) {
            svg.style.width = "100%"
            svg.style.height = "auto"
            svg.style.display = "block"
          }

          colorCountries()
        }
      })
      .catch((error) => {
        console.error("[v0] Error loading world map:", error)
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="flex items-center justify-center p-12 text-muted-foreground">
              <p>World map loading...</p>
            </div>
          `
        }
      })
  }, [])

  useEffect(() => {
    colorCountries()
  }, [guessedCountries, isFinished])

  const colorCountries = () => {
    if (!containerRef.current) return

    const allPaths = containerRef.current.querySelectorAll("path[id]")
    allPaths.forEach((path) => {
      path.setAttribute("fill", "#d1d5db") // gray-300
      path.setAttribute("stroke", "#000000")
      path.setAttribute("stroke-width", "0.2")
    })

    guessedCountries.forEach((countryName) => {
      const isoCode = getCountryISO(countryName)

      if (!isoCode) {
        console.log("[v0] No ISO code found for:", countryName)
        return
      }

      // The SVG uses ISO alpha-2 codes as IDs for all countries
      const elements = containerRef.current?.querySelectorAll(`path[id="${isoCode}"]`)

      if (elements && elements.length > 0) {
        elements.forEach((element) => {
          element.setAttribute("fill", "#22c55e") // green-500
          element.setAttribute("stroke", "#166534") // green-800
          element.setAttribute("stroke-width", "0.5")
        })
      } else {
        console.log("[v0] Could not find SVG element for:", countryName, "with ISO:", isoCode)
      }
    })

    if (isFinished) {
      missedCountries.forEach((countryName) => {
        const isoCode = getCountryISO(countryName)

        if (!isoCode) return

        // The SVG uses ISO alpha-2 codes as IDs for all countries
        const elements = containerRef.current?.querySelectorAll(`path[id="${isoCode}"]`)

        if (elements && elements.length > 0) {
          elements.forEach((element) => {
            element.setAttribute("fill", "#ef4444") // red-500
            element.setAttribute("stroke", "#991b1b") // red-800
            element.setAttribute("stroke-width", "0.5")
          })
        }
      })
    }
  }

  return (
    <Card className="relative w-full overflow-hidden bg-slate-50 p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-sm font-medium">World Map</h3>
          <div className="flex items-center gap-4 font-mono text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-green-500" />
              <span className="text-muted-foreground">Guessed: </span>
              <span className="font-bold">{guessedCountries.size}</span>
            </div>
            {isFinished && missedCountries.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-red-500" />
                <span className="text-muted-foreground">Missed: </span>
                <span className="font-bold">{missedCountries.length}</span>
              </div>
            )}
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative w-full rounded-lg overflow-hidden bg-white border border-gray-200 min-h-[400px] flex items-center justify-center"
        />

        <p className="text-center font-mono text-xs text-muted-foreground">
          {isFinished
            ? "Game Over - Green shows correct answers, Red shows missed countries"
            : "Countries will turn green as you guess them"}
        </p>
      </div>
    </Card>
  )
}

// Script to test which countries are missing from the SVG map
// Run with: npx tsx scripts/test-svg-mapping.ts

import { COUNTRIES, getCountryISO } from "../lib/countries"

const SVG_PATH = "/Users/yanga/Code/guess-global/global-guess-quiz/public/World Vector Map.svg"

async function testSVGMapping() {
  console.log("Reading SVG file...")
  const fs = await import("fs/promises")
  const svgText = await fs.readFile(SVG_PATH, "utf-8")

  console.log("Extracting path IDs and classes from SVG...")
  const idRegex = /<path[^>]*id="([^"]+)"/g
  const classRegex = /<path[^>]*class="([^"]+)"/g
  const svgIds = new Set<string>()
  const svgClasses = new Set<string>()
  let match

  while ((match = idRegex.exec(svgText)) !== null) {
    svgIds.add(match[1])
  }

  while ((match = classRegex.exec(svgText)) !== null) {
    svgClasses.add(match[1])
  }

  console.log(`Found ${svgIds.size} path elements with IDs and ${svgClasses.size} unique classes in the SVG\n`)
  console.log("Testing country mappings...\n")

  const missingCountries: string[] = []
  const foundCountries: string[] = []

  COUNTRIES.forEach((country) => {
    const isoCode = getCountryISO(country)

    if (!isoCode) {
      console.log(`⚠️  ${country} -> NO ISO CODE IN DATA`)
      missingCountries.push(country)
      return
    }

    // Check if found by ID or by class name
    if (svgIds.has(isoCode) || svgClasses.has(country)) {
      foundCountries.push(country)
    } else {
      missingCountries.push(country)
      console.log(`❌ ${country} -> ISO "${isoCode}" or class "${country}" NOT FOUND IN SVG`)
    }
  })

  console.log("\n" + "=".repeat(60))
  console.log(`✅ Found: ${foundCountries.length}/${COUNTRIES.length} countries`)
  console.log(`❌ Missing: ${missingCountries.length}/${COUNTRIES.length} countries`)
  console.log("=".repeat(60))

  if (missingCountries.length > 0) {
    console.log("\nMissing countries:")
    missingCountries.forEach((country) => {
      const isoCode = getCountryISO(country)
      console.log(`  - ${country} (ISO: "${isoCode || 'NONE'}")`)
    })

    console.log("\nAll SVG IDs available:")
    const sortedIds = Array.from(svgIds).sort()
    sortedIds.forEach(id => console.log(`  - ${id}`))
  }
}

testSVGMapping().catch(console.error)

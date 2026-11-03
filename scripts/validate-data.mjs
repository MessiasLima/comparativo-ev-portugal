import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const carsDir = path.join(root, "src/data/cars")
const equipmentFile = path.join(root, "src/data/equipment.ts")

const criteria = [
  { id: "interior", kind: "editorial", direction: "higher" },
  { id: "comfort", kind: "editorial", direction: "higher" },
  { id: "brand", kind: "editorial", direction: "higher" },
  { id: "equipment", kind: "objective", direction: "higher" },
  { id: "sound", kind: "editorial", direction: "higher" },
  { id: "range", kind: "objective", direction: "higher" },
  { id: "powerToWeight", kind: "objective", direction: "higher" },
  { id: "efficiency", kind: "objective", direction: "lower" },
  { id: "charging", kind: "objective", direction: "higher" },
  { id: "satisfaction", kind: "editorial", direction: "higher" },
]

const requiredFields = [
  "id",
  "slug",
  "brand",
  "model",
  "variant",
  "version",
  "year",
  "segment",
  "tagline",
  "price",
  "specs",
  "charging",
  "warranty",
  "equipmentIncluded",
  "reviews",
  "dossier",
  "sources",
]

const files = fs
  .readdirSync(carsDir)
  .filter((file) => file.endsWith(".json"))
  .sort()

if (files.length === 0) {
  console.error("Nenhum JSON encontrado em src/data/cars.")
  process.exit(1)
}

const equipmentIds = [
  ...fs
    .readFileSync(equipmentFile, "utf8")
    .matchAll(/\{ id: "([^"]+)"/g),
].map((match) => match[1])

const cars = files.map((file) => {
  const raw = fs.readFileSync(path.join(carsDir, file), "utf8")
  try {
    return { file, data: JSON.parse(raw) }
  } catch (error) {
    console.error(`JSON inválido em ${file}:`, error.message)
    process.exit(1)
  }
})

const errors = []
const seenIds = new Map()
const seenSlugs = new Map()
const seenNames = new Map()

for (const { file, data: car } of cars) {
  for (const field of requiredFields) {
    if (car[field] === undefined) {
      errors.push(`${file}: campo em falta "${field}"`)
    }
  }

  if (typeof car.variant !== "string" || car.variant.trim() === "") {
    errors.push(`${file}: "variant" tem de ser uma variante comercial não vazia`)
  } else {
    const publicName = `${car.brand} ${car.model} ${car.variant}`
    if (seenNames.has(publicName)) {
      errors.push(
        `${file}: nome público duplicado "${publicName}" (também em ${seenNames.get(publicName)})`,
      )
    }
    seenNames.set(publicName, file)
  }

  if (seenIds.has(car.id)) {
    errors.push(`${file}: id duplicado "${car.id}" (também em ${seenIds.get(car.id)})`)
  }
  seenIds.set(car.id, file)

  if (seenSlugs.has(car.slug)) {
    errors.push(`${file}: slug duplicado "${car.slug}" (também em ${seenSlugs.get(car.slug)})`)
  }
  seenSlugs.set(car.slug, file)

  if (!(car.price?.amount > 0)) {
    errors.push(`${file}: price.amount tem de ser positivo`)
  }

  for (const criterion of criteria) {
    if (!car.reviews?.[criterion.id]) {
      errors.push(`${file}: review em falta para "${criterion.id}"`)
      continue
    }
    if (criterion.kind === "editorial") {
      const base = car.reviews[criterion.id].baseScore
      if (typeof base !== "number" || base < 0 || base > 10) {
        errors.push(`${file}: baseScore de "${criterion.id}" tem de estar entre 0 e 10`)
      }
    }
  }

  const sourceIds = new Set((car.sources ?? []).map((source) => source.id))
  for (const [criterionId, review] of Object.entries(car.reviews ?? {})) {
    for (const sourceId of review.sourceIds ?? []) {
      if (!sourceIds.has(sourceId)) {
        errors.push(`${file}: review "${criterionId}" referencia fonte desconhecida "${sourceId}"`)
      }
    }
  }

  const equipment = new Set(car.equipmentIncluded ?? [])
  for (const equipmentId of equipment) {
    if (!equipmentIds.includes(equipmentId)) {
      errors.push(`${file}: equipamento desconhecido "${equipmentId}"`)
    }
  }
}

if (errors.length > 0) {
  console.error("\nErros de dados:\n")
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}

function metric(car, criterionId) {
  switch (criterionId) {
    case "equipment":
      return car.equipmentIncluded.filter((id) => equipmentIds.includes(id)).length
    case "range":
      return car.specs.rangeKm
    case "powerToWeight":
      return car.specs.powerHp / car.specs.weightKg
    case "efficiency":
      return car.specs.consumptionKwh100
    case "charging":
      return car.charging.dcKw * 0.7 + car.charging.acKw * 0.3
    default:
      return car.reviews[criterionId].baseScore
  }
}

const scored = cars.map(({ data: car }) => {
  let total = 0
  for (const criterion of criteria) {
    const values = cars.map(({ data }) => metric(data, criterion.id))
    const best =
      criterion.direction === "higher"
        ? Math.max(...values)
        : Math.min(...values)
    const value = metric(car, criterion.id)
    total +=
      criterion.direction === "higher" ? (value / best) * 10 : (best / value) * 10
  }
  const score = total / criteria.length
  return { car, score, pricePerPoint: car.price.amount / score }
})

const byScore = [...scored].sort((a, b) => b.score - a.score)
const byValue = [...scored].sort((a, b) => a.pricePerPoint - b.pricePerPoint)

console.log(`\nDados válidos: ${cars.length} carros, ${equipmentIds.length} equipamentos.\n`)
console.log("Ranking geral")
for (const [index, entry] of byScore.entries()) {
  console.log(
    `  ${index + 1}. ${entry.car.brand} ${entry.car.model} ${entry.car.variant} — ${entry.score.toFixed(2)}/10`,
  )
}
console.log("\nCusto-benefício")
for (const [index, entry] of byValue.entries()) {
  console.log(
    `  ${index + 1}. ${entry.car.brand} ${entry.car.model} ${entry.car.variant} — ${Math.round(entry.pricePerPoint)} €/ponto`,
  )
}
console.log("")

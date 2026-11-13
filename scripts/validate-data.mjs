import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const carsDir = path.join(root, "src/data/cars")
const equipmentFile = path.join(root, "src/data/equipment.ts")

const criteria = [
  { id: "interior", kind: "rubric", direction: "higher", scale: "absolute" },
  { id: "comfort", kind: "editorial", direction: "higher" },
  { id: "brand", kind: "rubric", direction: "higher", scale: "relative" },
  { id: "equipment", kind: "objective", direction: "higher" },
  { id: "boot", kind: "objective", direction: "higher" },
  { id: "sound", kind: "editorial", direction: "higher" },
  { id: "range", kind: "objective", direction: "higher" },
  { id: "powerToWeight", kind: "objective", direction: "higher" },
  { id: "efficiency", kind: "objective", direction: "lower" },
  { id: "charging", kind: "objective", direction: "higher" },
  { id: "satisfaction", kind: "rubric", direction: "higher", scale: "relative" },
]

// Mantém em sincronia com src/lib/interior.ts.
const interiorWeights = {
  softTouch: 0.4,
  upholstery: 0.25,
  design: 0.2,
  assembly: 0.15,
}
const hardPlasticPenalty = {
  low: 0,
  moderate: 0.5,
  high: 1,
  extensive: 1.8,
}
const hardPlasticCap = {
  low: 10,
  moderate: 10,
  high: 7,
  extensive: 5.5,
}
const hardPlasticLevels = Object.keys(hardPlasticPenalty)
const brandWeights = {
  globalBrandAge: 0.1,
  portugalMarketTenure: 0.2,
  portugalServiceNetwork: 0.2,
  europeanManufacturing: 0.15,
  establishedGroupSupport: 0.15,
  financialStability: 0.2,
}
const brandAssessmentFields = Object.keys(brandWeights)
const portugalFactoryBonus = 0.5
const satisfactionWeights = {
  ownerSentiment: 0.4,
  reportedDefects: 0.35,
  recallRecord: 0.25,
}
const satisfactionEvidenceCaps = {
  limited: { ownerSentiment: 7.5, reportedDefects: 6.5, recallRecord: 7 },
  moderate: { ownerSentiment: 9, reportedDefects: 8.5, recallRecord: 8.5 },
  broad: { ownerSentiment: 10, reportedDefects: 10, recallRecord: 10 },
}
const satisfactionEvidenceLevels = Object.keys(satisfactionEvidenceCaps)

function interiorScore(assessment) {
  const core =
    assessment.softTouch * interiorWeights.softTouch +
    assessment.upholstery * interiorWeights.upholstery +
    assessment.design * interiorWeights.design +
    assessment.assembly * interiorWeights.assembly
  const penalised = core - hardPlasticPenalty[assessment.hardPlastic]
  const capped = Math.min(penalised, hardPlasticCap[assessment.hardPlastic])
  return Math.round(Math.min(10, Math.max(0, capped)) * 100) / 100
}

function clamp(value) {
  return Math.min(10, Math.max(0, value))
}

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

  if (!(car.specs?.bootL > 0)) {
    errors.push(`${file}: specs.bootL tem de ser positivo`)
  }
  if (typeof car.specs?.frunkL !== "number" || car.specs.frunkL < 0) {
    errors.push(`${file}: specs.frunkL tem de ser um número igual ou superior a zero`)
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
    if (criterion.id === "interior") {
      const review = car.reviews.interior
      const assessment = review.assessment
      if (review.baseScore !== undefined) {
        errors.push(`${file}: "interior" usa assessment e não baseScore`)
      }
      if (!assessment || typeof assessment !== "object") {
        errors.push(`${file}: "interior" exige um objeto assessment`)
      } else {
        for (const key of ["softTouch", "upholstery", "design", "assembly"]) {
          const value = assessment[key]
          if (typeof value !== "number" || value < 0 || value > 10) {
            errors.push(`${file}: assessment.${key} tem de estar entre 0 e 10`)
          }
        }
        if (!hardPlasticLevels.includes(assessment.hardPlastic)) {
          errors.push(
            `${file}: assessment.hardPlastic tem de ser ${hardPlasticLevels.join(", ")}`,
          )
        }
      }
    }
    if (criterion.id === "brand") {
      const review = car.reviews.brand
      const assessment = review.assessment
      if (review.baseScore !== undefined) {
        errors.push(`${file}: "brand" usa assessment e não baseScore`)
      }
      if (!assessment || typeof assessment !== "object") {
        errors.push(`${file}: "brand" exige um objeto assessment`)
      } else {
        for (const key of brandAssessmentFields) {
          const value = assessment[key]
          if (typeof value !== "number" || value < 0 || value > 10) {
            errors.push(`${file}: assessment.${key} de "brand" tem de estar entre 0 e 10`)
          }
        }
        if (typeof assessment.portugalFactory !== "boolean") {
          errors.push(`${file}: assessment.portugalFactory de "brand" tem de ser boolean`)
        }
      }
    }
    if (criterion.id === "satisfaction") {
      const review = car.reviews.satisfaction
      const assessment = review.assessment
      if (review.baseScore !== undefined) {
        errors.push(`${file}: "satisfaction" usa assessment e não baseScore`)
      }
      if (!assessment || typeof assessment !== "object") {
        errors.push(`${file}: "satisfaction" exige um objeto assessment`)
      } else {
        for (const key of Object.keys(satisfactionWeights)) {
          const value = assessment[key]
          if (typeof value !== "number" || value < 0 || value > 10) {
            errors.push(`${file}: assessment.${key} de "satisfaction" tem de estar entre 0 e 10`)
          }
        }
        if (!satisfactionEvidenceLevels.includes(assessment.evidenceLevel)) {
          errors.push(
            `${file}: assessment.evidenceLevel de "satisfaction" tem de ser ${satisfactionEvidenceLevels.join(", ")}`,
          )
        }
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
    case "interior":
      return interiorScore(car.reviews.interior.assessment)
    case "brand": {
      const assessment = car.reviews.brand.assessment
      const weighted =
        assessment.globalBrandAge * brandWeights.globalBrandAge +
        assessment.portugalMarketTenure * brandWeights.portugalMarketTenure +
        assessment.portugalServiceNetwork * brandWeights.portugalServiceNetwork +
        assessment.europeanManufacturing * brandWeights.europeanManufacturing +
        assessment.establishedGroupSupport * brandWeights.establishedGroupSupport +
        assessment.financialStability * brandWeights.financialStability
      return Math.round(
        clamp(weighted + (assessment.portugalFactory ? portugalFactoryBonus : 0)) * 100,
      ) / 100
    }
    case "satisfaction": {
      const assessment = car.reviews.satisfaction.assessment
      const caps = satisfactionEvidenceCaps[assessment.evidenceLevel]
      const ownerSentiment = Math.min(assessment.ownerSentiment, caps.ownerSentiment)
      const reportedDefects = Math.min(assessment.reportedDefects, caps.reportedDefects)
      const recallRecord = Math.min(assessment.recallRecord, caps.recallRecord)
      const weighted =
        ownerSentiment * satisfactionWeights.ownerSentiment +
        reportedDefects * satisfactionWeights.reportedDefects +
        recallRecord * satisfactionWeights.recallRecord
      return Math.round(clamp(weighted) * 100) / 100
    }
    case "equipment":
      return car.equipmentIncluded.filter((id) => equipmentIds.includes(id)).length
    case "boot":
      return car.specs.bootL + car.specs.frunkL
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
    const value = metric(car, criterion.id)
    if (criterion.scale === "absolute") {
      total += clamp(value)
      continue
    }
    const values = cars.map(({ data }) => metric(data, criterion.id))
    const best =
      criterion.direction === "higher"
        ? Math.max(...values)
        : Math.min(...values)
    total += clamp(
      criterion.direction === "higher" ? (value / best) * 10 : (best / value) * 10,
    )
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

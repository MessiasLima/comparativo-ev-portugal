import { CARS } from "@/data/cars"
import { CRITERIA, CRITERIA_BY_ID } from "@/data/criteria"
import { EQUIPMENT_CHECKLIST } from "@/data/equipment"
import { SITE_UPDATED_AT } from "@/data/site"
import type {
  Car,
  CriterionDefinition,
  CriterionId,
  EditorialReview,
} from "@/data/types"
import { formatDecimal, formatScore } from "@/lib/format"
import {
  HARD_PLASTIC_LABELS,
  interiorScore,
} from "@/lib/interior"
import { brandScore } from "@/lib/brand"
import { satisfactionScore } from "@/lib/satisfaction"

export interface CriterionScore {
  criterion: CriterionDefinition
  score: number
  rawValue: number
  rawLabel: string
  bestRawValue: number
  rank: number
  review: EditorialReview
}

export interface ScoredCar {
  car: Car
  equipmentCount: number
  criteria: Record<CriterionId, CriterionScore>
  total: number
  rank: number
  pricePerPoint: number
  pointsPer10k: number
  valueRank: number
}

export interface Comparison {
  cars: ScoredCar[]
  byValue: ScoredCar[]
  winner: ScoredCar
  bestValue: ScoredCar
  updatedAt: string
}

function equipmentCount(car: Car): number {
  const unique = new Set(car.equipmentIncluded)
  return EQUIPMENT_CHECKLIST.filter((item) => unique.has(item.id)).length
}

function metricValue(car: Car, criterionId: CriterionId): number {
  switch (criterionId) {
    case "interior": {
      const assessment = car.reviews.interior.assessment
      return assessment && "hardPlastic" in assessment
        ? interiorScore(assessment)
        : 0
    }
    case "brand": {
      const assessment = car.reviews.brand.assessment
      return assessment && "globalBrandAge" in assessment
        ? brandScore(assessment)
        : 0
    }
    case "satisfaction": {
      const assessment = car.reviews.satisfaction.assessment
      return assessment && "ownerSentiment" in assessment
        ? satisfactionScore(assessment)
        : 0
    }
    case "equipment":
      return equipmentCount(car)
    case "range":
      return car.specs.rangeKm
    case "powerToWeight":
      return car.specs.powerHp / car.specs.weightKg
    case "efficiency":
      return car.specs.consumptionKwh100
    case "charging":
      return car.charging.dcKw * 0.7 + car.charging.acKw * 0.3
    default:
      return car.reviews[criterionId].baseScore ?? 0
  }
}

function rawLabel(car: Car, criterionId: CriterionId): string {
  switch (criterionId) {
    case "interior": {
      const assessment = car.reviews.interior.assessment
      if (!assessment || !("hardPlastic" in assessment)) {
        return "Rubrica de acabamento em falta"
      }
      return `Rubrica ${formatScore(interiorScore(assessment))}/10 · ${HARD_PLASTIC_LABELS[assessment.hardPlastic]}`
    }
    case "brand": {
      const assessment = car.reviews.brand.assessment
      return assessment && "globalBrandAge" in assessment
        ? `Rubrica ${formatScore(brandScore(assessment))}/10`
        : "Rubrica de marca em falta"
    }
    case "satisfaction": {
      const assessment = car.reviews.satisfaction.assessment
      return assessment && "ownerSentiment" in assessment
        ? `Rubrica ${formatScore(satisfactionScore(assessment))}/10`
        : "Rubrica de satisfação em falta"
    }
    case "equipment":
      return `${equipmentCount(car)}/${EQUIPMENT_CHECKLIST.length} equipamentos`
    case "range":
      return `${car.specs.rangeKm} km WLTP`
    case "powerToWeight":
      return `${Math.round((car.specs.powerHp / car.specs.weightKg) * 1000)} cv/t`
    case "efficiency":
      return `${formatDecimal(car.specs.consumptionKwh100)} kWh/100 km`
    case "charging":
      return `${car.charging.dcKw} kW DC · ${car.charging.acKw} kW AC`
    default:
      return `Avaliação editorial ${formatScore(car.reviews[criterionId].baseScore ?? 0)}/10`
  }
}

function clampScore(value: number): number {
  return Math.min(10, Math.max(0, value))
}

function rankValues(values: number[], higherIsBetter: boolean): number[] {
  const sorted = [...values].sort((a, b) => (higherIsBetter ? b - a : a - b))
  return values.map((value) => {
    const index = sorted.findIndex((candidate) => Math.abs(candidate - value) < 0.000001)
    return index + 1
  })
}

function rankTotals(cars: ScoredCar[]): void {
  const sorted = [...cars].sort((a, b) => b.total - a.total)
  let rank = 1
  sorted.forEach((car, index) => {
    if (index > 0 && sorted[index - 1].total - car.total > 0.000001) {
      rank = index + 1
    }
    car.rank = rank
  })
}

function rankValue(cars: ScoredCar[]): void {
  const sorted = [...cars].sort((a, b) => a.pricePerPoint - b.pricePerPoint)
  let rank = 1
  sorted.forEach((car, index) => {
    if (index > 0 && car.pricePerPoint - sorted[index - 1].pricePerPoint > 0.000001) {
      rank = index + 1
    }
    car.valueRank = rank
  })
}

export function getComparison(): Comparison {
  const baseCars = CARS.map((car) => ({
    car,
    equipmentCount: equipmentCount(car),
  }))

  const metricsByCriterion = new Map<CriterionId, number[]>()
  for (const criterion of CRITERIA) {
    metricsByCriterion.set(
      criterion.id,
      baseCars.map(({ car }) => metricValue(car, criterion.id)),
    )
  }

  const scoredCars: ScoredCar[] = baseCars.map(({ car, equipmentCount: count }) => {
    const criteria = {} as Record<CriterionId, CriterionScore>

    for (const criterion of CRITERIA) {
      const metrics = metricsByCriterion.get(criterion.id) ?? []
      const value = metricValue(car, criterion.id)

      if (criterion.scale === "absolute") {
        criteria[criterion.id] = {
          criterion,
          score: clampScore(value),
          rawValue: value,
          rawLabel: rawLabel(car, criterion.id),
          bestRawValue: Math.max(...metrics),
          rank: 1,
          review: car.reviews[criterion.id],
        }
        continue
      }

      const best = criterion.direction === "higher" ? Math.max(...metrics) : Math.min(...metrics)
      const score =
        best <= 0
          ? 0
          : clampScore(
              criterion.direction === "higher"
                ? (value / best) * 10
                : (best / value) * 10,
            )

      criteria[criterion.id] = {
        criterion,
        score,
        rawValue: value,
        rawLabel: rawLabel(car, criterion.id),
        bestRawValue: best,
        rank: 1,
        review: car.reviews[criterion.id],
      }
    }

    for (const criterion of CRITERIA) {
      const metrics = baseCars.map(({ car: item }) => metricValue(item, criterion.id))
      const ranks = rankValues(metrics, criterion.direction === "higher")
      criteria[criterion.id].rank = ranks[baseCars.findIndex((item) => item.car.id === car.id)]
    }

    const weightSum = CRITERIA.reduce((sum, criterion) => sum + criterion.weight, 0)
    const weightedSum = CRITERIA.reduce(
      (sum, criterion) => sum + criteria[criterion.id].score * criterion.weight,
      0,
    )
    const total = weightedSum / weightSum

    return {
      car,
      equipmentCount: count,
      criteria,
      total,
      rank: 1,
      pricePerPoint: car.price.amount / total,
      pointsPer10k: total / (car.price.amount / 10_000),
      valueRank: 1,
    }
  })

  rankTotals(scoredCars)
  rankValue(scoredCars)

  const cars = [...scoredCars].sort((a, b) => a.rank - b.rank)
  const byValue = [...scoredCars].sort((a, b) => a.valueRank - b.valueRank)

  return {
    cars,
    byValue,
    winner: cars[0],
    bestValue: byValue[0],
    updatedAt: SITE_UPDATED_AT,
  }
}

export function getScoredCar(slug: string): ScoredCar | undefined {
  return getComparison().cars.find((entry) => entry.car.slug === slug)
}

export function getCriterion(criterionId: CriterionId) {
  return CRITERIA_BY_ID[criterionId]
}

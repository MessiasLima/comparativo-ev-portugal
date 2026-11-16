import { CRITERIA } from "@/data/criteria"
import type { CriterionId } from "@/data/types"

export const WEIGHTS_STORAGE_KEY = "comparativo-ev-portugal:weights:v2"
export const DEFAULT_WEIGHT = 1

export interface WeightLevel {
  value: number
  label: string
}

/** Únicos pesos que o utilizador pode escolher, do menos ao mais importante. */
export const WEIGHT_LEVELS: WeightLevel[] = [
  { value: 0, label: "Não me importa" },
  { value: 0.5, label: "Importa-me pouco" },
  { value: 1, label: "Importa-me moderadamente" },
  { value: 2, label: "Importa-me muito" },
  { value: 3, label: "Extremamente importante. Indispensável" },
]

export type WeightMap = Record<CriterionId, number>

export const CRITERION_IDS = CRITERIA.map((criterion) => criterion.id)

export const DEFAULT_WEIGHTS = Object.fromEntries(
  CRITERION_IDS.map((id) => [id, DEFAULT_WEIGHT]),
) as WeightMap

/**
 * Aproxima um peso ao nível mais próximo. Converte os pesos guardados com o
 * slider antigo (0 a 2, passo 0.1) sem perder a personalização.
 */
export function snapWeight(value: number): number {
  return WEIGHT_LEVELS.reduce((closest, level) =>
    Math.abs(level.value - value) < Math.abs(closest.value - value)
      ? level
      : closest,
  ).value
}

export function loadWeights(): WeightMap {
  if (typeof window === "undefined") {
    return { ...DEFAULT_WEIGHTS }
  }

  try {
    const raw = window.localStorage.getItem(WEIGHTS_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_WEIGHTS }

    const parsed = JSON.parse(raw) as Partial<Record<string, unknown>>
    const weights = { ...DEFAULT_WEIGHTS }

    for (const id of CRITERION_IDS) {
      const value = parsed?.[id]
      if (typeof value === "number" && Number.isFinite(value)) {
        weights[id] = snapWeight(value)
      }
    }

    return weights
  } catch {
    return { ...DEFAULT_WEIGHTS }
  }
}

export function saveWeights(weights: WeightMap): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(WEIGHTS_STORAGE_KEY, JSON.stringify(weights))
  } catch {
    // Storage may be blocked or full; the ranking still works for this session.
  }
}

// Cada peso é um multiplicador da nota do critério (um dos WEIGHT_LEVELS):
// 1 mantém o peso base, 3 triplica-o e 0 anula o critério. A média ponderada normaliza pela
// soma dos multiplicadores, pelo que com todos a 1 resulta na média simples.
export function weightedAverage(
  scores: Record<CriterionId, number>,
  weights: WeightMap,
): number {
  const totalWeight = CRITERION_IDS.reduce(
    (sum, criterionId) => sum + weights[criterionId],
    0,
  )

  if (totalWeight <= 0) return 0

  return (
    CRITERION_IDS.reduce(
      (sum, criterionId) => sum + scores[criterionId] * weights[criterionId],
      0,
    ) / totalWeight
  )
}

export function isDefaultWeights(weights: WeightMap): boolean {
  return CRITERION_IDS.every(
    (criterionId) => weights[criterionId] === DEFAULT_WEIGHT,
  )
}

let cachedWeights: WeightMap | null = null
const listeners = new Set<() => void>()

export function subscribeWeights(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getWeightsSnapshot(): WeightMap {
  if (!cachedWeights) {
    cachedWeights = loadWeights()
  }
  return cachedWeights
}

export function getServerWeightsSnapshot(): WeightMap {
  return DEFAULT_WEIGHTS
}

export function setWeightsStore(weights: WeightMap): void {
  cachedWeights = weights
  saveWeights(weights)
  listeners.forEach((listener) => listener())
}

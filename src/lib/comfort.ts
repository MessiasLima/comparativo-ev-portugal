import type { ComfortAssessment } from "@/data/types"

/**
 * Rubrica de conforto geral.
 *
 * Avaliação absoluta com 4 dimensões ponderadas:
 * 1. Suspensão e piso (30%): capacidade de absorver buracos, juntas e irregularidades
 *    em ambiente urbano e compostura em autoestrada.
 * 2. Bancos e ergonomia (30%): conformação anatómica, densidade da espuma, apoio
 *    lombar/lateral e ausência de fadiga em tiradas longas.
 * 3. Insonorização (30%): isolamento face ao ruído de rolamento dos pneus, ruído
 *    aerodinâmico e tráfego, valorizando vidros acústicos laminados duplos.
 * 4. Aceleração e regeneração (10%): linearidade da entrega motora e modulação da
 *    desaceleração regenerativa (one-pedal), sem solavancos nem sacudidelas para os ocupantes.
 */
export const COMFORT_WEIGHTS = {
  suspension: 0.3,
  seats: 0.3,
  acoustics: 0.3,
  drivetrainCalibration: 0.1,
} as const

export const COMFORT_COMPONENTS = [
  {
    key: "suspension" as const,
    label: "Suspensão e piso",
    weight: COMFORT_WEIGHTS.suspension,
    description:
      "Capacidade de absorção de buracos, juntas e irregularidades na via em ambiente urbano e compostura em autoestrada.",
  },
  {
    key: "seats" as const,
    label: "Bancos e ergonomia",
    weight: COMFORT_WEIGHTS.seats,
    description:
      "Ergonomia do assento, densidade e sustentação da espuma, apoio lombar/lateral e prevenção de dores ou fadiga em tiradas longas.",
  },
  {
    key: "acoustics" as const,
    label: "Insonorização",
    weight: COMFORT_WEIGHTS.acoustics,
    description:
      "Isolamento acústico face ao ruído de rolamento, vento e tráfego, valorizando a presença de vidros acústicos laminados duplos.",
  },
  {
    key: "drivetrainCalibration" as const,
    label: "Aceleração e regeneração",
    weight: COMFORT_WEIGHTS.drivetrainCalibration,
    description:
      "Linearidade na entrega de potência e suavidade da travagem regenerativa, sem solavancos nem sacudidelas desconfortáveis para os ocupantes.",
  },
] as const

function clamp(value: number): number {
  return Math.min(10, Math.max(0, value))
}

export function comfortScore(assessment: ComfortAssessment): number {
  const weighted =
    assessment.suspension * COMFORT_WEIGHTS.suspension +
    assessment.seats * COMFORT_WEIGHTS.seats +
    assessment.acoustics * COMFORT_WEIGHTS.acoustics +
    assessment.drivetrainCalibration * COMFORT_WEIGHTS.drivetrainCalibration

  return Math.round(clamp(weighted) * 100) / 100
}

export function isComfortAssessment(value: unknown): value is ComfortAssessment {
  if (!value || typeof value !== "object") return false
  const a = value as Record<string, unknown>
  for (const key of Object.keys(COMFORT_WEIGHTS)) {
    const v = a[key]
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 10) {
      return false
    }
  }
  return true
}

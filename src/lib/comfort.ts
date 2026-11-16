import type {
  Car,
  ComfortAssessment,
  DamperType,
  SuspensionBasis,
  SuspensionProtocol,
} from "@/data/types"

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

/**
 * Nota de suspensão numa escala única.
 *
 * Todas as referências são convertidas para a nota Federung do ADAC no protocolo de 2019
 * (1 = melhor), na configuração amortecedores passivos + jantes da versão avaliada:
 * - Protocolo: o ADAC de 2026 é mais severo. As duas pontes disponíveis dão +0,6
 *   (Model 3: 2,5 em 19" no teste de 2024 → 3,0 em 18" no de 2026) e +0,1 (Model Y:
 *   Premium de 20" com 2,8 em 2025 → Standard de 18" com 2,8 em 2026, que o ADAC diz
 *   quase não perder para o Premium); usa-se a média, +0,35.
 * - Amortecedores: dependentes da frequência valem -0,1 face aos passivos (Model 3
 *   Premium 3,0 vs Standard 3,1 no mesmo protocolo); adaptativos valem -0,4.
 * - Jantes: +0,1 por polegada acima da referência.
 * Com várias referências usa-se a média. A nota final converte-se em pontos com
 * 2,3 → 7,4 e 1,25 pontos por unidade de nota.
 */
export const SUSPENSION_PROTOCOL_OFFSET: Record<SuspensionProtocol, number> = {
  "adac-2019": 0,
  "adac-2026": 0.35,
  estimate: 0,
}

export const DAMPER_GRADE: Record<DamperType, number> = {
  passive: 0,
  "frequency-selective": -0.1,
  adaptive: -0.4,
}

export const WHEEL_GRADE_PER_INCH = 0.1
export const MAX_SUSPENSION_ADJUSTMENT = 0.3

const ANCHOR_GRADE = 2.3
const ANCHOR_SCORE = 7.4
const POINTS_PER_GRADE = 1.25

/** Peso do equipamento na nota: quanto menor, mais confortável. */
export function suspensionHardwareGrade(chassis: { dampers: DamperType; wheelInches: number }): number {
  return DAMPER_GRADE[chassis.dampers] + chassis.wheelInches * WHEEL_GRADE_PER_INCH
}

/** Nota Federung equivalente (protocolo ADAC 2019) para a configuração avaliada. */
export function suspensionGrade(basis: SuspensionBasis): number {
  const target = suspensionHardwareGrade(basis)
  const grades = basis.references.map(
    (reference) =>
      reference.federung -
      SUSPENSION_PROTOCOL_OFFSET[reference.protocol] -
      suspensionHardwareGrade(reference) +
      target,
  )
  const mean = grades.reduce((sum, grade) => sum + grade, 0) / grades.length
  return mean + (basis.adjustment ?? 0)
}

export function suspensionScore(basis: SuspensionBasis): number {
  const score = ANCHOR_SCORE - (suspensionGrade(basis) - ANCHOR_GRADE) * POINTS_PER_GRADE
  return Math.round(clamp(score) * 10 + 1e-9) / 10
}

/** Preenche `assessment.suspension` a partir de `suspensionBasis`. */
export function withSuspensionScore(car: Car): Car {
  const comfort = car.reviews.comfort
  if (!comfort.suspensionBasis) return car
  return {
    ...car,
    reviews: {
      ...car.reviews,
      comfort: {
        ...comfort,
        assessment: {
          ...(comfort.assessment as ComfortAssessment),
          suspension: suspensionScore(comfort.suspensionBasis),
        },
      },
    },
  }
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

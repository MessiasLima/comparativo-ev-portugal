import type {
  HardPlasticLevel,
  InteriorAssessment,
} from "@/data/types"

/**
 * Rubrica do acabamento interno.
 *
 * A nota de acabamento não é uma proporção face ao melhor carro da lista: é
 * absoluta. Um interior maioritariamente em plástico duro não pode chegar perto
 * do topo só porque os rivais são ainda piores. A fórmula tem três passos:
 *
 * 1. Núcleo ponderado — o que o ocupante vê e toca:
 *    superfícies macias 40%, estofos/couro 25%, design 20%, montagem 15%.
 * 2. Penalização por plástico duro — desconto direto na nota, tanto maior
 *    quanto a proporção de plástico duro em zonas visíveis/ao toque.
 * 3. Teto por plástico duro — um interior com plástico duro frequente ou
 *    dominante não passa de 7,0 ou 5,5, respetivamente, mesmo que o resto seja
 *    bom. É o que impede notas de 9 em cabines plásticas.
 *
 * O design é avaliado pela contenção: linhas coerentes, materiais nobres e
 * detalhes discretos somam; exibicionismo, contrastes forçados e decoração
 * gratuita descem a nota.
 */
export const INTERIOR_WEIGHTS = {
  softTouch: 0.4,
  upholstery: 0.25,
  design: 0.2,
  assembly: 0.15,
} as const

export const HARD_PLASTIC_PENALTY: Record<HardPlasticLevel, number> = {
  low: 0,
  moderate: 0.5,
  high: 1,
  extensive: 1.8,
}

export const HARD_PLASTIC_CAP: Record<HardPlasticLevel, number> = {
  low: 10,
  moderate: 10,
  high: 7,
  extensive: 5.5,
}

export const HARD_PLASTIC_LABELS: Record<HardPlasticLevel, string> = {
  low: "pouco plástico duro",
  moderate: "plástico duro moderado",
  high: "plástico duro frequente",
  extensive: "plástico duro dominante",
}

export const HARD_PLASTIC_LEVELS = Object.keys(
  HARD_PLASTIC_LABELS,
) as HardPlasticLevel[]

export const INTERIOR_COMPONENTS = [
  {
    key: "softTouch",
    label: "Superfícies macias",
    weight: INTERIOR_WEIGHTS.softTouch,
    description:
      "Cobertura e qualidade de soft-touch nas zonas de contacto: topo do tablier, painéis de porta, apoios de braço e consola.",
  },
  {
    key: "upholstery",
    label: "Estofos e couro",
    weight: INTERIOR_WEIGHTS.upholstery,
    description:
      "Couro ou alternativas de qualidade, costuras, volante e bancos. PVC fino vale menos do que couro; tecido simples vale menos ainda.",
  },
  {
    key: "design",
    label: "Design interior",
    weight: INTERIOR_WEIGHTS.design,
    description:
      "Sofisticação contida e coerente. Linhas, iluminação e detalhes discretos somam; extravagância e decoração forçada descem a nota.",
  },
  {
    key: "assembly",
    label: "Montagem",
    weight: INTERIOR_WEIGHTS.assembly,
    description:
      "Solidez, alinhamento de painéis, ruídos parasitas e sensação de robustez ao longo do tempo.",
  },
] as const

function clamp(value: number): number {
  return Math.min(10, Math.max(0, value))
}

export function interiorScore(assessment: InteriorAssessment): number {
  const core =
    assessment.softTouch * INTERIOR_WEIGHTS.softTouch +
    assessment.upholstery * INTERIOR_WEIGHTS.upholstery +
    assessment.design * INTERIOR_WEIGHTS.design +
    assessment.assembly * INTERIOR_WEIGHTS.assembly

  const penalised = core - HARD_PLASTIC_PENALTY[assessment.hardPlastic]
  const capped = Math.min(penalised, HARD_PLASTIC_CAP[assessment.hardPlastic])

  return Math.round(clamp(capped) * 100) / 100
}

export function isValidInteriorAssessment(value: unknown): value is InteriorAssessment {
  if (!value || typeof value !== "object") return false
  const assessment = value as Record<string, unknown>
  const scores = ["softTouch", "upholstery", "design", "assembly"]
  if (
    !scores.every(
      (key) =>
        typeof assessment[key] === "number" &&
        Number.isFinite(assessment[key]) &&
        (assessment[key] as number) >= 0 &&
        (assessment[key] as number) <= 10,
    )
  ) {
    return false
  }
  return HARD_PLASTIC_LEVELS.includes(assessment.hardPlastic as HardPlasticLevel)
}

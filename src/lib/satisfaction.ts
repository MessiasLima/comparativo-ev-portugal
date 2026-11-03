import type {
  SatisfactionAssessment,
  SatisfactionEvidenceLevel,
} from "@/data/types"

export const SATISFACTION_WEIGHTS = {
  ownerSentiment: 0.4,
  reportedDefects: 0.35,
  recallRecord: 0.25,
} as const

export const SATISFACTION_EVIDENCE_CAPS: Record<
  SatisfactionEvidenceLevel,
  Record<keyof typeof SATISFACTION_WEIGHTS, number>
> = {
  limited: { ownerSentiment: 7.5, reportedDefects: 6.5, recallRecord: 7 },
  moderate: { ownerSentiment: 9, reportedDefects: 8.5, recallRecord: 8.5 },
  broad: { ownerSentiment: 10, reportedDefects: 10, recallRecord: 10 },
}

export const SATISFACTION_EVIDENCE_LABELS: Record<
  SatisfactionEvidenceLevel,
  string
> = {
  limited: "limitada",
  moderate: "moderada",
  broad: "ampla",
}

export const SATISFACTION_COMPONENTS = [
  {
    key: "ownerSentiment",
    label: "Satisfação dos proprietários",
    weight: SATISFACTION_WEIGHTS.ownerSentiment,
    description:
      "Síntese de relatos de proprietários, inquéritos independentes e testes de longa duração. Separe opiniões sobre o modelo das avaliações da marca inteira.",
  },
  {
    key: "reportedDefects",
    label: "Defeitos e reclamações recorrentes",
    weight: SATISFACTION_WEIGHTS.reportedDefects,
    description:
      "Pondere a recorrência, gravidade e confirmação independente de problemas reportados por proprietários. Não trate o total de publicações como taxa sem denominador de veículos e quilometragem.",
  },
  {
    key: "recallRecord",
    label: "Recalls de segurança",
    weight: SATISFACTION_WEIGHTS.recallRecord,
    description:
      "Considere campanhas de segurança específicas do modelo, gravidade, dimensão conhecida e resolução. Distinga recalls de campanhas de serviço; a aplicabilidade individual pode depender do VIN.",
  },
] as const

function clamp(value: number): number {
  return Math.min(10, Math.max(0, value))
}

export function satisfactionComponentScores(
  assessment: SatisfactionAssessment,
): Record<keyof typeof SATISFACTION_WEIGHTS, number> {
  const caps = SATISFACTION_EVIDENCE_CAPS[assessment.evidenceLevel]
  return {
    ownerSentiment: Math.min(assessment.ownerSentiment, caps.ownerSentiment),
    reportedDefects: Math.min(assessment.reportedDefects, caps.reportedDefects),
    recallRecord: Math.min(assessment.recallRecord, caps.recallRecord),
  }
}

export function satisfactionScore(assessment: SatisfactionAssessment): number {
  const components = satisfactionComponentScores(assessment)
  const weighted =
    components.ownerSentiment * SATISFACTION_WEIGHTS.ownerSentiment +
    components.reportedDefects * SATISFACTION_WEIGHTS.reportedDefects +
    components.recallRecord * SATISFACTION_WEIGHTS.recallRecord

  return Math.round(clamp(weighted) * 100) / 100
}

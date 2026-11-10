import type { BrandAssessment } from "@/data/types"

export const BRAND_WEIGHTS = {
  globalBrandAge: 0.1,
  portugalMarketTenure: 0.2,
  portugalServiceNetwork: 0.2,
  europeanManufacturing: 0.15,
  establishedGroupSupport: 0.15,
  financialStability: 0.2,
} as const

export const PORTUGAL_FACTORY_BONUS = 0.5

export const BRAND_COMPONENTS = [
  {
    key: "globalBrandAge",
    label: "Idade global da marca",
    weight: BRAND_WEIGHTS.globalBrandAge,
    description:
      "Meça desde o lançamento da marca como fabricante automóvel autónomo, não desde a fundação do grupo ou de um antecessor. Escala 0–10: menos de 2 anos (0–2), 2–5 (3–4), 6–10 (5–6), 11–20 (7–8) e mais de 20 anos (9–10).",
  },
  {
    key: "portugalMarketTenure",
    label: "Presença contínua em Portugal",
    weight: BRAND_WEIGHTS.portugalMarketTenure,
    description:
      "Conte os anos da atual presença oficial e ininterrupta da própria marca em Portugal, a partir do início de vendas/importação oficial; uma saída formal seguida de reentrada reinicia o período. Não conte a idade do grupo nem importações paralelas. Escala 0–10: menos de 2 anos (0–2), 2–5 (3–4), 6–10 (5–6), 11–20 (7–8) e mais de 20 anos (9–10).",
  },
  {
    key: "portugalServiceNetwork",
    label: "Rede de assistência em Portugal",
    weight: BRAND_WEIGHTS.portugalServiceNetwork,
    description:
      "Escala 0–10: 0 sem assistência autorizada confirmada; 2 um ponto isolado; 4 rede muito escassa; 6 cobertura por algumas regiões ou parceiros; 8 boa cobertura nacional, ainda com lacunas; 10 rede ampla, distribuída pelo país e com oficinas autorizadas. Conte oficinas/reparadores, não pontos de venda sem serviço.",
  },
  {
    key: "europeanManufacturing",
    label: "Fabrico automóvel na Europa",
    weight: BRAND_WEIGHTS.europeanManufacturing,
    description:
      "Escala 0–10: 0 sem produção europeia; 2 plano futuro anunciado; 4 fábrica em construção/equipamento; 6 produção-piloto; 8 produção em série num local europeu; 10 produção em série em vários locais ou capacidade europeia relevante. Conte apenas instalações que produzem automóveis da marca, não qualquer fábrica do grupo. O bónus português é independente: só conta uma fábrica em Portugal que produza ou monte automóveis desta marca em fase-piloto ou série; a fábrica do grupo que produz outra marca não conta.",
  },
  {
    key: "establishedGroupSupport",
    label: "Apoio de grupo ou fabricante",
    weight: BRAND_WEIGHTS.establishedGroupSupport,
    description:
      "Escala 0–10: avalie formalidade e profundidade do apoio em engenharia, assistência, peças e recursos — desde ausência de apoio claro (0–2), parceria limitada (3–5), até pertença/integração relevante num grupo automóvel estabelecido (8–10). Um fabricante independente de grande escala e integração vertical também pode pontuar bem; não o penalize apenas por não ter uma aliança externa.",
  },
  {
    key: "financialStability",
    label: "Estabilidade financeira",
    weight: BRAND_WEIGHTS.financialStability,
    description:
      "Avalie a tendência das vendas e dos resultados, rentabilidade, geração de caixa, dívida/liquidez e perspetivas. Escala 0–2: risco grave/deterioração; 3–4: situação fraca; 5–6: sinais mistos; 7–8: estabilidade demonstrada; 9–10: solidez consistente. Resultados publicados pesam mais do que previsões. Se não houver contas da marca, identifique o segmento/grupo usado como proxy; a falta de divulgação, por si só, não é prova de fragilidade.",
  },
] as const

function clamp(value: number): number {
  return Math.min(10, Math.max(0, value))
}

export function brandScore(assessment: BrandAssessment): number {
  const weighted =
    assessment.globalBrandAge * BRAND_WEIGHTS.globalBrandAge +
    assessment.portugalMarketTenure * BRAND_WEIGHTS.portugalMarketTenure +
    assessment.portugalServiceNetwork * BRAND_WEIGHTS.portugalServiceNetwork +
    assessment.europeanManufacturing * BRAND_WEIGHTS.europeanManufacturing +
    assessment.establishedGroupSupport * BRAND_WEIGHTS.establishedGroupSupport +
    assessment.financialStability * BRAND_WEIGHTS.financialStability

  return Math.round(
    clamp(weighted + (assessment.portugalFactory ? PORTUGAL_FACTORY_BONUS : 0)) *
      100,
  ) / 100
}

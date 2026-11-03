import type { BrandAssessment } from "@/data/types"

export const BRAND_WEIGHTS = {
  automotiveExperience: 0.3,
  portugalServiceNetwork: 0.3,
  europeanManufacturing: 0.25,
  establishedGroupSupport: 0.15,
} as const

export const PORTUGAL_FACTORY_BONUS = 0.5

export const BRAND_COMPONENTS = [
  {
    key: "automotiveExperience",
    label: "Experiência automóvel da marca",
    weight: BRAND_WEIGHTS.automotiveExperience,
    description:
      "Escala 0–10: 0–2 para marcas muito recentes sem legado automóvel relevante; 3–4 para 5–10 anos como marca autónoma; 5–6 para mais experiência ou uma linhagem técnica clara; 7–8 para mais de 20 anos de atividade automóvel; 9–10 para décadas de produção contínua e experiência ampla. Registe separadamente a idade da marca e a do grupo.",
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
      "Escala 0–10: 0 sem produção europeia; 2 plano futuro anunciado; 4 fábrica em construção/equipamento; 6 produção-piloto; 8 produção em série num local europeu; 10 produção em série em vários locais ou capacidade europeia relevante. Conte instalações que produzem automóveis da marca, não qualquer fábrica do grupo. Uma fábrica em Portugal acrescenta 0,5 pontos ao resultado final, até ao máximo de 10.",
  },
  {
    key: "establishedGroupSupport",
    label: "Apoio de grupo ou fabricante",
    weight: BRAND_WEIGHTS.establishedGroupSupport,
    description:
      "Escala 0–10: avalie formalidade e profundidade do apoio em engenharia, assistência, peças e recursos — desde ausência de apoio claro (0–2), parceria limitada (3–5), até pertença/integração relevante num grupo automóvel estabelecido (8–10). Um fabricante independente de grande escala e integração vertical também pode pontuar bem; não o penalize apenas por não ter uma aliança externa.",
  },
] as const

function clamp(value: number): number {
  return Math.min(10, Math.max(0, value))
}

export function brandScore(assessment: BrandAssessment): number {
  const weighted =
    assessment.automotiveExperience * BRAND_WEIGHTS.automotiveExperience +
    assessment.portugalServiceNetwork * BRAND_WEIGHTS.portugalServiceNetwork +
    assessment.europeanManufacturing * BRAND_WEIGHTS.europeanManufacturing +
    assessment.establishedGroupSupport * BRAND_WEIGHTS.establishedGroupSupport

  return Math.round(
    clamp(weighted + (assessment.portugalFactory ? PORTUGAL_FACTORY_BONUS : 0)) *
      100,
  ) / 100
}

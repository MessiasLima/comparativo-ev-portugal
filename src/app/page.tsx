import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react"
import { Methodology } from "@/components/methodology"
import { RankingTable } from "@/components/ranking-table"
import { JsonLd } from "@/components/structured-data"
import type { ComparisonRow } from "@/components/ranking-table"
import { CRITERIA } from "@/data/criteria"
import type { CriterionId } from "@/data/types"
import { formatCarName, formatDatePt } from "@/lib/format"
import { getComparison } from "@/lib/scoring"
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
} from "@/lib/site-url"

function SectionHeading({
  index,
  eyebrow,
  title,
  description,
}: {
  index: string
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="mb-9 grid gap-5 sm:mb-12 lg:grid-cols-[0.19fr_0.81fr]">
      <div className="flex items-start gap-3 pt-1">
        <span className="font-mono text-xs text-copper">{index}</span>
        <span className="h-px w-7 bg-copper/50 sm:mt-2" />
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {eyebrow}
        </span>
      </div>
      <div className="max-w-3xl">
        <h2 className="font-heading text-3xl leading-[1.02] font-semibold tracking-[-0.035em] sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}

export default function HomePage() {
  const comparison = getComparison()
  const rankingRows: ComparisonRow[] = comparison.cars.map((entry) => ({
    id: entry.car.id,
    slug: entry.car.slug,
    brand: entry.car.brand,
    model: entry.car.model,
    variant: entry.car.variant,
    version: entry.car.version,
    accent: entry.car.accent,
    price: entry.car.price.amount,
    scores: Object.fromEntries(
      CRITERIA.map((criterion) => [
        criterion.id,
        entry.criteria[criterion.id].score,
      ]),
    ) as Record<CriterionId, number>,
  }))

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": `${absoluteUrl("/")}#website`,
              url: absoluteUrl("/"),
              name: SITE_NAME,
              description: SITE_DESCRIPTION,
              inLanguage: "pt-PT",
            },
            {
              "@type": "ItemList",
              "@id": `${absoluteUrl("/")}#ranking`,
              name: "Ranking de carros elétricos em Portugal",
              description: `Ranking calculado a partir de ${CRITERIA.length} critérios: ${CRITERIA.map(
                (criterion) =>
                  criterion.label.charAt(0).toLowerCase() + criterion.label.slice(1),
              ).join(", ")}.`,
              numberOfItems: comparison.cars.length,
              itemListOrder: "https://schema.org/ItemListOrderAscending",
              itemListElement: comparison.cars.map((entry, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: formatCarName(entry.car),
                url: absoluteUrl(`/carros/${entry.car.slug}/`),
              })),
            },
          ],
        }}
      />
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pt-9 pb-9 sm:px-8 sm:pt-12 sm:pb-10">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 rounded-full border border-lime/25 bg-lime/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-lime">
                <Sparkles className="size-3.5" />
                Comparador independente
              </span>
              <span className="text-xs uppercase tracking-[0.16em] text-white/45">
                Mercado português
              </span>
            </div>

            <h1 className="mt-4 max-w-3xl font-heading text-5xl leading-[0.92] font-semibold tracking-[-0.06em] sm:text-6xl lg:text-7xl">
              Comparativo <span className="text-lime">EV</span>
              <br />
              <span className="text-white/50">Portugal</span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-white/60">
              {CRITERIA.length} critérios. Dossiês completos. O custo real de cada
              ponto — para escolher com números, não com slogans.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="#ranking"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-lime px-5 text-sm font-medium text-ink transition-colors hover:bg-lime/85"
              >
                Ver ranking
                <ArrowDown className="size-4" />
              </Link>
              <Link
                href="#metodologia"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-sm font-medium text-paper transition-colors hover:bg-white/10"
              >
                Como calculamos
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.14em] text-white/45">
              <span className="flex items-center gap-2">
                <Check className="size-3 text-lime" /> {comparison.cars.length}{" "}
                {comparison.cars.length === 1 ? "carro" : "carros"}
              </span>
              <span className="flex items-center gap-2">
                <Check className="size-3 text-lime" /> {CRITERIA.length}{" "}
                critérios
              </span>
              <span className="flex items-center gap-2">
                <Check className="size-3 text-lime" /> Preços c/ IVA
              </span>
              <span className="flex items-center gap-2">
                <Check className="size-3 text-lime" /> Cálculo automático
              </span>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
              Critérios em avaliação
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-5 lg:gap-x-5 lg:gap-y-3 lg:overflow-visible lg:pb-0">
              {CRITERIA.map((criterion) => {
                const Icon = criterion.icon
                return (
                  <div
                    key={criterion.id}
                    className="flex shrink-0 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-white/60 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-md text-lime lg:rounded-lg lg:border lg:border-white/10 lg:bg-white/[0.04]">
                      <Icon
                        className="size-4"
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="text-xs font-medium uppercase tracking-[0.1em]">
                      {criterion.shortLabel}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="ranking" className="scroll-mt-24 border-b border-line">
        <div className="mx-auto w-full max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24">
          <SectionHeading
            index="01"
            eyebrow="Ranking geral"
            title="Quem entrega mais, critério a critério."
            description={`A nota global é a média ponderada dos ${CRITERIA.length} critérios. Por defeito, todos pesam o mesmo; usa o botão Pesos para ajustar o que mais valorizas. Nos critérios relativos, o melhor carro da lista recebe 10 e os restantes a proporção do seu desempenho; o acabamento interno usa uma rubrica absoluta, com penalização para plástico duro. Ordene por qualquer coluna, pela nota global ou pelo custo por ponto.`}
          />
        </div>
        <div className="w-full px-3 pb-16 sm:px-5 sm:pb-24 lg:px-6">
          <RankingTable
            rows={rankingRows}
            updatedAt={formatDatePt(comparison.updatedAt)}
          />
        </div>
      </section>

      <section id="metodologia" className="scroll-mt-24">
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <SectionHeading
            index="02"
            eyebrow="Metodologia"
            title="Números transparentes, opiniões assumidas."
            description="Cada nota tem uma origem: um valor objetivo do dossiê ou uma avaliação editorial sustentada por fontes. Quando os dados de um carro mudam, as notas e o ranking são recalculados de imediato."
          />
          <Methodology />
        </div>
      </section>
    </>
  )
}

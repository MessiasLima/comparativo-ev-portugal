import { ArrowDown, ChevronDown, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CRITERIA } from "@/data/criteria"
import type { Source } from "@/data/types"
import type {
  BrandAssessment,
  InteriorAssessment,
  SatisfactionAssessment,
} from "@/data/types"
import { formatScore } from "@/lib/format"
import { withBasePath } from "@/lib/base-path"
import type { ScoredCar } from "@/lib/scoring"
import { ACCENT_HEX, ScoreBar } from "@/components/score"
import {
  HARD_PLASTIC_CAP,
  HARD_PLASTIC_LABELS,
  HARD_PLASTIC_PENALTY,
  INTERIOR_COMPONENTS,
  interiorScore,
} from "@/lib/interior"
import { BRAND_COMPONENTS, brandScore, PORTUGAL_FACTORY_BONUS } from "@/lib/brand"
import {
  SATISFACTION_COMPONENTS,
  SATISFACTION_EVIDENCE_CAPS,
  SATISFACTION_EVIDENCE_LABELS,
  satisfactionComponentScores,
  satisfactionScore,
} from "@/lib/satisfaction"

function SourceLinks({
  ids,
  sources,
}: {
  ids: string[]
  sources: Source[]
}) {
  const byId = new Map(sources.map((source) => [source.id, source]))
  const resolved = ids
    .map((id) => byId.get(id))
    .filter((source): source is Source => Boolean(source))

  if (resolved.length === 0) return null

  return (
    <div className="mt-5 border-t border-line pt-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Fontes
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {resolved.map((source) =>
          source.url ? (
            <a
              key={source.id}
              href={source.url.startsWith("/") ? withBasePath(source.url) : source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              {source.label}
              <ExternalLink className="size-2.5" />
            </a>
          ) : (
            <span
              key={source.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-background px-2.5 py-1 text-xs text-muted-foreground"
            >
              {source.label}
            </span>
          ),
        )}
      </div>
    </div>
  )
}

export function CriterionList({
  entry,
  sectionNumber = 3,
}: {
  entry: ScoredCar
  sectionNumber?: number
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      {CRITERIA.map((criterion, index) => {
        const scored = entry.criteria[criterion.id]
        const review = scored.review
        const assessment = review.assessment
        const Icon = criterion.icon

        return (
          <details
            key={criterion.id}
            id={`criterio-${criterion.id}`}
            open={index === 0}
            className="group scroll-mt-28 border-b border-line last:border-b-0"
          >
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 transition-colors hover:bg-muted/40 sm:flex-nowrap sm:px-5">
              <span className="w-8 shrink-0 font-mono text-xs font-semibold text-copper">
                {sectionNumber}.{criterion.number}
              </span>
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-forest">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{criterion.label}</span>
                  <Badge
                    variant="outline"
                    className="hidden border-line text-xs text-muted-foreground sm:inline-flex"
                  >
                    {criterion.kind === "objective"
                      ? "dado"
                      : criterion.kind === "rubric"
                        ? "rubrica"
                        : "editorial"}
                  </Badge>
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {scored.rawLabel} · #{scored.rank} da lista
                </span>
              </span>

              <span className="hidden w-28 shrink-0 sm:block">
                <ScoreBar score={scored.score} color={ACCENT_HEX[entry.car.accent]} />
              </span>

              <span className="flex min-w-14 items-baseline justify-end gap-1">
                <span className="font-heading text-2xl leading-none font-semibold tabular-nums">
                  {formatScore(scored.score)}
                </span>
                <span className="text-xs text-muted-foreground">/10</span>
              </span>

              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>

            <div className="px-4 pb-6 sm:px-5 sm:pl-16">
              <div className="rounded-xl bg-muted/40 px-3.5 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  O que mede
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {criterion.description}
                </p>
              </div>

              {criterion.id === "equipment" ? (
                <a
                  href="#equipamento"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-forest/40 hover:bg-muted/40"
                >
                  Ver a checklist completa de equipamento
                  <ArrowDown className="size-3 text-muted-foreground" />
                </a>
              ) : null}

              {criterion.id === "interior" && assessment ? (
                <div className="mt-3 rounded-xl border border-line bg-background px-3.5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Rubrica de acabamento
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {formatScore(interiorScore(assessment as InteriorAssessment))}/10
                    </p>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {INTERIOR_COMPONENTS.map((component) => {
                      const value = (assessment as InteriorAssessment)[component.key]
                      return (
                        <div key={component.key} title={component.description}>
                          <div className="flex items-baseline justify-between gap-2 text-xs">
                            <span className="text-muted-foreground">
                              {component.label}
                              <span className="text-muted-foreground/60">
                                {" "}
                                · {Math.round(component.weight * 100)}%
                              </span>
                            </span>
                            <span className="font-mono font-medium">
                              {formatScore(value)}
                            </span>
                          </div>
                          <ScoreBar
                            score={value}
                            color={ACCENT_HEX[entry.car.accent]}
                            className="mt-1.5"
                          />
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Plástico duro:{" "}
                    <span className="font-medium text-foreground">
                      {HARD_PLASTIC_LABELS[(assessment as InteriorAssessment).hardPlastic]}
                    </span>
                    .{" "}
                    {HARD_PLASTIC_PENALTY[(assessment as InteriorAssessment).hardPlastic] > 0
                      ? `Desconta ${formatScore(HARD_PLASTIC_PENALTY[(assessment as InteriorAssessment).hardPlastic])} pontos e limita a nota a ${formatScore(HARD_PLASTIC_CAP[(assessment as InteriorAssessment).hardPlastic])}/10.`
                      : "Sem desconto na nota."}
                  </p>
                </div>
              ) : null}

              {criterion.id === "brand" && assessment ? (
                <div className="mt-3 rounded-xl border border-line bg-background px-3.5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Rubrica de marca e assistência
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      Índice {formatScore(brandScore(assessment as BrandAssessment))}/10
                    </p>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {BRAND_COMPONENTS.map((component) => {
                      const value = (assessment as BrandAssessment)[component.key]
                      return (
                        <div key={component.key} title={component.description}>
                          <div className="flex items-baseline justify-between gap-2 text-xs">
                            <span className="text-muted-foreground">
                              {component.label}
                              <span className="text-muted-foreground/60">
                                {" "}· {Math.round(component.weight * 100)}%
                              </span>
                            </span>
                            <span className="font-mono font-medium">
                              {formatScore(value)}
                            </span>
                          </div>
                          <ScoreBar
                            score={value}
                            color={ACCENT_HEX[entry.car.accent]}
                            className="mt-1.5"
                          />
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Fábrica automóvel em Portugal: {" "}
                    <span className="font-medium text-foreground">
                      {(assessment as BrandAssessment).portugalFactory ? "sim" : "não"}
                    </span>
                    . {" "}
                    {(assessment as BrandAssessment).portugalFactory
                      ? `Bónus de ${formatScore(PORTUGAL_FACTORY_BONUS)} pontos, limitado a 10.`
                      : "Sem bónus local."}
                  </p>
                </div>
              ) : null}

              {criterion.id === "satisfaction" &&
              assessment &&
              "ownerSentiment" in assessment ? (
                <div className="mt-3 rounded-xl border border-line bg-background px-3.5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Rubrica de satisfação e ocorrências
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      Índice {formatScore(satisfactionScore(assessment))}/10
                    </p>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {SATISFACTION_COMPONENTS.map((component) => {
                      const values = satisfactionComponentScores(assessment)
                      const rawValue =
                        (assessment as SatisfactionAssessment)[component.key]
                      const value = values[component.key]
                      const cap =
                        SATISFACTION_EVIDENCE_CAPS[assessment.evidenceLevel][
                          component.key
                        ]
                      return (
                        <div key={component.key} title={component.description}>
                          <div className="flex items-baseline justify-between gap-2 text-xs">
                            <span className="text-muted-foreground">
                              {component.label}
                              <span className="text-muted-foreground/60">
                                {" "}· {Math.round(component.weight * 100)}%
                              </span>
                            </span>
                            <span className="font-mono font-medium">
                              {formatScore(value)}
                            </span>
                          </div>
                          <ScoreBar
                            score={value}
                            color={ACCENT_HEX[entry.car.accent]}
                            className="mt-1.5"
                          />
                          {rawValue > cap ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Limitada a {formatScore(cap)} pela amostra {" "}
                              {SATISFACTION_EVIDENCE_LABELS[assessment.evidenceLevel]}.
                            </p>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Maturidade da evidência: {" "}
                    <span className="font-medium text-foreground">
                      {SATISFACTION_EVIDENCE_LABELS[assessment.evidenceLevel]}
                    </span>
                    . As contagens de queixas não são taxas de defeitos sem dados
                    comparáveis de frota, quilometragem e exposição.
                  </p>
                </div>
              ) : null}

              <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
                {review.summary}
              </p>

              {(review.pros?.length || review.cons?.length) && (
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {review.pros?.length ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
                        A favor
                      </p>
                      <ul className="mt-2 space-y-2">
                        {review.pros.map((item) => (
                          <li
                            key={item}
                            className="flex gap-2 text-sm leading-6 text-muted-foreground"
                          >
                            <span className="mt-2 size-1 shrink-0 rounded-full bg-forest" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {review.cons?.length ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
                        A rever
                      </p>
                      <ul className="mt-2 space-y-2">
                        {review.cons.map((item) => (
                          <li
                            key={item}
                            className="flex gap-2 text-sm leading-6 text-muted-foreground"
                          >
                            <span className="mt-2 size-1 shrink-0 rounded-full bg-copper" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}

              <SourceLinks ids={review.sourceIds} sources={entry.car.sources} />
            </div>
          </details>
        )
      })}
    </div>
  )
}

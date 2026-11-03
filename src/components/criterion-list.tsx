import { ChevronDown, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CRITERIA } from "@/data/criteria"
import type { Source } from "@/data/types"
import { formatScore } from "@/lib/format"
import type { ScoredCar } from "@/lib/scoring"
import { ACCENT_HEX, ScoreBar } from "@/components/score"

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
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Fontes
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {resolved.map((source) =>
          source.url ? (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-background px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              {source.label}
              <ExternalLink className="size-2.5" />
            </a>
          ) : (
            <span
              key={source.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-background px-2.5 py-1 text-[11px] text-muted-foreground"
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
        const Icon = criterion.icon

        return (
          <details
            key={criterion.id}
            id={`criterio-${criterion.id}`}
            open={index === 0}
            className="group scroll-mt-28 border-b border-line last:border-b-0"
          >
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 transition-colors hover:bg-muted/40 sm:flex-nowrap sm:px-5">
              <span className="w-8 shrink-0 font-mono text-[11px] font-semibold text-copper">
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
                    className="hidden border-line text-[10px] text-muted-foreground sm:inline-flex"
                  >
                    {criterion.kind === "objective" ? "dado" : "editorial"}
                  </Badge>
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
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
                <span className="text-[11px] text-muted-foreground">/10</span>
              </span>

              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>

            <div className="px-4 pb-6 sm:px-5 sm:pl-16">
              <div className="rounded-xl bg-muted/40 px-3.5 py-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  O que mede
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {criterion.description}
                </p>
              </div>

              <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
                {review.summary}
              </p>

              {(review.pros?.length || review.cons?.length) && (
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {review.pros?.length ? (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-forest">
                        A favor
                      </p>
                      <ul className="mt-2 space-y-2">
                        {review.pros.map((item) => (
                          <li
                            key={item}
                            className="flex gap-2 text-xs leading-5 text-muted-foreground"
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
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-copper">
                        A rever
                      </p>
                      <ul className="mt-2 space-y-2">
                        {review.cons.map((item) => (
                          <li
                            key={item}
                            className="flex gap-2 text-xs leading-5 text-muted-foreground"
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

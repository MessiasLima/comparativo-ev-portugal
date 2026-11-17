"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  ArrowDown,
  ArrowDownWideNarrow,
  ArrowUp,
  ArrowUpNarrowWide,
  ArrowUpDown,
  ArrowUpRight,
  Settings2,
  TrendingDown,
  Trophy,
} from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CriterionTooltip } from "@/components/criterion-tooltip"
import { CRITERIA } from "@/data/criteria"
import type { CriterionDefinition, CriterionId } from "@/data/types"
import { formatCarName, formatEuro, formatScore } from "@/lib/format"
import { useWeights } from "@/hooks/use-weights"
import { trackAttributes, trackEvent } from "@/lib/analytics"
import { idealPrices, rankByTotal } from "@/lib/ranking"
import { weightedAverage } from "@/lib/weights"
import { ScoreBar, ScoreCell } from "@/components/score"
import { IdealPriceInfo } from "@/components/ideal-price-info"

export interface ComparisonRow {
  id: string
  slug: string
  brand: string
  model: string
  variant: string
  version: string
  accent: "copper" | "ocean"
  price: number
  scores: Record<CriterionId, number>
}

interface WeightedRow extends ComparisonRow {
  total: number
  pricePerPoint: number
  idealPrice: number | null
  rank: number
  valueRank: number
}

type SortKey = "total" | "pricePerPoint" | "price" | CriterionId
type SortDirection = "asc" | "desc"

interface SortState {
  key: SortKey
  direction: SortDirection
}

const WeightModal = dynamic(
  () => import("@/components/weight-modal").then((mod) => mod.WeightModal),
  { ssr: false },
)

const compactLabels: Record<CriterionId, string> = {
  interior: "Acab.",
  comfort: "Conforto",
  brand: "Marca",
  equipment: "Equip.",
  boot: "Bagag.",
  sound: "Som",
  range: "Auton.",
  powerToWeight: "Pot./peso",
  efficiency: "Efic.",
  charging: "Carga",
  satisfaction: "Satisf.",
}

function defaultDirection(key: SortKey): SortDirection {
  return key === "price" || key === "pricePerPoint" ? "asc" : "desc"
}

function SortHeader({
  label,
  title,
  sortKey,
  currentSort,
  onSort,
  align = "center",
}: {
  label: string
  title?: string
  sortKey: SortKey
  currentSort: SortState
  onSort: (key: SortKey) => void
  align?: "left" | "center" | "right"
}) {
  const active = currentSort.key === sortKey
  const Icon = active
    ? currentSort.direction === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      title={title}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap uppercase tracking-[0.08em] transition-colors hover:text-foreground",
        align === "left"
          ? "justify-start text-left"
          : align === "right"
            ? "justify-end text-right"
            : "justify-center text-center",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {label}
      <Icon className="size-3.5 opacity-60" aria-hidden="true" />
    </button>
  )
}

function CriterionHeader({
  criterion,
  currentSort,
  onSort,
}: {
  criterion: CriterionDefinition
  currentSort: SortState
  onSort: (key: SortKey) => void
}) {
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const hide = () => {
    clearTimer()
    setOpen(false)
  }

  const schedule = () => {
    clearTimer()
    timerRef.current = setTimeout(() => {
      const nextRect = triggerRef.current?.getBoundingClientRect()
      if (nextRect) {
        setRect(nextRect)
        setOpen(true)
        trackEvent("criterio-explicacao-ver", { criterio: criterion.id })
      }
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const hideOnChange = () => setOpen(false)
    window.addEventListener("scroll", hideOnChange, true)
    window.addEventListener("resize", hideOnChange)

    return () => {
      window.removeEventListener("scroll", hideOnChange, true)
      window.removeEventListener("resize", hideOnChange)
    }
  }, [open])

  return (
    <div
      ref={triggerRef}
      className="flex w-full items-center justify-center"
      onMouseEnter={schedule}
      onMouseLeave={hide}
      onFocus={schedule}
      onBlur={hide}
    >
      <SortHeader
        label={compactLabels[criterion.id]}
        sortKey={criterion.id}
        currentSort={currentSort}
        onSort={(key) => {
          hide()
          onSort(key)
        }}
      />
      {open && rect ? (
        <CriterionTooltip criterion={criterion} rect={rect} />
      ) : null}
    </div>
  )
}

function CarBadges({ entry }: { entry: WeightedRow }) {
  return (
    <>
      {entry.rank === 1 && <Badge className="bg-lime text-ink">Líder</Badge>}
      {entry.valueRank === 1 && (
        <Badge
          variant="outline"
          className="border-copper/30 bg-copper/5 text-copper"
        >
          Melhor valor
        </Badge>
      )}
    </>
  )
}

/** Versão em cartão de uma linha do ranking, para ecrãs estreitos. */
function RankingCard({
  entry,
  sortKey,
  customized,
  showIdealPrice,
}: {
  entry: WeightedRow
  sortKey: SortKey
  customized: boolean
  showIdealPrice: boolean
}) {
  return (
    <li className="rounded-xl border border-line bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/carros/${entry.slug}`}
          className="group flex min-w-0 items-start gap-2.5"
          {...trackAttributes("abrir-dossie", {
            carro: entry.slug,
            posicao: entry.rank,
            origem: "ranking-cartao",
            ordem: sortKey,
          })}
        >
          <span
            className="shrink-0 pt-0.5 font-mono text-sm font-semibold text-muted-foreground"
            title="Posição no ranking geral"
          >
            #{entry.rank}
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-heading text-lg leading-tight font-semibold">
                {formatCarName(entry)}
              </span>
              <CarBadges entry={entry} />
            </span>
            <span className="mt-1 block text-sm leading-6 text-muted-foreground">
              {entry.version}
            </span>
          </span>
          <ArrowUpRight className="mt-1 size-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-foreground" />
        </Link>
        <div
          className={cn(
            "flex shrink-0 items-baseline gap-1",
            sortKey === "total" ? "text-foreground" : "text-foreground/70",
          )}
        >
          <span className="font-heading text-2xl leading-none font-semibold">
            {formatScore(entry.total)}
          </span>
          <span className="text-sm text-muted-foreground">/10</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-y border-line py-2 text-sm whitespace-nowrap">
        <span className="inline-flex items-center gap-1">
          <span className="text-muted-foreground">Preço</span>
          <span
            className={cn(
              "font-mono",
              sortKey === "price" && "font-semibold",
            )}
          >
            {formatEuro(entry.price)}
          </span>
          {showIdealPrice && entry.idealPrice !== null ? (
            <IdealPriceInfo
              price={entry.price}
              idealPrice={entry.idealPrice}
              isBestValue={entry.valueRank === 1}
              customized={customized}
              analytics={{ carro: entry.slug, origem: "ranking-cartao" }}
            />
          ) : null}
        </span>
        <span className="inline-flex items-baseline gap-1.5">
          <span className="text-muted-foreground">€/ponto</span>
          <span className="font-mono text-base font-semibold text-copper">
            {formatEuro(entry.pricePerPoint)}
          </span>
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-x-4 gap-y-3">
        {CRITERIA.map((criterion) => {
          const active = sortKey === criterion.id
          return (
            <div
              key={criterion.id}
              title={criterion.label}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-1 text-xs"
            >
              <dt
                className={cn(
                  "truncate",
                  active
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {compactLabels[criterion.id]}
              </dt>
              <dd className="font-mono font-semibold tabular-nums">
                {formatScore(entry.scores[criterion.id])}
              </dd>
              <ScoreBar
                score={entry.scores[criterion.id]}
                color={active ? "var(--color-copper)" : undefined}
                className="col-span-2 mt-1"
              />
            </div>
          )
        })}
      </dl>
    </li>
  )
}

export function RankingTable({
  rows,
  updatedAt,
}: {
  rows: ComparisonRow[]
  /** Data editorial já formatada para apresentação (ex.: "3 de novembro de 2026"). */
  updatedAt: string
}) {
  const [sort, setSort] = useState<SortState>({
    key: "total",
    direction: "desc",
  })
  const [weightModalOpen, setWeightModalOpen] = useState(false)
  const { weights, applyWeights, customized } = useWeights()

  const weightedRows = useMemo<WeightedRow[]>(() => {
    const scored = rows.map((row) => {
      const total = weightedAverage(row.scores, weights)
      return {
        ...row,
        total,
        pricePerPoint: total > 0 ? row.price / total : 0,
        idealPrice: null as number | null,
        rank: 1,
        valueRank: 1,
      }
    })

    const ranks = rankByTotal(scored, (row) => row)
    const ideal = idealPrices(scored, (row) => row)
    scored.forEach((row) => {
      row.rank = ranks.get(row) ?? scored.length
      row.idealPrice = ideal.get(row) ?? null
    })

    const byValue = [...scored].sort(
      (a, b) => a.pricePerPoint - b.pricePerPoint,
    )
    let valueRank = 1
    byValue.forEach((row, index) => {
      if (
        index > 0 &&
        row.pricePerPoint - byValue[index - 1].pricePerPoint > 0.000001
      ) {
        valueRank = index + 1
      }
      row.valueRank = valueRank
    })

    return scored
  }, [rows, weights])

  const sortedRows = useMemo(() => {
    return [...weightedRows].sort((a, b) => {
      if (sort.key === "total") {
        // A posição já inclui o desempate pelo preço.
        return sort.direction === "desc" ? a.rank - b.rank : b.rank - a.rank
      }
      const aValue =
        sort.key === "price"
          ? a.price
          : sort.key === "pricePerPoint"
            ? a.pricePerPoint
            : a.scores[sort.key]
      const bValue =
        sort.key === "price"
          ? b.price
          : sort.key === "pricePerPoint"
            ? b.pricePerPoint
            : b.scores[sort.key]

      return sort.direction === "asc" ? aValue - bValue : bValue - aValue
    })
  }, [weightedRows, sort])

  const changeSort = (next: SortState, origem: string) => {
    setSort(next)
    trackEvent("ranking-ordenar", {
      criterio: next.key,
      direcao: next.direction,
      origem,
    })
  }

  const handleSort = (key: SortKey) => {
    changeSort(
      sort.key === key
        ? { key, direction: sort.direction === "asc" ? "desc" : "asc" }
        : { key, direction: defaultDirection(key) },
      "cabecalho",
    )
  }

  const criterionLabel =
    CRITERIA.find((criterion) => criterion.id === sort.key)?.label ?? null
  const currentSortLabel =
    sort.key === "total"
      ? "Nota global"
      : sort.key === "price"
        ? "Preço"
        : sort.key === "pricePerPoint"
          ? "€/ponto"
          : criterionLabel
  const directionLabel =
    sort.direction === "desc" ? "maior primeiro" : "menor primeiro"
  const bestScoreActive = sort.key === "total" && sort.direction === "desc"
  const bestValueActive =
    sort.key === "pricePerPoint" && sort.direction === "asc"

  return (
    <>
      <div className="sm:overflow-hidden sm:rounded-2xl sm:border sm:border-line sm:bg-card sm:shadow-[0_1px_0_rgba(20,32,26,0.04),0_20px_50px_-35px_rgba(20,32,26,0.25)]">
      <div className="border-b border-line pb-4 sm:px-6 sm:pt-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Ranking completo
            </p>
            <p className="mt-1 text-base leading-7 text-muted-foreground">
              <span className="hidden md:inline">
                Clique num cabeçalho para ordenar.{" "}
              </span>
              As notas são absolutas ou relativas à lista, conforme o critério.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                changeSort({ key: "total", direction: "desc" }, "atalho")
              }
              aria-pressed={bestScoreActive}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors",
                bestScoreActive
                  ? "border-forest bg-forest text-paper"
                  : "border-line bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Trophy
                className={cn(
                  "size-3.5",
                  bestScoreActive ? "text-lime" : "text-copper",
                )}
              />
              Melhor nota
            </button>
            <button
              type="button"
              onClick={() =>
                changeSort({ key: "pricePerPoint", direction: "asc" }, "atalho")
              }
              aria-pressed={bestValueActive}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors",
                bestValueActive
                  ? "border-copper bg-copper text-white"
                  : "border-line bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <TrendingDown
                className={cn(
                  "size-3.5",
                  bestValueActive ? "text-white" : "text-copper",
                )}
              />
              Melhor custo-benefício
            </button>
            <button
              type="button"
              onClick={() => {
                setWeightModalOpen(true)
                trackEvent("prioridades-abrir", { personalizadas: customized })
              }}
              title="Escolher quanto importa cada critério na nota global"
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors",
                customized
                  ? "border-forest bg-lime/30 text-forest"
                  : "border-forest bg-lime/10 text-forest hover:bg-lime/25",
              )}
            >
              <Settings2 className="size-4 text-copper" />
              Ajustar prioridades
              {customized ? (
                <span className="size-1.5 rounded-full bg-forest" />
              ) : null}
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 md:hidden">
          <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-muted-foreground">
            <span className="shrink-0">Ordenar por</span>
            <select
              value={sort.key}
              onChange={(event) => {
                const key = event.target.value as SortKey
                changeSort({ key, direction: defaultDirection(key) }, "seletor")
              }}
              className="h-10 min-w-0 flex-1 rounded-full border border-line bg-card px-3 text-sm font-medium text-foreground"
            >
              <option value="total">Nota global</option>
              <option value="pricePerPoint">€/ponto</option>
              <option value="price">Preço</option>
              {CRITERIA.map((criterion) => (
                <option key={criterion.id} value={criterion.id}>
                  {criterion.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() =>
              changeSort(
                {
                  key: sort.key,
                  direction: sort.direction === "asc" ? "desc" : "asc",
                },
                "inverter",
              )
            }
            aria-label={`Inverter a ordem (agora ${directionLabel})`}
            title={`${directionLabel[0].toUpperCase()}${directionLabel.slice(1)} · tocar para inverter`}
            className="inline-grid size-10 shrink-0 place-items-center rounded-full border border-line bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {sort.direction === "asc" ? (
              <ArrowUpNarrowWide className="size-4" aria-hidden="true" />
            ) : (
              <ArrowDownWideNarrow className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="mt-3 hidden flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground md:flex">
          <span>
            A ordenar por{" "}
            <span className="font-medium text-foreground">{currentSortLabel}</span>{" "}
            · {directionLabel}
          </span>
          <span className="text-line">/</span>
          <span>
            {customized
              ? "Prioridades personalizadas"
              : "Todos os critérios contam igual"}
          </span>
          <span className="text-line">/</span>
          <span className="xl:hidden">Deslize para ver todas as colunas →</span>
        </div>
      </div>

      <ol className="grid gap-3 py-4 sm:grid-cols-2 sm:bg-muted/35 sm:p-3 md:hidden">
        {sortedRows.map((entry) => (
          <RankingCard
            key={entry.id}
            entry={entry}
            sortKey={sort.key}
            customized={customized}
            showIdealPrice={bestValueActive}
          />
        ))}
      </ol>

      <div className="hidden md:block">
      <Table className="min-w-[1100px]">
        <TableHeader>
          <TableRow className="border-line hover:bg-transparent">
            <TableHead className="min-w-[210px] pl-5 text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Carro
            </TableHead>
            {CRITERIA.map((criterion) => (
              <TableHead
                key={criterion.id}
                aria-sort={
                  sort.key === criterion.id
                    ? sort.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
                className="px-1 text-center text-sm"
              >
                <CriterionHeader
                  criterion={criterion}
                  currentSort={sort}
                  onSort={handleSort}
                />
              </TableHead>
            ))}
            <TableHead
              aria-sort={
                sort.key === "price"
                  ? sort.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
              className="min-w-[112px] text-right text-sm"
            >
              <SortHeader
                label="Preço"
                title="Ordenar pelo preço"
                sortKey="price"
                currentSort={sort}
                onSort={handleSort}
                align="right"
              />
            </TableHead>
            <TableHead
              aria-sort={
                sort.key === "total"
                  ? sort.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
              className="min-w-[84px] text-right text-sm"
            >
              <SortHeader
                label="Nota"
                title="Ordenar pela nota global"
                sortKey="total"
                currentSort={sort}
                onSort={handleSort}
                align="right"
              />
            </TableHead>
            <TableHead
              aria-sort={
                sort.key === "pricePerPoint"
                  ? sort.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
              className="min-w-[92px] pr-5 text-right text-sm"
            >
              <SortHeader
                label="€/ponto"
                title="Ordenar pelo custo por ponto"
                sortKey="pricePerPoint"
                currentSort={sort}
                onSort={handleSort}
                align="right"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.map((entry) => (
            <TableRow
              key={entry.id}
              className="border-line hover:bg-muted/45"
            >
              <TableCell className="pl-5 whitespace-normal">
                <Link
                  href={`/carros/${entry.slug}`}
                  className="group flex items-center gap-2.5"
                  {...trackAttributes("abrir-dossie", {
                    carro: entry.slug,
                    posicao: entry.rank,
                    origem: "ranking-tabela",
                    ordem: sort.key,
                  })}
                >
                  <span
                    className="shrink-0 font-mono text-sm font-semibold text-muted-foreground"
                    title="Posição no ranking geral"
                  >
                    #{entry.rank}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                       <span className="whitespace-nowrap font-heading text-lg leading-tight font-semibold">
                        {formatCarName(entry)}
                      </span>
                      <CarBadges entry={entry} />
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                      {entry.version}
                    </span>
                  </span>
                  <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              </TableCell>
              {CRITERIA.map((criterion) => (
                <TableCell key={criterion.id} className="px-0.5 text-center">
                  <div className="flex justify-center">
                    <ScoreCell score={entry.scores[criterion.id]} />
                  </div>
                </TableCell>
              ))}
              <TableCell className="text-right">
                <span className="inline-flex items-center justify-end gap-1">
                  <span className="font-mono text-sm">
                    {formatEuro(entry.price)}
                  </span>
                  {bestValueActive && entry.idealPrice !== null ? (
                    <IdealPriceInfo
                      price={entry.price}
                      idealPrice={entry.idealPrice}
                      isBestValue={entry.valueRank === 1}
                      customized={customized}
                      analytics={{ carro: entry.slug, origem: "ranking-tabela" }}
                    />
                  ) : null}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="inline-flex items-baseline gap-1 text-foreground/70">
                  <span className="font-heading text-lg leading-none font-semibold">
                    {formatScore(entry.total)}
                  </span>
                  <span className="text-sm text-muted-foreground">/10</span>
                </div>
              </TableCell>
              <TableCell className="pr-5 text-right">
                <span className="font-mono text-base font-semibold text-copper">
                  {formatEuro(entry.pricePerPoint)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-line py-3 text-sm leading-6 text-muted-foreground sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:bg-muted/35 sm:px-6">
        <p>
          <span className="font-medium text-foreground">Nota global</span> = média
          ponderada dos {CRITERIA.length} critérios, ajustável em{" "}
          <span className="font-medium text-foreground">Ajustar prioridades</span> ·{" "}
          <span className="font-medium text-foreground">€/ponto</span> = preço ÷
          nota global · o{" "}
          <span className="font-medium text-foreground">#</span> é a posição na
          nota global. Passa o rato sobre um critério para ver o que mede. Ao
          ordenar por{" "}
          <span className="font-medium text-foreground">
            Melhor custo-benefício
          </span>
          , o ícone junto ao preço mostra o preço a que o carro seria o melhor
          custo-benefício.
        </p>
        <p className="shrink-0 text-xs tracking-[0.14em] whitespace-nowrap uppercase">
          Atualizado a {updatedAt}
        </p>
      </div>
    </div>
    {weightModalOpen ? (
      <WeightModal
        weights={weights}
        criteria={CRITERIA}
        onChange={applyWeights}
        onClose={() => setWeightModalOpen(false)}
      />
    ) : null}
    </>
  )
}

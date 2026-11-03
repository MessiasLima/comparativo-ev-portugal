"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowDown,
  ArrowUp,
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
import { WeightModal } from "@/components/weight-modal"
import { CRITERIA } from "@/data/criteria"
import type { CriterionDefinition, CriterionId } from "@/data/types"
import { formatCarName, formatEuro, formatScore } from "@/lib/format"
import { useWeights } from "@/hooks/use-weights"
import { weightedAverage } from "@/lib/weights"
import { ACCENT_BG, ScoreCell } from "@/components/score"

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
  rank: number
  valueRank: number
}

type SortKey = "total" | "pricePerPoint" | "price" | CriterionId
type SortDirection = "asc" | "desc"

interface SortState {
  key: SortKey
  direction: SortDirection
}

const compactLabels: Record<CriterionId, string> = {
  interior: "Acab.",
  comfort: "Conforto",
  brand: "Marca/assist.",
  equipment: "Equip.",
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

export function RankingTable({ rows }: { rows: ComparisonRow[] }) {
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
        rank: 1,
        valueRank: 1,
      }
    })

    const byTotal = [...scored].sort((a, b) => b.total - a.total)
    let rank = 1
    byTotal.forEach((row, index) => {
      if (index > 0 && byTotal[index - 1].total - row.total > 0.000001) {
        rank = index + 1
      }
      row.rank = rank
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
      const aValue =
        sort.key === "total"
          ? a.total
          : sort.key === "price"
            ? a.price
            : sort.key === "pricePerPoint"
              ? a.pricePerPoint
              : a.scores[sort.key]
      const bValue =
        sort.key === "total"
          ? b.total
          : sort.key === "price"
            ? b.price
            : sort.key === "pricePerPoint"
              ? b.pricePerPoint
              : b.scores[sort.key]

      return sort.direction === "asc" ? aValue - bValue : bValue - aValue
    })
  }, [weightedRows, sort])

  const handleSort = (key: SortKey) => {
    setSort((current) =>
      current.key === key
        ? {
            key,
            direction: current.direction === "asc" ? "desc" : "asc",
          }
        : { key, direction: defaultDirection(key) },
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
      <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-[0_1px_0_rgba(20,32,26,0.04),0_20px_50px_-35px_rgba(20,32,26,0.25)]">
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Ranking completo
            </p>
            <p className="mt-1 text-[15px] leading-6 text-muted-foreground">
              Clique num cabeçalho para ordenar. O líder de cada critério recebe
              10.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSort({ key: "total", direction: "desc" })}
              aria-pressed={bestScoreActive}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
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
                setSort({ key: "pricePerPoint", direction: "asc" })
              }
              aria-pressed={bestValueActive}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
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
              onClick={() => setWeightModalOpen(true)}
              aria-label="Configurar pesos das notas"
              title="Configurar pesos das notas"
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
                customized
                  ? "border-forest bg-lime/20 text-forest"
                  : "border-line bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Settings2 className="size-4" />
              Pesos
              {customized ? (
                <span className="size-1.5 rounded-full bg-forest" />
              ) : null}
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>
            A ordenar por{" "}
            <span className="font-medium text-foreground">{currentSortLabel}</span>{" "}
            · {directionLabel}
          </span>
          <span className="text-line">/</span>
          <span>{customized ? "Pesos personalizados" : "Pesos iguais"}</span>
          <span className="text-line">/</span>
          <span className="xl:hidden">Deslize para ver todas as colunas →</span>
        </div>
      </div>

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
                className="px-1 text-center text-xs"
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
              className="min-w-[92px] text-right text-xs"
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
              className="min-w-[84px] text-right text-xs"
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
              className="min-w-[92px] pr-5 text-right text-xs"
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
                >
                  <span
                    className="shrink-0 font-mono text-xs font-semibold text-muted-foreground"
                    title="Posição no ranking geral"
                  >
                    #{entry.rank}
                  </span>
                  <span
                    className={cn(
                      "h-10 w-1 shrink-0 rounded-full",
                      ACCENT_BG[entry.accent],
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="whitespace-nowrap font-heading text-[17px] leading-tight font-semibold">
                        {formatCarName(entry)}
                      </span>
                      {entry.rank === 1 && (
                        <Badge className="bg-lime text-ink">Líder</Badge>
                      )}
                      {entry.valueRank === 1 && (
                        <Badge
                          variant="outline"
                          className="border-copper/30 bg-copper/5 text-copper"
                        >
                          Melhor valor
                        </Badge>
                      )}
                    </span>
                    <span className="mt-1 block text-[13px] leading-5 text-muted-foreground">
                      {entry.version}
                    </span>
                  </span>
                  <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              </TableCell>
              {CRITERIA.map((criterion) => (
                <TableCell key={criterion.id} className="px-0.5 text-center">
                  <div className="flex justify-center">
                    <ScoreCell
                      score={entry.scores[criterion.id]}
                      accent={entry.accent}
                    />
                  </div>
                </TableCell>
              ))}
              <TableCell className="text-right">
                <span className="font-mono text-[14px]">
                  {formatEuro(entry.price)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="inline-flex items-baseline gap-1 text-foreground/70">
                  <span className="font-heading text-lg leading-none font-semibold">
                    {formatScore(entry.total)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">/10</span>
                </div>
              </TableCell>
              <TableCell className="pr-5 text-right">
                <span className="font-mono text-[15px] font-semibold text-copper">
                  {formatEuro(entry.pricePerPoint)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="border-t border-line bg-muted/35 px-5 py-3 text-xs leading-5 text-muted-foreground sm:px-6 sm:text-[13px] sm:leading-6">
        <span className="font-medium text-foreground">Nota global</span> = média
        ponderada dos 10 critérios, ajustável em{" "}
        <span className="font-medium text-foreground">Pesos</span> ·{" "}
        <span className="font-medium text-foreground">€/ponto</span> = preço ÷
        nota global · o <span className="font-medium text-foreground">#</span> é
        a posição na nota global. Passa o rato sobre um critério para ver o que
        mede.
      </div>
    </div>
    {weightModalOpen ? (
      <WeightModal
        weights={weights}
        criteria={CRITERIA}
        cars={rows.map((row) => ({
          id: row.id,
          name: formatCarName(row),
          price: row.price,
          scores: row.scores,
        }))}
        onChange={applyWeights}
        onClose={() => setWeightModalOpen(false)}
      />
    ) : null}
    </>
  )
}

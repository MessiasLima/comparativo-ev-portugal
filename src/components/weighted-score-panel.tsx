"use client"

import { cn } from "cn"
import { differenceTextClass } from "@/components/fair-price-info"
import { Badge } from "@/components/ui/badge"
import { CRITERIA } from "@/data/criteria"
import { EQUIPMENT_CHECKLIST } from "@/data/equipment"
import type { CriterionId } from "@/data/types"
import { formatEuro, formatScore, formatSignedPercent } from "@/lib/format"
import { useWeights } from "@/hooks/use-weights"
import { fairPrices } from "@/lib/fair-price"
import { rankByTotal } from "@/lib/ranking"
import { weightedAverage } from "@/lib/weights"

export interface ScoreCar {
  id: string
  /** Marca + modelo: as versões do mesmo modelo dividem um voto na recta do preço médio. */
  group: string
  scores: Record<CriterionId, number>
  price: number
}

export function WeightedScorePanel({
  cars,
  carId,
  equipmentCount,
  leadingCriteria,
}: {
  cars: ScoreCar[]
  carId: string
  equipmentCount: number
  leadingCriteria: number
}) {
  const { weights, customized } = useWeights()

  const scored = cars.map((car) => ({
    ...car,
    total: weightedAverage(car.scores, weights),
  }))
  const current = scored.find((car) => car.id === carId) ?? scored[0]
  const rank = rankByTotal(scored, (car) => car).get(current) ?? scored.length
  const value = fairPrices(scored, (car) => car).get(current)

  return (
    <div className="grid gap-3">
      <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            Nota global
          </p>
          <Badge className="bg-lime text-ink">
            #{rank} de {cars.length}
          </Badge>
        </div>
        <div className="mt-3 flex items-end justify-between gap-4">
          <span className="font-heading text-6xl leading-none font-semibold tracking-[-0.05em] text-lime">
            {formatScore(current.total)}
          </span>
          <span className="pb-1 text-xs text-white/40">/ 10</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/70">
          Lidera {leadingCriteria} dos {CRITERIA.length} critérios. Nota comparada
          com a lista atual.
        </p>
        {customized ? (
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-lime/90">
            Prioridades personalizadas
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/60">
            Face ao preço médio
          </p>
          <p
            className={cn(
              "mt-2 font-mono text-xl font-semibold",
              value?.gap != null && differenceTextClass(value.gap * 100, "dark"),
            )}
          >
            {value?.gap != null ? formatSignedPercent(value.gap * 100) : "—"}
          </p>
          <p className="mt-1 text-xs text-white/60">
            {value?.fairPrice != null
              ? `Médio: ${formatEuro(value.fairPrice)} · #${value.valueRank} em custo-benefício`
              : "Sem preço médio"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/60">
            Equipamento
          </p>
          <p className="mt-2 font-mono text-xl font-semibold">
            {equipmentCount}
            <span className="text-xs text-white/40">
              /{EQUIPMENT_CHECKLIST.length}
            </span>
          </p>
          <p className="mt-1 text-xs text-white/60">itens da checklist</p>
        </div>
      </div>
    </div>
  )
}

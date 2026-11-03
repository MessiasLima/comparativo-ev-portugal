"use client"

import { Badge } from "@/components/ui/badge"
import { EQUIPMENT_CHECKLIST } from "@/data/equipment"
import type { CriterionId } from "@/data/types"
import { formatEuro, formatScore } from "@/lib/format"
import { useWeights } from "@/hooks/use-weights"
import { weightedAverage } from "@/lib/weights"

export interface ScoreCar {
  id: string
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

  const scored = cars.map((car) => {
    const total = weightedAverage(car.scores, weights)
    return {
      ...car,
      total,
      pricePerPoint: total > 0 ? car.price / total : 0,
    }
  })
  const byTotal = [...scored].sort((a, b) => b.total - a.total)
  const byValue = [...scored].sort(
    (a, b) => a.pricePerPoint - b.pricePerPoint,
  )
  const current = scored.find((car) => car.id === carId) ?? scored[0]
  const rank = byTotal.findIndex((car) => car.id === carId) + 1
  const valueRank = byValue.findIndex((car) => car.id === carId) + 1

  return (
    <div className="grid gap-3">
      <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
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
        <p className="mt-3 text-xs text-white/50">
          Lidera {leadingCriteria} dos 10 critérios. Nota relativa à lista
          atual.
        </p>
        {customized ? (
          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-lime/75">
            Pesos personalizados
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
            Preço por ponto
          </p>
          <p className="mt-2 font-mono text-xl font-semibold">
            {formatEuro(current.pricePerPoint)}
          </p>
          <p className="mt-1 text-[11px] text-white/40">
            #{valueRank} melhor custo-benefício
          </p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
            Equipamento
          </p>
          <p className="mt-2 font-mono text-xl font-semibold">
            {equipmentCount}
            <span className="text-xs text-white/40">
              /{EQUIPMENT_CHECKLIST.length}
            </span>
          </p>
          <p className="mt-1 text-[11px] text-white/40">itens da checklist</p>
        </div>
      </div>
    </div>
  )
}

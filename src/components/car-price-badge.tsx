"use client"

import { FairPriceInfo } from "@/components/fair-price-info"
import type { ScoreCar } from "@/components/weighted-score-panel"
import { useWeights } from "@/hooks/use-weights"
import { fairPrices } from "@/lib/fair-price"
import { formatEuro } from "@/lib/format"
import { weightedAverage } from "@/lib/weights"

export function CarPriceBadge({
  cars,
  carId,
}: {
  cars: ScoreCar[]
  carId: string
}) {
  const { weights, customized } = useWeights()

  const scored = cars.map((car) => ({
    ...car,
    total: weightedAverage(car.scores, weights),
  }))
  const current = scored.find((car) => car.id === carId) ?? scored[0]
  const value = fairPrices(scored, (car) => car).get(current)

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/25 bg-lime/10 py-1.5 pr-2 pl-3 font-mono text-sm font-medium text-lime">
      {formatEuro(current.price)}
      {value && value.fairPrice !== null ? (
        <FairPriceInfo
          price={current.price}
          fairPrice={value.fairPrice}
          leaderPrice={value.leaderPrice}
          isBestValue={value.valueRank === 1}
          customized={customized}
          tone="dark"
          analytics={{ carro: current.id, origem: "dossie" }}
        />
      ) : null}
    </span>
  )
}

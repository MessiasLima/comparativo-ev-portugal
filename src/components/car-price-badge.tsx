"use client"

import { IdealPriceInfo } from "@/components/ideal-price-info"
import type { ScoreCar } from "@/components/weighted-score-panel"
import { useWeights } from "@/hooks/use-weights"
import { formatEuro } from "@/lib/format"
import { idealPrices } from "@/lib/ranking"
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
  const idealPrice = idealPrices(scored, (car) => car).get(current) ?? null
  const pricePerPoint = (car: (typeof scored)[number]) =>
    car.total > 0 ? car.price / car.total : Infinity
  const isBestValue = scored.every(
    (car) => pricePerPoint(current) - pricePerPoint(car) <= 0.000001,
  )

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/25 bg-lime/10 py-1.5 pr-2 pl-3 font-mono text-sm font-medium text-lime">
      {formatEuro(current.price)}
      {idealPrice !== null ? (
        <IdealPriceInfo
          price={current.price}
          idealPrice={idealPrice}
          isBestValue={isBestValue}
          customized={customized}
          tone="dark"
          analytics={{ carro: current.id, origem: "dossie" }}
        />
      ) : null}
    </span>
  )
}

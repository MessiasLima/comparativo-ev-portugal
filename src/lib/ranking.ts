const EPSILON = 0.000001

export interface RankableTotal {
  total: number
  price: number
}

/**
 * Ordem do ranking geral: maior nota global primeiro; com a mesma nota,
 * fica à frente o carro mais barato.
 */
export function compareByTotal(a: RankableTotal, b: RankableTotal): number {
  if (Math.abs(a.total - b.total) > EPSILON) return b.total - a.total
  return a.price - b.price
}

/**
 * Preço a partir do qual cada item passa a ter o menor €/ponto da lista:
 * nota global × menor €/ponto entre os restantes. Para o atual melhor
 * custo-benefício é o preço máximo até ao qual continua a sê-lo. Arredonda
 * para baixo ao euro, para que nesse preço o item fique à frente ou empatado.
 */
export function idealPrices<T>(
  items: T[],
  toRankable: (item: T) => RankableTotal,
): Map<T, number | null> {
  let lowest = Infinity
  let secondLowest = Infinity
  let lowestItem: T | undefined
  items.forEach((item) => {
    const { total, price } = toRankable(item)
    if (total <= 0) return
    const pricePerPoint = price / total
    if (pricePerPoint < lowest) {
      secondLowest = lowest
      lowest = pricePerPoint
      lowestItem = item
    } else if (pricePerPoint < secondLowest) {
      secondLowest = pricePerPoint
    }
  })

  const prices = new Map<T, number | null>()
  items.forEach((item) => {
    const { total } = toRankable(item)
    const target = item === lowestItem ? secondLowest : lowest
    prices.set(
      item,
      total > 0 && Number.isFinite(target) ? Math.floor(total * target) : null,
    )
  })
  return prices
}

/**
 * Posição de cada item no ranking geral. Só partilham posição os carros com a
 * mesma nota global e o mesmo preço.
 */
export function rankByTotal<T>(
  items: T[],
  toRankable: (item: T) => RankableTotal,
): Map<T, number> {
  const sorted = [...items].sort((a, b) =>
    compareByTotal(toRankable(a), toRankable(b)),
  )
  const ranks = new Map<T, number>()
  let rank = 1
  sorted.forEach((item, index) => {
    if (
      index > 0 &&
      compareByTotal(toRankable(sorted[index - 1]), toRankable(item)) !== 0
    ) {
      rank = index + 1
    }
    ranks.set(item, rank)
  })
  return ranks
}

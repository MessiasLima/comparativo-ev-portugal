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

const EPSILON = 0.000001
/** Constante de Huber: resíduos até 1,345 desvios contam por inteiro. */
const HUBER_K = 1.345
/** Converte o desvio absoluto mediano num desvio-padrão (distribuição normal). */
const MAD_TO_SD = 1.4826
const MAX_ITERATIONS = 50

export interface PricedItem {
  total: number
  price: number
  /** Modelo do carro (marca + modelo): as versões do mesmo modelo dividem um voto. */
  group: string
}

/** Preço médio = intercept + slope × nota global. */
export interface FairPriceLine {
  intercept: number
  slope: number
}

export interface FairPriceResult {
  /** O que a lista cobra, em média, por esta nota. Arredondado ao euro. */
  fairPrice: number | null
  /** Preço ÷ preço médio − 1: −0,20 é 20% abaixo do preço médio. */
  gap: number | null
  /**
   * Preço a partir do qual o carro passa a ter o melhor custo-benefício. Para
   * o atual líder é o preço máximo até ao qual continua a sê-lo.
   */
  leaderPrice: number | null
  /**
   * Posição no custo-benefício (menor gap primeiro). Empates partilham posição;
   * sem preço médio, fica fora da lista (número de itens + 1).
   */
  valueRank: number
}

interface Point {
  x: number
  y: number
  weight: number
}

function weightedLeastSquares(points: Point[]): FairPriceLine | null {
  const totalWeight = points.reduce((sum, point) => sum + point.weight, 0)
  if (totalWeight <= 0) return null

  const meanX = points.reduce((sum, point) => sum + point.weight * point.x, 0) / totalWeight
  const meanY = points.reduce((sum, point) => sum + point.weight * point.y, 0) / totalWeight
  let covariance = 0
  let variance = 0
  points.forEach((point) => {
    covariance += point.weight * (point.x - meanX) * (point.y - meanY)
    variance += point.weight * (point.x - meanX) ** 2
  })
  if (variance <= EPSILON) return null

  const slope = covariance / variance
  return { intercept: meanY - slope * meanX, slope }
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

/**
 * Recta preço × nota da lista. Cada modelo vale um voto, repartido pelas suas
 * versões, para que os modelos com muitas versões não puxem a recta para si. É
 * uma regressão robusta de Huber: os carros muito afastados da recta perdem
 * peso, para que um caso extremo não defina o preço médio dos restantes.
 */
export function fairPriceLine(items: PricedItem[]): FairPriceLine | null {
  const valid = items.filter((item) => item.total > 0)
  if (valid.length < 2) return null

  const versions = new Map<string, number>()
  valid.forEach((item) => versions.set(item.group, (versions.get(item.group) ?? 0) + 1))
  const baseWeights = valid.map((item) => 1 / (versions.get(item.group) ?? 1))

  let weights = baseWeights
  let line = weightedLeastSquares(
    valid.map((item, index) => ({ x: item.total, y: item.price, weight: weights[index] })),
  )
  if (!line) return null

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const current: FairPriceLine = line
    const residuals = valid.map(
      (item) => item.price - (current.intercept + current.slope * item.total),
    )
    const scale = MAD_TO_SD * median(residuals.map(Math.abs))
    if (scale <= EPSILON) break

    weights = baseWeights.map(
      (weight, index) => weight * Math.min(1, HUBER_K / Math.abs(residuals[index] / scale)),
    )
    const next = weightedLeastSquares(
      valid.map((item, index) => ({ x: item.total, y: item.price, weight: weights[index] })),
    )
    if (!next) break

    const converged =
      Math.abs(next.intercept - current.intercept) < EPSILON &&
      Math.abs(next.slope - current.slope) < EPSILON
    line = next
    if (converged) break
  }

  return line
}

/**
 * Preço médio, distância a esse preço e posição no custo-benefício de cada
 * item. Fica à frente quem mais abaixo do seu preço médio estiver.
 */
export function fairPrices<T>(
  items: T[],
  toPriced: (item: T) => PricedItem,
): Map<T, FairPriceResult> {
  const line = fairPriceLine(items.map(toPriced))

  const entries = items.map((item) => {
    const { total, price } = toPriced(item)
    const exactFairPrice = line && total > 0 ? line.intercept + line.slope * total : null
    const valid = exactFairPrice !== null && exactFairPrice > 0
    return {
      item,
      exactFairPrice: valid ? exactFairPrice : null,
      gap: valid ? price / exactFairPrice - 1 : null,
    }
  })

  let lowest = Infinity
  let secondLowest = Infinity
  let leader: T | undefined
  entries.forEach(({ item, gap }) => {
    if (gap === null) return
    if (gap < lowest) {
      secondLowest = lowest
      lowest = gap
      leader = item
    } else if (gap < secondLowest) {
      secondLowest = gap
    }
  })

  const ranked = entries
    .filter((entry) => entry.gap !== null)
    .sort((a, b) => (a.gap as number) - (b.gap as number))
  const ranks = new Map<T, number>()
  let rank = 1
  ranked.forEach((entry, index) => {
    if (index > 0 && (entry.gap as number) - (ranked[index - 1].gap as number) > EPSILON) {
      rank = index + 1
    }
    ranks.set(entry.item, rank)
  })

  const results = new Map<T, FairPriceResult>()
  entries.forEach(({ item, exactFairPrice, gap }) => {
    const target = item === leader ? secondLowest : lowest
    results.set(item, {
      fairPrice: exactFairPrice === null ? null : Math.round(exactFairPrice),
      gap,
      // Arredonda para baixo, para que nesse preço o carro fique à frente ou empatado.
      leaderPrice:
        exactFairPrice !== null && Number.isFinite(target)
          ? Math.floor(exactFairPrice * (1 + target))
          : null,
      // Sem preço médio fica depois de todos, mesmo que nenhum carro o tenha.
      valueRank: ranks.get(item) ?? items.length + 1,
    })
  })
  return results
}

/** Ordena pelo custo-benefício: menor gap primeiro e, sem preço médio, no fim. */
export function compareByGap(a: number | null, b: number | null): number {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return a - b
}

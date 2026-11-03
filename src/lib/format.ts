import type { Car } from "@/data/types"

const number0 = new Intl.NumberFormat("pt-PT", {
  maximumFractionDigits: 0,
  useGrouping: "always",
})

const number1 = new Intl.NumberFormat("pt-PT", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  useGrouping: "always",
})

const number2 = new Intl.NumberFormat("pt-PT", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: "always",
})

export function formatNumber(value: number): string {
  return number0.format(value)
}

/**
 * Nome público do carro, com a variante incluída.
 * "BYD Seal Design" e "BYD Seal Excellence AWD" nunca são apresentados só como
 * "BYD Seal", para que duas versões do mesmo modelo não se confundam.
 */
export function formatCarName(
  car: Pick<Car, "brand" | "model" | "variant">,
): string {
  return `${car.brand} ${car.model} ${car.variant}`
}

export function formatScore(value: number): string {
  return number1.format(value)
}

export function formatDecimal(value: number): string {
  return number2.format(value)
}

export function formatEuro(value: number): string {
  return `${number0.format(value)} €`
}

export function formatEuroExact(value: number): string {
  return `${number2.format(value)} €`
}

export function formatPercent(value: number): string {
  return `${number1.format(value)}%`
}

/** Trims prose for meta descriptions, cutting on a word boundary. */
export function truncateText(value: string, max = 160): string {
  const normalized = value.replace(/\s+/g, " ").trim()
  if (normalized.length <= max) return normalized
  const cut = normalized.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(" ")
  const body = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut
  return `${body.trimEnd()}…`
}

export function formatDatePt(isoDate: string): string {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${isoDate}T12:00:00`))
}

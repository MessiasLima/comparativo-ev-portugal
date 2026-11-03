/**
 * Public origin of the deployed site.
 *
 * - Production lives at https://comparativo-ev-portugal.appoutlet.dev (GitHub
 *   Pages with a custom domain), so the site is served from the domain root and
 *   `NEXT_PUBLIC_BASE_PATH` stays empty.
 * - `NEXT_PUBLIC_SITE_URL` can override the origin (e.g. a future domain change)
 *   and is what the deploy workflow sets.
 */
const FALLBACK_SITE_URL = "https://comparativo-ev-portugal.appoutlet.dev"

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "")
}

export const SITE_URL = trimTrailingSlash(
  process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL,
)

export const SITE_NAME = "Comparativo EV Portugal"

export const SITE_DESCRIPTION =
  "Compare carros elétricos no mercado português: autonomia, potência, equipamento, conforto e custo por ponto. Dez critérios, uma decisão."

export const SITE_LOCALE = "pt_PT"

/** Absolute URL for a site path, e.g. `/carros/x/`. */
export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${SITE_URL}${normalized === "/" ? "/" : normalized}`
}

/** Absolute URL for a file served from `public/`. */
export function publicAssetUrl(path: string): string {
  return absoluteUrl(path)
}

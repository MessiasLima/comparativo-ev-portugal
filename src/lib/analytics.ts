/**
 * Eventos personalizados do Umami.
 *
 * Não usamos `data-umami-event`: em links internos o script do Umami cancela o
 * clique e faz `location.href = …`, o que troca a navegação do Next por um
 * reload completo. Em vez disso, os elementos levam `data-track` (ver
 * `trackAttributes`) e o `AnalyticsListener` envia o evento com `umami.track`.
 */
export type AnalyticsEvent =
  /** Mudança de ordenação do ranking (cabeçalho, atalho, seletor ou inverter). */
  | "ranking-ordenar"
  /** Clique para abrir o dossiê de um carro. */
  | "abrir-dossie"
  | "prioridades-abrir"
  | "prioridades-aplicar"
  | "prioridades-cancelar"
  | "prioridades-repor"
  /** Tooltip do preço ideal aberto (uma vez por ícone). */
  | "preco-ideal-ver"
  /** Tooltip de explicação de um critério no cabeçalho da tabela. */
  | "criterio-explicacao-ver"
  /** Links de navegação interna (cabeçalho, hero, rodapé, voltar). */
  | "navegar"
  /** Atalho para uma secção do dossiê. */
  | "dossie-secao"
  /** Abrir ou fechar um critério no dossiê. */
  | "dossie-criterio"
  | "abrir-fonte"
  | "link-externo"

export type AnalyticsData = Record<string, string | number | boolean>

declare global {
  interface Window {
    umami?: { track: (event: string, data?: AnalyticsData) => unknown }
  }
}

export function trackEvent(event: AnalyticsEvent, data?: AnalyticsData) {
  if (typeof window === "undefined") return
  try {
    window.umami?.track(event, data)
  } catch {
    // Analytics nunca pode partir a página.
  }
}

/**
 * Atributos para marcar um elemento clicável, incluindo em Server Components.
 * As chaves de `data` devem ser minúsculas e sem hífen (passam a
 * `data-track-<chave>`).
 */
export function trackAttributes(
  event: AnalyticsEvent,
  data: Record<string, string | number | boolean | undefined> = {},
) {
  const attributes: Record<`data-${string}`, string> = { "data-track": event }
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) attributes[`data-track-${key}`] = String(value)
  }
  return attributes
}

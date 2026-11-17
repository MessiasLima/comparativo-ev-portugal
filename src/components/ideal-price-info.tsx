"use client"

import { useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Info } from "lucide-react"
import { cn } from "cn"
import { trackEvent } from "@/lib/analytics"
import { formatEuro, formatPercent } from "@/lib/format"

function IdealPriceTooltip({
  id,
  rect,
  price,
  idealPrice,
  isBestValue,
  customized,
}: {
  id: string
  rect: DOMRect
  price: number
  idealPrice: number
  isBestValue: boolean
  customized: boolean
}) {
  const width = Math.min(320, window.innerWidth - 24)
  const left = Math.min(
    Math.max(rect.left + rect.width / 2 - width / 2, 12),
    window.innerWidth - width - 12,
  )
  const estimatedHeight = 230
  const showAbove = rect.bottom + 10 + estimatedHeight > window.innerHeight
  const top = showAbove
    ? Math.max(rect.top - 10 - estimatedHeight, 8)
    : rect.bottom + 10

  const discount = price - idealPrice

  return createPortal(
    <div
      id={id}
      role="tooltip"
      style={{ top, left, width }}
      className="pointer-events-none fixed z-[90] animate-in fade-in-0 zoom-in-95 rounded-2xl border border-line bg-card p-4 text-left text-card-foreground shadow-[0_18px_50px_-20px_rgba(20,32,26,0.45)] duration-150"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
        Preço ideal
      </p>
      <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-sm">
        <dt className="text-muted-foreground">Preço atual</dt>
        <dd className="font-mono text-foreground">{formatEuro(price)}</dd>
        <dt className="text-muted-foreground">
          {isBestValue ? "Preço máximo" : "Preço ideal"}
        </dt>
        <dd className="font-mono font-semibold text-copper">
          {formatEuro(idealPrice)}
        </dd>
      </dl>
      <p className="mt-3 text-sm leading-6 text-foreground/80">
        {isBestValue ? (
          <>
            Já é o melhor custo-benefício. Continuaria a sê-lo até{" "}
            {formatEuro(idealPrice)}.
          </>
        ) : (
          <>
            Teria de custar menos {formatEuro(discount)} (−
            {formatPercent((discount / price) * 100)}) para ser o melhor
            custo-benefício. Uma promoção abaixo deste valor compensa.
          </>
        )}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {customized
          ? "Calculado com as suas prioridades."
          : "Calculado com todos os critérios a contar igual."}
      </p>
    </div>,
    document.body,
  )
}

/**
 * Ícone de informação ao lado de um preço. Ao passar o rato (ou tocar),
 * mostra o preço a que o carro passaria a ser o melhor custo-benefício.
 */
export function IdealPriceInfo({
  price,
  idealPrice,
  isBestValue,
  customized,
  tone = "light",
  analytics,
}: {
  price: number
  idealPrice: number
  isBestValue: boolean
  customized: boolean
  tone?: "light" | "dark"
  /** Identifica o carro e o sítio da página no evento do Umami. */
  analytics?: { carro: string; origem: string }
}) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const trackedRef = useRef(false)
  const tooltipId = useId()

  const show = () => {
    const nextRect = triggerRef.current?.getBoundingClientRect()
    if (!nextRect) return
    setRect(nextRect)
    // Só o primeiro tooltip conta: hover e foco repetem-se muito.
    if (!trackedRef.current) {
      trackedRef.current = true
      trackEvent("preco-ideal-ver", {
        ...analytics,
        melhorValor: isBestValue,
        personalizadas: customized,
      })
    }
  }
  const hide = () => setRect(null)

  useEffect(() => {
    if (!rect) return

    const close = () => setRect(null)
    window.addEventListener("scroll", close, true)
    window.addEventListener("resize", close)

    return () => {
      window.removeEventListener("scroll", close, true)
      window.removeEventListener("resize", close)
    }
  }, [rect])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Ver preço ideal para ser o melhor custo-benefício"
        aria-describedby={rect ? tooltipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        // Em ecrãs táteis não há hover: o toque abre e tocar fora fecha (blur).
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          show()
        }}
        className={cn(
          "inline-grid size-5 shrink-0 cursor-help place-items-center rounded-full transition-colors",
          tone === "dark"
            ? "text-lime/70 hover:text-lime"
            : "text-muted-foreground/60 hover:text-copper",
        )}
      >
        <Info className="size-3.5" aria-hidden="true" />
      </button>
      {rect ? (
        <IdealPriceTooltip
          id={tooltipId}
          rect={rect}
          price={price}
          idealPrice={idealPrice}
          isBestValue={isBestValue}
          customized={customized}
        />
      ) : null}
    </>
  )
}

"use client"

import { useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Info } from "lucide-react"
import { cn } from "cn"
import { trackEvent } from "@/lib/analytics"
import { formatEuro, formatSignedEuro, formatSignedPercent } from "@/lib/format"

/**
 * Cor da diferença face ao preço médio: verde quando o carro custa menos do que
 * a média, cobre quando custa mais. Uma diferença que arredonda para 0% fica neutra.
 */
export function differenceTextClass(
  percent: number,
  tone: "light" | "dark" = "light",
): string {
  const rounded = Math.round(percent)
  if (rounded === 0) return tone === "dark" ? "text-white" : "text-foreground"
  if (rounded < 0) return tone === "dark" ? "text-lime" : "text-saving"
  return tone === "dark" ? "text-copper-light" : "text-copper"
}

function FairPriceTooltip({
  id,
  rect,
  price,
  fairPrice,
  leaderPrice,
  isBestValue,
  customized,
}: {
  id: string
  rect: DOMRect
  price: number
  fairPrice: number
  leaderPrice: number | null
  isBestValue: boolean
  customized: boolean
}) {
  const width = Math.min(340, window.innerWidth - 24)
  const left = Math.min(
    Math.max(rect.left + rect.width / 2 - width / 2, 12),
    window.innerWidth - width - 12,
  )
  const estimatedHeight = 320
  const showAbove = rect.bottom + 10 + estimatedHeight > window.innerHeight
  const top = showAbove
    ? Math.max(rect.top - 10 - estimatedHeight, 8)
    : rect.bottom + 10

  const difference = price - fairPrice
  const differencePercent = (difference / fairPrice) * 100
  const leaderPercent =
    leaderPrice !== null ? ((leaderPrice - price) / price) * 100 : null

  return createPortal(
    <div
      id={id}
      role="tooltip"
      style={{ top, left, width }}
      className="pointer-events-none fixed z-[90] animate-in fade-in-0 zoom-in-95 rounded-2xl border border-line bg-card p-4 text-left text-card-foreground shadow-[0_18px_50px_-20px_rgba(20,32,26,0.45)] duration-150"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
        Preço médio
      </p>
      <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-sm">
        <dt className="text-muted-foreground">Preço atual</dt>
        <dd className="font-mono text-foreground">{formatEuro(price)}</dd>
        <dt className="text-muted-foreground">Preço médio</dt>
        <dd className="font-mono font-semibold text-foreground">
          {formatEuro(fairPrice)}
        </dd>
        <dt className="text-muted-foreground">Diferença</dt>
        <dd
          className={cn(
            "font-mono font-semibold",
            differenceTextClass(differencePercent),
          )}
        >
          {formatSignedEuro(difference)} ({formatSignedPercent(differencePercent)})
        </dd>
        {leaderPrice !== null && leaderPercent !== null ? (
          <>
            <dt className="text-muted-foreground">
              {isBestValue ? "1º até" : "Para ser o 1º"}
            </dt>
            <dd className="font-mono text-foreground">
              {formatEuro(leaderPrice)} ({formatSignedPercent(leaderPercent)})
            </dd>
          </>
        ) : null}
      </dl>
      <p className="mt-3 text-sm leading-6 text-foreground/80">
        {Math.round(difference) === 0
          ? "Custa o mesmo que a média da lista para esta nota."
          : difference < 0
            ? `Custa ${formatEuro(-difference)} menos do que a média da lista para esta nota.`
            : `Custa ${formatEuro(difference)} mais do que a média da lista para esta nota.`}{" "}
        {leaderPrice === null
          ? null
          : isBestValue
            ? `É o melhor custo-benefício e continuaria a sê-lo até ${formatEuro(leaderPrice)}.`
            : `Passaria a ser o melhor custo-benefício a ${formatEuro(leaderPrice)}.`}
      </p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        O preço médio é calculado com todos os carros da lista: quanto custa um
        carro com a mesma nota global.{" "}
        {customized
          ? "Calculado com as suas prioridades."
          : "Calculado com as prioridades por defeito."}
      </p>
    </div>,
    document.body,
  )
}

/**
 * Ícone de informação junto ao custo-benefício. Ao passar o rato (ou tocar),
 * mostra o preço médio da lista para a nota do carro, a diferença para o preço atual e o preço a
 * que passaria a ser o melhor custo-benefício.
 */
export function FairPriceInfo({
  price,
  fairPrice,
  leaderPrice,
  isBestValue,
  customized,
  tone = "light",
  analytics,
}: {
  price: number
  fairPrice: number
  leaderPrice: number | null
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
      trackEvent("preco-justo-ver", {
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
        aria-label="Ver preço médio e custo-benefício"
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
        <FairPriceTooltip
          id={tooltipId}
          rect={rect}
          price={price}
          fairPrice={fairPrice}
          leaderPrice={leaderPrice}
          isBestValue={isBestValue}
          customized={customized}
        />
      ) : null}
    </>
  )
}

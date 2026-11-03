"use client"

import { createPortal } from "react-dom"
import type { CriterionDefinition } from "@/data/types"

export function CriterionTooltip({
  criterion,
  rect,
}: {
  criterion: CriterionDefinition
  rect: DOMRect
}) {
  if (typeof window === "undefined") return null

  const width = Math.min(360, window.innerWidth - 24)
  const left = Math.min(
    Math.max(rect.left + rect.width / 2 - width / 2, 12),
    window.innerWidth - width - 12,
  )
  const estimatedHeight = 240
  const showAbove = rect.bottom + 10 + estimatedHeight > window.innerHeight
  const top = showAbove
    ? Math.max(rect.top - 10 - estimatedHeight, 8)
    : rect.bottom + 10

  const Icon = criterion.icon

  return createPortal(
    <div
      role="tooltip"
      style={{ top, left, width }}
      className="pointer-events-none fixed z-[90] animate-in fade-in-0 zoom-in-95 rounded-2xl border border-line bg-card p-4 text-card-foreground shadow-[0_18px_50px_-20px_rgba(20,32,26,0.45)] duration-150"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-forest text-lime">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
            Critério {criterion.number}
          </p>
          <p className="mt-0.5 font-heading text-base leading-tight font-semibold">
            {criterion.label}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium leading-6 text-foreground/80">
        {criterion.question}
      </p>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
        {criterion.description}
      </p>
    </div>,
    document.body,
  )
}

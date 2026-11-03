"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Check, RotateCcw, Settings2, X, type LucideIcon } from "lucide-react"
import type { CriterionId } from "@/data/types"
import { formatEuro, formatScore } from "@/lib/format"
import {
  DEFAULT_WEIGHTS,
  MAX_WEIGHT,
  MIN_WEIGHT,
  WEIGHT_STEP,
  isDefaultWeights,
  weightedAverage,
  type WeightMap,
} from "@/lib/weights"

export interface WeightCriterion {
  id: CriterionId
  label: string
  icon?: LucideIcon
}

export interface WeightPreviewCar {
  id: string
  name: string
  price: number
  scores: Record<CriterionId, number>
}

export function WeightModal({
  weights,
  criteria,
  cars,
  onChange,
  onClose,
}: {
  weights: WeightMap
  criteria: WeightCriterion[]
  cars: WeightPreviewCar[]
  onChange: (weights: WeightMap) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<WeightMap>(() => ({ ...weights }))
  const initialWeights = useRef<WeightMap>({ ...weights })
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const updateDraft = (next: WeightMap) => {
    setDraft(next)
    onChange(next)
  }

  const cancel = () => {
    onChange(initialWeights.current)
    onClose()
  }

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") cancel()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (typeof document === "undefined") return null

  const allEqual = isDefaultWeights(draft)
  const totalWeight = criteria.reduce(
    (sum, criterion) => sum + draft[criterion.id],
    0,
  )

  const preview = cars
    .map((car) => {
      const total = weightedAverage(car.scores, draft)
      return {
        ...car,
        total,
        pricePerPoint: total > 0 ? car.price / total : 0,
      }
    })
    .sort((a, b) => b.total - a.total)

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/75 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) cancel()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="weights-modal-title"
        className="flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line bg-card text-card-foreground shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-forest text-lime">
              <Settings2 className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-copper">
                Configuração
              </p>
              <h2
                id="weights-modal-title"
                className="mt-1 font-heading text-xl font-semibold tracking-[-0.02em]"
              >
                Pesos das notas
              </h2>
              <p className="mt-1 max-w-lg text-sm leading-6 text-muted-foreground">
                Cada peso é um multiplicador da nota do critério:{" "}
                <span className="font-medium text-foreground">×1</span> mantém o
                peso base, <span className="font-medium text-foreground">×2</span>{" "}
                duplica-o e <span className="font-medium text-foreground">×0</span>{" "}
                anula o critério. A nota global é a média ponderada. Move os
                sliders — tudo recalcula em tempo real; Cancelar repõe os pesos
                anteriores.
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={cancel}
            aria-label="Fechar configuração de pesos"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-3 text-xs text-muted-foreground">
            <span>
              {allEqual
                ? "Pesos iguais em todos os critérios"
                : "Pesos personalizados"}
            </span>
            <span className="font-mono">
              soma: {formatScore(totalWeight)} · {MIN_WEIGHT} a {MAX_WEIGHT}
            </span>
          </div>

          <div className="divide-y divide-line">
            {criteria.map((criterion) => {
              const value = draft[criterion.id]
              const inputId = `weight-${criterion.id}`
              const Icon = criterion.icon

              return (
                <div key={criterion.id} className="py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      {Icon ? (
                        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-forest">
                          <Icon className="size-3.5" aria-hidden="true" />
                        </span>
                      ) : null}
                      <label
                        htmlFor={inputId}
                        className="text-sm font-medium text-foreground"
                      >
                        {criterion.label}
                      </label>
                    </div>
                    <span className="inline-flex min-w-11 items-center justify-center rounded-full bg-muted px-2 py-0.5 font-mono text-xs font-semibold">
                      ×{formatScore(value)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {MIN_WEIGHT}
                    </span>
                    <input
                      id={inputId}
                      type="range"
                      min={MIN_WEIGHT}
                      max={MAX_WEIGHT}
                      step={WEIGHT_STEP}
                      value={value}
                      onChange={(event) =>
                        updateDraft({
                          ...draft,
                          [criterion.id]: Number(event.target.value),
                        })
                      }
                      aria-label={`Peso de ${criterion.label}`}
                      className="h-2 w-full cursor-pointer accent-[var(--color-forest)]"
                    />
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {MAX_WEIGHT}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {cars.length > 0 ? (
          <div className="border-t border-line px-5 py-3.5 sm:px-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Resultado com estes pesos
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              {preview.map((car, index) => (
                <div
                  key={car.id}
                  className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2"
                >
                  <span className="font-mono text-[11px] text-muted-foreground">
                    #{index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {car.name}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatEuro(car.pricePerPoint)}/ponto
                  </span>
                  <span
                    className={
                      index === 0
                        ? "font-heading text-base font-semibold text-forest"
                        : "font-heading text-base font-semibold text-foreground/70"
                    }
                  >
                    {formatScore(car.total)}
                    <span className="ml-0.5 text-[10px] font-medium text-muted-foreground">
                      /10
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-muted/30 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => updateDraft({ ...DEFAULT_WEIGHTS })}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            Repor iguais
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={cancel}
              className="inline-flex h-9 items-center rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-forest px-4 text-xs font-semibold text-paper transition-colors hover:bg-forest/90"
            >
              <Check className="size-3.5 text-lime" />
              Aplicar pesos
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Check, RotateCcw, Settings2, X, type LucideIcon } from "lucide-react"
import { cn } from "cn"
import type { CriterionId } from "@/data/types"
import {
  CRITERION_IDS,
  DEFAULT_WEIGHTS,
  WEIGHT_LEVELS,
  isDefaultWeights,
  type WeightMap,
} from "@/lib/weights"

// Uma cor por nível, por ordem de WEIGHT_LEVELS. "Não me importa" é cinzento
// (desligado); daí em diante é o verde da marca cada vez mais intenso, para
// que mais importância se leia como "mais", nunca como alerta.
// `dot` marca os botões não escolhidos.
const LEVEL_STYLES = [
  {
    selected: "border-stone-400 bg-stone-200 text-stone-700",
    hover: "hover:border-stone-400",
    dot: "bg-stone-300 ring-1 ring-stone-400",
  },
  {
    selected: "border-forest/25 bg-lime/35 text-forest",
    hover: "hover:border-forest/40",
    dot: "bg-lime/60 ring-1 ring-forest/30",
  },
  {
    selected: "border-forest/40 bg-lime text-ink",
    hover: "hover:border-forest/60",
    dot: "bg-lime ring-1 ring-forest/40",
  },
  {
    selected: "border-emerald-700 bg-emerald-700 text-white",
    hover: "hover:border-emerald-700",
    dot: "bg-emerald-700",
  },
  {
    selected: "border-forest bg-forest text-lime",
    hover: "hover:border-forest",
    dot: "bg-forest",
  },
]

export interface WeightCriterion {
  id: CriterionId
  label: string
  icon?: LucideIcon
}

export function WeightModal({
  weights,
  criteria,
  onChange,
  onClose,
}: {
  weights: WeightMap
  criteria: WeightCriterion[]
  onChange: (weights: WeightMap) => void
  onClose: () => void
}) {
  // Os pesos só chegam ao ranking em Aplicar; até lá ficam neste rascunho.
  const [draft, setDraft] = useState<WeightMap>(() => ({ ...weights }))
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const cancel = onClose

  const apply = () => {
    onChange(draft)
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
  const pending = CRITERION_IDS.some((id) => draft[id] !== weights[id])

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
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-forest text-lime">
              <Settings2 className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
                Prioridades
              </p>
              <h2
                id="weights-modal-title"
                className="mt-1 font-heading text-xl font-semibold tracking-[-0.02em]"
              >
                O que é importante para si?
              </h2>
              <p className="mt-1 max-w-lg text-sm leading-6 text-muted-foreground">
                Escolha quanto lhe importa cada critério. A nota global, o
                €/ponto e o ranking só são recalculados quando clicar em{" "}
                <span className="font-medium text-foreground">Aplicar</span>.
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={cancel}
            aria-label="Fechar sem aplicar"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-3 text-sm text-muted-foreground">
            <span>
              {allEqual
                ? "Todos os critérios contam igual"
                : "Prioridades personalizadas"}
            </span>
            {pending ? (
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-copper">
                Alterações por aplicar
              </span>
            ) : null}
          </div>

          <div className="divide-y divide-line">
            {criteria.map((criterion) => {
              const value = draft[criterion.id]
              const labelId = `weight-${criterion.id}`
              const Icon = criterion.icon

              return (
                <div key={criterion.id} className="py-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    {Icon ? (
                      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-forest">
                        <Icon className="size-3.5" aria-hidden="true" />
                      </span>
                    ) : null}
                    <span
                      id={labelId}
                      className="text-sm font-medium text-foreground"
                    >
                      {criterion.label}
                    </span>
                  </div>
                  <div
                    role="radiogroup"
                    aria-labelledby={labelId}
                    className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-5"
                  >
                    {WEIGHT_LEVELS.map((level, index) => {
                      const selected = value === level.value
                      const style = LEVEL_STYLES[index]
                      return (
                        <button
                          key={level.value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              [criterion.id]: level.value,
                            }))
                          }
                          className={cn(
                            "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border px-2 py-1.5 text-xs leading-snug font-medium transition-colors",
                            index === WEIGHT_LEVELS.length - 1 &&
                              "col-span-2 sm:col-span-1",
                            selected
                              ? style.selected
                              : cn(
                                  "border-line bg-card text-muted-foreground hover:text-foreground",
                                  style.hover,
                                ),
                          )}
                        >
                          {selected ? null : (
                            <span
                              aria-hidden="true"
                              className={cn(
                                "size-2 shrink-0 rounded-full",
                                style.dot,
                              )}
                            />
                          )}
                          {level.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-muted/30 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => setDraft({ ...DEFAULT_WEIGHTS })}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-card px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            Repor iguais
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={cancel}
              className="inline-flex h-10 items-center rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={apply}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-forest px-4 text-sm font-semibold text-paper transition-colors hover:bg-forest/90"
            >
              <Check className="size-3.5 text-lime" />
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

import { Check, Minus, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CHECKLIST,
} from "@/data/equipment"
import { formatEuro, formatScore } from "@/lib/format"
import type { ScoredCar } from "@/lib/scoring"
import { ScoreBar } from "@/components/score"

export function EquipmentChecklist({ entry }: { entry: ScoredCar }) {
  const included = new Set(entry.car.equipmentIncluded)
  const total = EQUIPMENT_CHECKLIST.length
  const score = entry.criteria.equipment.score

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Checklist normalizada
            </p>
            <p className="mt-2 font-heading text-3xl font-semibold tracking-[-0.03em]">
              {entry.equipmentCount}
              <span className="text-lg text-muted-foreground"> / {total}</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Equipamentos de série ou incluídos na configuração avaliada.
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl font-semibold">
              {formatScore(score)}
              <span className="text-sm text-muted-foreground">/10</span>
            </p>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              nota no critério
            </p>
          </div>
        </div>
        <ScoreBar score={score} className="mt-5" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {EQUIPMENT_CATEGORIES.map((category) => {
          const items = EQUIPMENT_CHECKLIST.filter(
            (item) => item.category === category,
          )
          const count = items.filter((item) => included.has(item.id)).length

          return (
            <div
              key={category}
              className="rounded-2xl border border-line bg-card p-5"
            >
              <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                <h3 className="font-heading text-base font-semibold">{category}</h3>
                <Badge variant="outline" className="font-mono text-xs">
                  {count}/{items.length}
                </Badge>
              </div>
              <ul className="mt-3 space-y-2.5">
                {items.map((item) => {
                  const has = included.has(item.id)
                  return (
                    <li
                      key={item.id}
                      className={
                        has
                          ? "flex items-start gap-2.5 text-sm leading-6"
                          : "flex items-start gap-2.5 text-sm leading-6 text-muted-foreground/55"
                      }
                    >
                      <span
                        className={
                          has
                            ? "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-lime text-ink"
                            : "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border border-line text-muted-foreground/50"
                        }
                      >
                        {has ? (
                          <Check className="size-2.5" strokeWidth={3} />
                        ) : (
                          <Minus className="size-2.5" />
                        )}
                      </span>
                      <span className={has ? "" : "line-through decoration-line"}>
                        {item.label}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Opcionais
            </p>
            <h3 className="mt-1 font-heading text-lg font-semibold">
              {entry.car.options.length > 0
                ? "Incluídos nesta configuração"
                : "Sem opções relevantes"}
            </h3>
          </div>
          <Plus className="size-4 text-muted-foreground" />
        </div>

        {entry.car.options.length > 0 ? (
          <ul className="mt-4 divide-y divide-line">
            {entry.car.options.map((option) => (
              <li
                key={option.name}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
              >
                <div>
                  <p className="text-sm font-medium">{option.name}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-sm text-muted-foreground">
                  {formatEuro(option.price)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Esta configuração já inclui o equipamento relevante de série. As
            únicas escolhas ficam por conta da cor e de eventuais acessórios do
            concessionário.
          </p>
        )}
      </div>
    </div>
  )
}

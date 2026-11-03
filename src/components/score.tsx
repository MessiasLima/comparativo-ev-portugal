import { cn } from "cn"
import { formatScore } from "@/lib/format"

export const ACCENT_HEX = {
  copper: "#9a4f2f",
  ocean: "#2f5f8f",
} as const

export const ACCENT_TEXT = {
  copper: "text-copper",
  ocean: "text-ocean",
} as const

export const ACCENT_BG = {
  copper: "bg-copper",
  ocean: "bg-ocean",
} as const

export function ScoreBar({
  score,
  color,
  className,
}: {
  score: number
  color?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-foreground/10",
        className,
      )}
    >
      <div
        className="h-full rounded-full transition-[width]"
        style={{
          width: `${Math.max(0, Math.min(100, score * 10))}%`,
          backgroundColor: color ?? "var(--color-forest)",
        }}
      />
    </div>
  )
}

export function ScorePill({
  score,
  className,
}: {
  score: number
  className?: string
}) {
  const tone =
    score >= 9.5
      ? "bg-lime text-ink"
      : score >= 8.5
        ? "bg-forest text-paper"
        : score >= 7.5
          ? "bg-forest/10 text-forest"
          : score >= 6.5
            ? "bg-copper/10 text-copper"
            : "bg-destructive/10 text-destructive"

  return (
    <span
      className={cn(
        "inline-flex min-w-11 items-center justify-center rounded-full px-2 py-0.5 font-mono text-xs font-semibold tabular-nums",
        tone,
        className,
      )}
    >
      {formatScore(score)}
    </span>
  )
}

export function ScoreCell({
  score,
  accent,
  className,
}: {
  score: number
  accent: "copper" | "ocean"
  className?: string
}) {
  return (
    <div className={cn("flex min-w-11 flex-col gap-1.5", className)}>
      <span className="font-mono text-sm font-semibold tabular-nums">
        {formatScore(score)}
      </span>
      <ScoreBar score={score} color={ACCENT_HEX[accent]} />
    </div>
  )
}

export function RankBadge({
  rank,
  className,
}: {
  rank: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full border font-mono text-xs font-semibold tabular-nums",
        rank === 1
          ? "border-lime bg-lime text-ink"
          : "border-line bg-card text-muted-foreground",
        className,
      )}
    >
      {rank}
    </span>
  )
}

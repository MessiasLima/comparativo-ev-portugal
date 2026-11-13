---
name: evaluate-power-to-weight
description: Verify the declared system power and running-order weight for a specific electric car version in Comparativo EV Portugal. Use when adding or updating `specs.powerHp` or `specs.weightKg`, including when sources disagree.
---

# Evaluate power-to-weight inputs

Use this workflow when setting or changing the power or weight inputs for a car
dossier. The criterion uses the declared system power in cv and the vehicle's
running-order weight in kg. The raw ratio is calculated in cv/kg; the interface
displays its equivalent in cv/t by multiplying by 1,000. This is a relative
criterion: the car with the highest ratio gets 10, and the other cars receive
proportional scores calculated by `src/lib/scoring.ts`. Store only the raw power and
weight values; never save the ratio or score in a dossier.

## Phase 1 — Confirm the evaluated version

Verify model year, market, trim, drivetrain and fitted configuration. Use power and
weight figures for that exact version. Do not combine the power of one trim with the
weight of another, or infer a version's value from a model-wide range.

## Phase 2 — Confirm the source values and units

- **Power:** use the manufacturer's declared system power for the version, in cv.
  For a multi-motor vehicle, use the declared combined system output; do not add
  individual motor peaks unless the manufacturer declares that sum as system power.
- **Weight:** use kerb/running-order weight, in kg, without occupants or payload.
  Do not use gross vehicle weight, maximum authorised mass or a figure that includes
  a driver as the dossier's `weightKg`.
- Prefer official Portuguese/European technical material for the exact version and
  cross-check with another reliable source where available. If sources differ, check
  that they describe the same version and weight definition, then retain the best
  supported source values and document a material unresolved discrepancy.

The dossier has separate `powerKw` and `powerHp` fields. Keep units explicit and
consistent: `powerHp` is cv and `weightKg` is kg. If the official power is published
only in kW, convert it to cv consistently with the project's existing convention
(`1 kW = 1.35962 cv`) and retain the source's original value for cross-checking.
Never place a kW value in `powerHp` or a weight in any unit other than kg in
`weightKg`.

## Phase 3 — Record and verify

1. Set `specs.powerHp` to the verified system output in cv and `specs.weightKg` to
   the verified running-order weight in kg. Keep `powerKw` consistent with the same
   system output.
2. Do not store a manually calculated cv/kg ratio, cv/t value or criterion score.
   The app calculates `powerHp / weightKg` in cv/kg, displays the equivalent
   cv/t (`powerHp / weightKg × 1,000`) and calculates the relative score through
   `src/lib/scoring.ts`.
3. Run `npm run validate:data`. Then confirm the cv/t value shown in the interface
   matches `round((powerHp / weightKg) × 1000)` for that dossier.

Do not change the scoring formula or re-evaluate existing cars as part of verifying
one car's inputs unless the user separately asks for that work.

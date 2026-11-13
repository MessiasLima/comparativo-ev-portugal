---
name: evaluate-charging
description: Verify the AC onboard and DC fast-charging power for a specific electric car configuration in Comparativo EV Portugal. Use when adding or updating `charging.acKw` or `charging.dcKw`, including when optional charging equipment or conflicting sources are involved.
---

# Evaluate charging power

Use this workflow when setting or changing `charging.acKw` or `charging.dcKw` in
a car dossier. These raw peak power values feed the existing charging index:
`70% × DC peak + 30% × AC peak`. Store the powers in kW; do not store the calculated
index or criterion score.

## Phase 1 — Confirm the evaluated configuration

Verify model year, market, version/trim and the equipment included in the evaluated
configuration. Charging capability may vary with version, battery, market, model
year and fitted or optional charging equipment. Do not assume an optional onboard
charger or charging upgrade is present unless it is included in the evaluated
configuration.

## Phase 2 — Verify the peak power values

- **DC (`charging.dcKw`):** use the vehicle's maximum supported DC charging power
  (peak), in kW, for the evaluated configuration. Confirm the published figure
  applies to the relevant battery/version and charging conditions where stated.
- **AC (`charging.acKw`):** use the maximum AC power accepted by the onboard charger
  fitted to the evaluated configuration, in kW. Account for optional higher-power
  onboard chargers only when they are included in that configuration.
- Prefer official Portuguese/European technical specifications, configurators or
  market-specific documents for the exact version. Cross-check with another
  authoritative source where possible and record the sources in the dossier.
- Keep peak power distinct from the average power over a charging session or curve.
  A peak is the maximum rate under suitable conditions; it does not describe how
  long that rate is sustained. Do not substitute average charging power for either
  `dcKw` or `acKw`.

Battery voltage architecture (such as 400 V or 800 V) may be recorded as factual
context when verified, but it is not an additional scored input. Do not infer the
vehicle's charging power from voltage alone: battery design, thermal management,
vehicle controls and charger capability also constrain the power actually achieved.
Scoring both voltage architecture and charging power would count overlapping
benefits.

If sources disagree, first confirm that they describe the same version, market,
model year and included charging equipment. Prefer the most specific applicable
official source for the evaluated configuration. Use independent sources to
investigate discrepancies, not to override a more specific official figure. Note a
material unresolved discrepancy and its sources in the dossier rather than
silently choosing a more favourable number.

## Phase 3 — Distinguish supporting charging data

Charging times such as 10–80% or 30–80%, connector type and voltage compatibility
are useful supporting specifications, but they do not enter the current 70/30
charging index. Keep published time figures tied to their stated conditions; do not
convert them into a replacement peak-power value. Battery voltage architecture is
also context only and does not receive a separate score.

## Phase 4 — Record and verify

1. Set `charging.dcKw` and `charging.acKw` to the verified peak values in kW for the
   evaluated configuration. Do not include units in the JSON numbers or store the
   calculated index or score.
2. Run `npm run validate:data`.
3. Confirm that the interface shows DC and AC powers in kW and that the charging
   index matches `0.7 × dcKw + 0.3 × acKw` before relative scoring. The criterion
   direction remains higher-is-better; do not change `src/lib/scoring.ts`.

Do not re-evaluate existing cars as part of verifying one car's charging inputs
unless the user separately asks for that work.

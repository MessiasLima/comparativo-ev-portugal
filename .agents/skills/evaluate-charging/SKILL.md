---
name: evaluate-charging
description: Verify the DC fast-charging power (and record the AC onboard power) for a specific electric car configuration in Comparativo EV Portugal. Use when adding or updating `charging.dcKw` or `charging.acKw`, including when optional charging equipment or conflicting sources are involved.
---

# Evaluate charging power

Use this workflow when setting or changing `charging.dcKw` or `charging.acKw` in
a car dossier.

**Only DC peak power is scored.** The charging criterion is relative and its raw
value is `charging.dcKw`: the best car in the list gets 10 and the others their
proportion. AC power is recorded as a factual specification and shown in the
dossier, but it does not enter the score, because it does not separate the cars in
this comparison (every current car accepts 11 kW). Do not reintroduce an AC weight
or a composite index. Store the powers in kW; never store a calculated index or
criterion score.

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
  This is the only value that affects the criterion score.
- **AC (`charging.acKw`):** use the maximum AC power accepted by the onboard charger
  fitted to the evaluated configuration, in kW. Account for optional higher-power
  onboard chargers only when they are included in that configuration. Record it for
  the spec sheet; it does not change the score.
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
are useful supporting specifications, but they are not scored. Keep published time
figures tied to their stated conditions; do not convert them into a replacement
peak-power value. Battery voltage architecture is also context only and does not
receive a separate score.

## Phase 4 — Record and verify

1. Set `charging.dcKw` and `charging.acKw` to the verified peak values in kW for the
   evaluated configuration. Do not include units in the JSON numbers or store the
   calculated score.
2. Run `npm run validate:data`.
3. Confirm that the interface shows DC and AC powers in kW and that the criterion's
   raw label shows only the DC peak. Verify that the score equals
   `dcKw / bestDcKw × 10` (clamped to 10) against the current line-up. The criterion
   direction remains higher-is-better.

Do not re-evaluate existing cars as part of verifying one car's charging inputs
unless the user separately asks for that work.

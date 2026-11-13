---
name: evaluate-efficiency
description: Verify the combined WLTP energy consumption for a specific electric car version and record the raw value in its dossier. Use when adding or updating `specs.consumptionKwh100`, including when sources disagree.
---

# Evaluate energy efficiency

Use this workflow whenever setting or changing `specs.consumptionKwh100`. Record
the combined WLTP consumption in kWh/100 km for the exact evaluated version. This
is an objective relative criterion where lower consumption is better: the lowest
value gets 10, and other cars receive proportional scores calculated by
`src/lib/scoring.ts`. Store only the raw consumption value; never save a score or
ranking in the dossier.

## Phase 1 — Confirm the evaluated configuration

Check the model year, Portuguese-market version/trim and evaluated configuration.
WLTP consumption can vary with:

- **Version and drivetrain:** motor, battery and drivetrain differences can change
  the homologated value.
- **Wheels and tyres:** wheel size and tyre specification can affect consumption.
- **Equipment and options:** fitted equipment can affect mass or aerodynamics.
- **Market and model year:** specifications and homologation values may differ by
  market or model year.

Use the figure for the dossier's actual version and configuration. Do not transfer a
value from a sibling trim or assume a generic model figure applies.

## Phase 2 — Verify the combined WLTP value

Prefer the manufacturer's official Portuguese or European specification, offer or
configurator for the exact version, stating **combined WLTP consumption** in
kWh/100 km. Cross-check against another official source or a reputable independent
database where possible. Record consulted sources in the dossier and cite relevant
source IDs from the efficiency review.

If sources disagree, first check version, model year, wheels, equipment and market.
Then use the most specific applicable official Portuguese/European combined WLTP
figure. A market-specific official offer or configurator for the evaluated
configuration takes precedence over a generic model page. Use independent sources to
identify or explain a discrepancy, not to replace a more specific official value.
If a material discrepancy remains, briefly describe the competing values and their
sources in the review summary while keeping one supported value in
`specs.consumptionKwh100`.

Never replace the combined WLTP value with consumption measured in a road test,
real-world owner data, or another test cycle. Such figures may be included as
clearly labelled context in prose, but they must not be confused with the raw
combined WLTP input.

## Phase 3 — Record and verify

1. Set `specs.consumptionKwh100` to the verified combined WLTP value as a positive
   number in kWh/100 km. Do not add the unit to the JSON number or store a score.
2. Run `npm run validate:data` and confirm the displayed consumption is in
   kWh/100 km and matches the dossier value.
3. Confirm the criterion remains lower-is-better: a lower raw consumption must
   receive an equal or higher relative score than a higher consumption. Do not
   change the criterion direction or relative scoring formula.

Do not change `src/lib/scoring.ts` or re-evaluate existing cars as part of verifying
one consumption value unless the user separately asks for that work.

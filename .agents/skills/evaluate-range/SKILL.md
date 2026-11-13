---
name: evaluate-range
description: Verify the official combined WLTP range for a specific electric car version and record the raw value in its dossier. Use when adding or updating `specs.rangeKm`, including when sources disagree; do not use for real-world range estimates or range scoring.
---

# Evaluate WLTP range

Use this workflow whenever setting or changing `specs.rangeKm` in a car dossier.
Record the advertised combined WLTP range for the evaluated version, in kilometres.
This is an objective relative criterion: the car with the highest range gets 10 and
the other cars receive proportional scores calculated by `src/lib/scoring.ts`. Store
only the raw range value; never calculate or save scores or positions in a dossier.

## Phase 1 — Identify the exact configuration

Confirm the dossier's model year, Portuguese-market version/trim and evaluated
configuration. WLTP range can change with:

- **Version and drivetrain:** motor count, power and battery can have distinct
  homologation values, including within the same model year.
- **Wheels and tyres:** wheel size and tyre specification can change the approved
  range. Use the value for the fitted/evaluated wheel configuration where available.
- **Equipment and options:** factory-fitted options or packages may affect mass or
  aerodynamics and therefore the homologated figure.
- **Market and model year:** figures published for another country or model year
  may reflect a different specification or approval.

Do not transfer a figure from a sibling trim or a generic model page without
confirming it applies to the dossier's configuration. If an official source gives a
range of values, establish which endpoint/configuration matches the evaluated car;
do not select the most favourable figure by default.

## Phase 2 — Verify the homologated value

Use the manufacturer's official Portuguese or European material that advertises the
**combined WLTP** range for the exact version: a market-specific specification,
offer or configurator is preferred. Cross-check against another official document
or a reputable independent database where possible. Record consulted sources in the
dossier and cite relevant source IDs from the range review.

When sources conflict, first check version, model year, wheels, options and market.
Then use the most specific applicable official Portuguese/European advertised
combined WLTP figure. An official offer or configurator for the evaluated
configuration takes precedence over a generic model page. Use an independent
database to identify or explain a discrepancy, not to override a more specific
official value. Briefly document a material unresolved discrepancy in the review
summary, naming the values and sources, while keeping one supported value in
`specs.rangeKm`.

Never substitute EPA, CLTC, NEDC, or real-world/tested range for the combined WLTP
value. City-only or other WLTP sub-cycle figures are not combined WLTP range. They
may appear as separately labelled context in prose, as may real-world estimates, but
must not be confused with or contradict the dossier's homologated combined value.

## Phase 3 — Record and verify

1. Set `specs.rangeKm` to the verified combined WLTP figure as a raw number in km.
   Do not add units to the JSON number and do not store a score or ranking.
2. Keep any other range figures in prose clearly labelled by cycle/configuration
   (for example, city WLTP or an independent real-world estimate). Every mention of
   the homologated combined range must agree with `specs.rangeKm`; correct stale or
   conflicting mentions rather than leaving competing combined WLTP values in the
   same dossier.
3. Ensure the value is a positive number expressed in kilometres, and run
   `npm run validate:data`.
4. Review all range figures in that dossier, including its specs, review and verdict:
   there must be no unexplained divergent values presented as the same combined WLTP
   range. Explicitly labelled city figures, different wheel configurations and
   real-world estimates are acceptable when their basis is clear.

Do not change `src/lib/scoring.ts` or re-evaluate other cars as part of verifying a
single range value unless the user separately asks for that work.

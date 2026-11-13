---
name: evaluate-satisfaction
description: Research and assess owner satisfaction, recurring defects and safety recalls for an electric car model in Comparativo EV Portugal. Use when adding or updating `reviews.satisfaction` or its assessment.
---

# Evaluate user satisfaction

Use this workflow when preparing or updating `reviews.satisfaction`. The rubric
combines model-specific owner sentiment, recurring defects and the model's safety
recall record. Follow the existing calculation and evidence caps in
`src/lib/satisfaction.ts`; do not alter its formula, weights or caps.

Keep model-level ownership evidence separate from brand-wide reputation, service
quality or brand satisfaction. Brand-level surveys may provide context only when
they do not report results for the specific model; do not treat them as direct
model evidence or double-count the brand assessment.

## Phase 1 — Gather model-specific evidence

- **Owner sentiment (40%):** use model-specific owner surveys, verified owner
  reports and independent long-term tests. Note sample size, market, model year and
  how representative the source is. Separate a reviewer's driving impressions from
  actual long-term ownership findings.
- **Recurring defects (35%):** identify repeated owner-reported problems, then check
  their frequency, severity, affected versions and corroboration across independent
  sources. Distinguish a repeated pattern from isolated anecdotes. Never compare raw
  forum-post or complaint counts as rates without a comparable vehicle-population
  or mileage denominator; do not infer reliability from the number of search results.
- **Safety recalls (25%):** check official manufacturer and regulator recall
  records for the model and relevant markets. Record the search date, jurisdiction,
  model/build range, affected population when available, remedy status and whether
  the exact vehicle requires a VIN lookup. Distinguish safety recalls from service
  campaigns, software updates and warranty actions; do not score those as recalls
  unless an authority identifies them as safety recalls.

If a recall search returns no result, describe only what was searched (source,
market and date). An empty or unavailable register is not proof that the model has
no recalls. Where coverage is incomplete or status cannot be established, reflect
that uncertainty in the `recallRecord` mark and `evidenceLevel`, avoid awarding a
perfect component mark, and explain the limitation in the summary. Do not claim that
no recalls exist globally based on a single national database.

Record sources actually consulted in the car's `sources` array and cite them from
`reviews.satisfaction.sourceIds`. Prefer independent owner evidence and media for
sentiment/defects; use manufacturers and regulators to establish recall facts and
campaign scope.

## Phase 2 — Set component marks and evidence level

Assign each component a raw mark from 0 to 10 based on the direction and strength of
the evidence: stronger owner satisfaction supports a higher `ownerSentiment` mark;
more frequent, severe and corroborated defects lower `reportedDefects`; a cleaner,
well-documented safety-recall record supports a higher `recallRecord` mark. Consider
the relevant market, model year and affected vehicles, and do not equate missing
evidence with positive evidence.

Set `evidenceLevel` to describe the model's **post-market evidence coverage**, not
the car's quality or the tone of the findings:

- **`limited`:** little time on sale, small or sparse model-specific owner sample,
  few independent long-term observations, or major gaps in relevant recall/defect
  coverage.
- **`moderate`:** meaningful time on sale and evidence from multiple sources or
  evidence types, but the model-specific sample or market/recall coverage remains
  incomplete.
- **`broad`:** sustained market exposure and substantial model-specific evidence
  across owner feedback, defect reporting and relevant safety-recall records, with
  no major coverage gaps.

Apply the existing per-component caps exactly as defined in
`SATISFACTION_EVIDENCE_CAPS` in `src/lib/satisfaction.ts`:

| Evidence level | Owner sentiment cap | Reported defects cap | Recall record cap |
| --- | ---: | ---: | ---: |
| `limited` | 7.5 | 6.5 | 7.0 |
| `moderate` | 9.0 | 8.5 | 8.5 |
| `broad` | 10.0 | 10.0 | 10.0 |

The assessment stores evidence-based raw component marks. The scorer applies these
caps before weighting. The weights are 40% owner sentiment, 35% reported defects
and 25% recall record; use `satisfactionScore()` rather than calculating a second
result manually. Existing dossiers are useful calibration examples, not targets to
reproduce or a reason to reassess them.

## Phase 3 — Write the review

Populate `reviews.satisfaction.assessment` with exactly these fields:

- `ownerSentiment`: finite numeric mark from 0 to 10;
- `reportedDefects`: finite numeric mark from 0 to 10;
- `recallRecord`: finite numeric mark from 0 to 10;
- `evidenceLevel`: `limited`, `moderate` or `broad`.

Write `summary`, `pros` and `cons` in European Portuguese (pt-PT). Explain the
model-specific evidence, recurring patterns or positive ownership signals, scope
and date of recall searches, and any uncertainty or sample limitations. Do not
present raw complaint counts as incidence rates without exposure denominators. Add
consulted source IDs to `sourceIds`; each ID must exist in that car's `sources`.

## Phase 4 — Verify

1. Run `npm run validate:data` and resolve errors in assessment fields or sources.
2. Call `satisfactionScore(assessment)` from `src/lib/satisfaction.ts` and confirm
   the displayed rubric index applies the configured caps and weights. Do not store
   this calculated index or the final list-relative score in JSON.
3. Check that each component respects its evidence-level cap in the UI, and that the
   summary does not imply that an incomplete or geographically limited recall search
   proves a clean global record.

Do not change `src/lib/satisfaction.ts` or re-evaluate existing cars unless the user
separately asks for that work.

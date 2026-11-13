---
name: add-criteria
description: Add a new comparison criterion to the Comparativo EV Portugal project. Use this skill whenever the user proposes, requests, or asks to add a criterion or evaluation dimension to the electric-car ranking, including requests to score all existing cars on a new factor. It guides criterion design, exhaustive car-by-car research, scoring-model and UI/data changes, ranking recalculation, and validation.
---

# Add a criterion to Comparativo EV Portugal

Use this workflow when a user provides the proposed criterion's name and description. The goal is not merely to add another label: define a fair, buyer-useful comparison, support it with evidence for every evaluated car, integrate it throughout the app, and verify that its scores make sense.

## Principles

1. **All user-facing copy is European Portuguese (pt-PT).** Keep code identifiers in the project's conventions (usually English/camelCase) and match the existing criterion labels and tone.
2. **Design for an EV buyer.** Translate the user's wording into a practical purchase question. Include benefits and drawbacks a buyer can actually experience; avoid proxies that are easy to count but weakly related to the criterion.
3. **Keep the criterion distinct.** Compare it with all existing dimensions in `src/data/criteria.ts`. Avoid double-counting the same attribute (for example, charging speed under both charging and trip convenience) unless the new criterion measures a clearly different buyer outcome and the overlap is explained.
4. **Set the rubric before researching scores.** Define what raises or lowers a mark, what evidence qualifies, and how to handle missing or conflicting evidence. Do not shape the rubric around a desired ranking.
5. **Score each evaluated car independently and honestly.** Research the actual version/configuration in each `src/data/cars/*.json`, not a different trim or an unconfigured option. Use existing sources and add relevant sources to each car's `sources` array; cite them from the new review's `sourceIds`.
6. **Keep source data separate from calculated results.** The scoring engine calculates relative criterion scores and overall ranks. Store defensible raw inputs or an editorial `baseScore`/rubric components, not cached final scores or ranks.
7. **Adding a criterion changes the whole ranking.** The default weight is normally 1, so a new criterion changes the average and can change every car's total, rank, and price-per-point. Recalculate and review all cars, not only the apparent winner.

## Phase 0 — Intake and criterion design

1. Capture the criterion name and user description. If either is missing, ask for it. Check whether it already exists under another name; clarify whether the request is a rename/refinement or a genuinely new dimension before proceeding.
2. Read `src/data/criteria.ts`, `src/data/types.ts`, `src/lib/scoring.ts`, and the relevant UI. Understand how current criteria are evaluated and identify the closest existing criteria.
3. Write down the buyer-facing question this criterion answers and why it matters when choosing an EV in Portugal. Define its scope, relevant use cases, and explicit exclusions to limit overlap.
4. Decide what earns or loses points. Define the evidence hierarchy, the measurement unit or rubric, and how uncertainty/absence of data affects an evaluation. Apply the same rules to every car.
5. Choose the scoring implementation deliberately:
   - **Objective, relative:** use a published/measurable raw value and define its direction (`higher` or `lower`). Store the raw input in an existing canonical field where possible; if a new field is needed, extend the TypeScript data model and validation. Implement its metric and display label in the scoring and validator code. When evaluating or changing existing inputs, follow [`evaluate-range`](../evaluate-range/SKILL.md) for `rangeKm`, [`evaluate-power-to-weight`](../evaluate-power-to-weight/SKILL.md) for `powerHp`/`weightKg`, and [`evaluate-efficiency`](../evaluate-efficiency/SKILL.md) for `consumptionKwh100`; do not duplicate their verification guidance here.
      For the existing `equipment` criterion or changes to its normalized checklist,
      follow [`evaluate-equipment`](../evaluate-equipment/SKILL.md) for feature
      mapping, relevance decisions and re-auditing; do not duplicate that workflow
      or change the existing scoring formula as part of an equipment assessment.
   - **Editorial, relative:** use `baseScore` from 0–10 in each car's review,
     supported by evidence. The existing scorer scales this against the best car,
     so the `baseScore` is an evidence-based judgement, not a precomputed relative
     result. For the existing suspension-comfort criterion, follow
     [`evaluate-comfort`](../evaluate-comfort/SKILL.md); for the existing sound
     criterion, follow [`evaluate-sound`](../evaluate-sound/SKILL.md); do not
     duplicate their evaluation guidance.
    - **Rubric or absolute:** use only when an explicit, reusable rubric is genuinely better than relative comparison. Add a typed per-car assessment, a single scoring function, validation, and UI to expose its components. For the existing interior and brand assessments, follow [`evaluate-interior`](../evaluate-interior/SKILL.md) and [`evaluate-brand`](../evaluate-brand/SKILL.md), respectively. For an unrelated rubric, use existing implementations only as architectural patterns; do not copy their evaluation guidance or couple the new criterion to their specific logic.
   - If none fits cleanly, update the type and scoring architecture explicitly rather than smuggling raw measurements into prose or misusing an existing field.
6. Choose a unique camelCase `CriterionId`, display order/number, pt-PT label, short label, question, description, Lucide icon, kind, direction, scale, and default weight. Use weight `1` unless the user or a documented methodology calls for a different neutral baseline. Explain any non-neutral weight.
7. Before editing, identify whether the proposed criterion is useful and sufficiently evidence-based across the current cars. If it cannot be evaluated fairly for every car, explain the gap and ask how to proceed rather than silently assigning zeros or guessing.

## Phase 1 — Exhaustive, car-by-car research

1. Enumerate every actual car/version JSON in `src/data/cars/` and reconcile it with the registered `CARS` list in `src/data/cars/index.ts`. Score every current entry.
2. For each car, inspect existing source links and reviews first, then research the criterion specifically. Prefer, in order as applicable: official Portuguese/European technical and ownership information; homologation or regulator/standards data; independent tests and specialist publications; credible owner surveys and communities. Use sources that speak directly to the criterion, not generic car reviews alone.
3. Verify the exact trim, model year, market and evaluated options. A feature available as an optional pack is not present unless the dossier's evaluated configuration includes it.
4. Cross-check quantitative inputs where possible. Record units and definitions consistently (e.g. test method, operating conditions, measurement basis). Resolve source conflicts using the most authoritative source and disclose material uncertainty in the review prose.
5. Add every useful source to that car's `sources` array using the existing `Source` shape and allowed source type. Use meaningful unique IDs. Add the IDs used by this criterion to `reviews.<criterionId>.sourceIds`. Never cite a source that was not consulted, and never leave a dangling source ID.
6. Build a compact evidence matrix before assigning marks: one row per car, with the relevant input/evidence, source IDs, uncertainty, and provisional assessment. This makes inconsistent standards visible before implementation.
7. Assign the raw value, editorial `baseScore`, or rubric components based on the agreed methodology. Add a clear pt-PT `summary`, concrete `pros` and `cons` where useful, and source references. Do not store the calculated relative score in the car JSON.

## Phase 2 — Integrate the criterion across the project

First trace every use of the criteria registry and ID type. Search the repository for `CriterionId`, `CRITERIA`, `reviews.` and hardcoded criterion counts; do not assume that the requested example files are the only affected places.

At minimum, inspect and update as needed:

| File/area | Required consideration |
| --- | --- |
| `src/data/types.ts` | Add the new ID to `CriterionId`; add/update raw input or assessment types if required. `Car.reviews` is a record, so every dossier needs the new review. |
| `src/data/criteria.ts` | Add the definition in the intended order with unique number, labels, question, description, icon, kind, direction, scale and weight. |
| `src/lib/scoring.ts` | Implement the raw metric and user-visible `rawLabel`; handle any absolute rubric through a dedicated scorer. Ensure the formula and direction match the criterion definition. |
| `scripts/validate-data.mjs` | Keep its criterion schema, validation and metric calculation in sync with the TypeScript scorer. Validate new raw values/review fields and preserve the ranking preview. |
| `src/data/cars/*.json` | Add the criterion review/input for **every** car and add useful sources/source IDs. Keep existing review content and car-specific sources intact. |
| `src/components/criterion-list.tsx` | Generic editorial/objective criteria render from `CRITERIA`; add custom UI only if the new rubric or interaction requires it. Keep special cases narrowly scoped. |
| `src/components/ranking-table.tsx` | Update the exhaustive `compactLabels` map and any criterion-specific sorting/display logic. |
| `src/components/weight-modal.tsx`, `src/lib/weights.ts`, `src/components/weighted-score-panel.tsx`, `src/app/page.tsx`, `src/app/carros/[slug]/page.tsx`, `src/components/methodology.tsx` | Check criterion-ID records, labels, counts, methodology text and criterion-dependent UI. Registry-derived portions may need no code change, but verify them. |
| Documentation and skills | Update README/methodology text and the `add-car` skill plus its JSON-schema reference where they hardcode the criterion count or the list of criteria. Future car additions must know to provide this review. |

Use the project's existing design patterns and avoid unnecessary component special-casing. If code changes involve Next.js-specific APIs or conventions, read the relevant guide in `node_modules/next/dist/docs/` first, as required by `AGENTS.md`.

### Scoring and data safeguards

- Relative criteria currently score proportionally against the best raw value; for a lower-is-better metric, the lowest positive value is best. Check for zero, missing, invalid, or incomparable data so the formula cannot produce `NaN`, infinity, or reward missing evidence.
- Do not change the scale or direction of existing criteria as a side effect. Do not alter existing weights unless the user asks or the methodology change is explicitly justified.
- If adding a rubric, centralize its calculation and use the same function in application scoring and validation. Display its components in the criterion detail so a reader can understand the score.
- Keep comparative prose stable. Avoid claims such as “best in the list” or hardcoded criterion counts in JSON/docs; these go stale when cars or criteria change. Named-car comparisons are acceptable only when verified.
- Preserve any user changes already present in the working tree. Inspect diffs before editing shared files and do not revert unrelated work.

## Phase 3 — Sanity-check the results and recalculate

1. Run `npm run validate:data` and resolve all errors. Confirm the reported car count matches the registry and each car has exactly the expected set of reviews.
2. Independently recalculate the new criterion's raw values and resulting scores for all cars from the documented formula. Check units, direction, rounding, ties, bounds, and special cases. Confirm the validator and `src/lib/scoring.ts` agree.
3. **Reflect on every mark and the ordering.** Compare cars against the evidence matrix and methodology, not against the outcome you hoped for. Ask:
   - Does a higher/lower raw value actually represent a better buyer outcome?
   - Are scores proportionate to meaningful real-world differences, or is a small numeric advantage producing a misleading gap?
   - Are cars with limited evidence being treated fairly and consistently?
   - Does the criterion duplicate another criterion or disproportionately reward one category/trim?
   - Do the highest and lowest assessments make sense when compared with source evidence and known competitors?
4. If the result seems wrong, first revisit data, assumptions, definitions, or the formula. Do not tune an individual car's score to force a preferred rank. If the methodology itself is flawed, revise it consistently for every car and explain the change.
5. Re-run the full overall ranking and price-per-point calculation. Check how much the new criterion changes each car's total and rank; explain surprising movements. Search all car reviews and dossier prose for claims invalidated by the new ranking or criterion count, and update them.
6. Check the UI in the ranking and at least one car dossier: criterion label/order, icon, raw value/rank, score, description, evidence/pros/cons, source links, weighting controls, and methodology text. Confirm the new criterion can be selected/sorted/weighted where applicable.
7. Run `npx tsc --noEmit`, `npm run lint`, and `npm run build` in addition to `npm run validate:data`. Fix failures caused by the change; report unrelated pre-existing failures separately.

## Phase 4 — Report completion

Summarize in pt-PT:

- the criterion's buyer-facing meaning and scoring method (including direction/scale/weight);
- the main research evidence and any source conflicts or limitations;
- each car's raw assessment and resulting criterion score, plus a brief explanation of the ordering;
- overall ranking changes and any surprising movements;
- files updated and validation/build results;
- anything uncertain or unavailable.

Do not create a separate report file unless the user asks for one.

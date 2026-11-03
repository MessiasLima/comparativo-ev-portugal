---
name: add-car
description: Add a new electric car (and each of its versions) to the Comparativo EV Portugal ranking — exhaustive research from user-provided material and the web, equipment checklist updates with re-audit of all existing cars, dossier JSON creation, UI updates, and full recalculation of all relative scores and comparative notes. Use this skill whenever the user wants to add, register, or create a dossier for a car in this project (e.g. "add the Tesla Model 3", "mete o MG4 na lista", "create the dossier for this offer"), provides car material such as a PDF offer, spec sheet, or links, or asks to update an existing car's data or re-verify the ranking after any data change.
---

# Add a car to Comparativo EV Portugal

This skill adds one or more cars to the EV comparison site. It is a full pipeline:
research → equipment checklist → dossier JSON(s) → registration + UI → recalculate
and verify everything. The phases must run in order, because each one feeds the next.

## Non-negotiable rules

1. **All user-facing content is written in European Portuguese (pt-PT)**, matching the
   tone and style of the existing dossiers. Study `src/data/cars/cupra-raval-vz.json`
   and `src/data/cars/byd-seal-excellence-awd.json` before writing anything.
2. **JSON files store data, never results.** No scores, rankings, "best of list"
   claims, or €/ponto values belong in the JSON as *numbers* — those are computed by
   `src/lib/scoring.ts`. The interior criterion follows the same rule: store the
   rubric components in `reviews.interior.assessment`, never the resulting score.
   Comparative *prose* in reviews/dossiers is allowed (and expected), but must be
   re-verified in Phase 5.
3. **Scoring is relative — except for the interior.** In each relative criterion the
   best car in the list gets 10 and the others get their proportion. Adding one car
   changes the score, rank, €/ponto and value-rank of **every** car. The interior
   uses an absolute rubric (`src/lib/interior.ts`), so it does not move when the
   line-up changes. Phase 5 is not optional either way.
4. **Every claim needs a source.** Each `reviews.<criterion>.sourceIds` entry must
   reference a source declared in the same JSON's `sources` array. The validator
   (`npm run validate:data`) enforces this — use it early and often.
5. **Exhaustiveness over speed.** The user asked for exhaustive research. Cross-check
   every spec between the provided material, the official Portuguese site, and at
   least one independent database (e.g. EV Database). When sources disagree, prefer
   the official WLTP/PT figure and note the discrepancy in the prose (see how the
   CUPRA Raval dossier mentions both 389 km and 384 km).
6. **This project runs Next.js 16**, which differs from what you may know. If you
   have to write or modify Next.js-specific code (routes, metadata, params), first
   read the relevant guide in `node_modules/next/dist/docs/` as instructed by the
   repo's `AGENTS.md`. Most of this skill's work is data-only and needs none of that.
7. **No list-relative claims in JSON prose.** Never write "o mais caro da lista",
   "a maior autonomia da lista", "o melhor consumo da lista", "líder", "melhor
   custo por ponto" or hardcoded counts like "29 dos 38 equipamentos": they are
   static text and silently become false when a car or checklist item is added.
   Write stable facts instead ("Preço de €50.926 com IVA", "570 km WLTP") or
   comparisons against a named car ("consome 1,6 kWh menos do que o Excellence"),
   which stay true regardless of new entries. The UI calculates ranks and counts
   dynamically; the prose must not duplicate them.
8. **Never hardcode a calculated value, in JSON or in UI copy.** Notes, rubric
   indices, ranks, "#2 da lista", €/ponto, "lidera 3 dos 10 critérios" and every
   count that follows the line-up or the registry (cars, criteria, checklist items)
   must be rendered from data: `CRITERIA.length`, `EQUIPMENT_CHECKLIST.length`,
   `comparison.cars.length`, or the `rawLabel`/`score`/`rank` fields of a `ScoredCar`.
   A literal "dez critérios", "38 equipamentos" or "Rubrica 6,9 → 10,0" in a component
   string goes stale the moment a car, a checklist item or a criterion is added, and
   then contradicts the engine on the same screen. When a number has to appear in
   copy, template it from its source of truth; when it cannot be templated (e.g.
   Markdown docs), update it in the same change and flag it in the report.

## Architecture you must understand before starting

| File | Role |
| --- | --- |
| `src/data/types.ts` | The `Car` interface and the `accent` union (`"copper" \| "ocean"`). Source of truth for the JSON shape. |
| `src/data/cars/*.json` | One JSON per car **version**. Data only. |
| `src/data/cars/index.ts` | Registry: imports every JSON and exports the `CARS` array. Order here controls the footer (first 4 entries). |
| `src/data/equipment.ts` | `EQUIPMENT_CHECKLIST` (the normalized feature list) + `EQUIPMENT_CATEGORIES`. |
| `src/data/criteria.ts` | The criterion definitions. Current set: 2 editorial (`comfort`, `sound` — need a human-style `baseScore`), 3 rubrics (`interior`, `brand`, `satisfaction` — need their typed `assessment`; interior is absolute, brand and satisfaction are relative), and 5 objective (`equipment`, `range`, `powerToWeight`, `efficiency`, `charging` — computed from specs). Check the live registry and `CriterionId` before preparing reviews; the `add-criteria` skill documents how the set evolves. |
| `src/lib/scoring.ts` | The scoring engine. `equipment` = count of checklist ids; `powerToWeight` = cv/kg; `charging` = 0.7·DC + 0.3·AC; `efficiency` = lower is better. Relative criteria rescale against the best car; interior is absolute. |
| `src/lib/interior.ts` | Interior rubric: 40% soft-touch, 25% upholstery/leather, 20% design, 15% assembly, minus a hard-plastic penalty, with a hard-plastic cap. Never duplicate these weights in JSON or prose. |
| `src/data/site.ts` | `SITE_UPDATED_AT` — editorial "last updated" date, shown in the footer. |
| `scripts/validate-data.mjs` | Validator + ranking preview. Run with `npm run validate:data`. |
| `public/sources/` | User-provided PDFs (offers, product guides), referenced from JSON as `/sources/<file>` with `type: "pdf"`. |

The UI is almost entirely data-driven (hero counts, ranking table, footer, dossier
routes via `generateStaticParams`). The hardcoded exceptions are
listed in Phase 4 — those are the only UI files you may need to touch.

---

## Phase 0 — Intake

1. Identify what the user provided: car name and, ideally, materials (PDF offer,
   product guide, links). Check `public/sources/` for PDFs that may already be there.
2. Determine the **scope of versions** for the Portuguese market. Every version the
   user wants compared becomes a separate dossier entry (see Phase 3, rule A).
   If the user did not specify versions, list the PT-market versions you find during
   research and **ask which ones to include** before writing files.
3. Determine the **pricing basis**: base PVP vs. a configured proposal with options.
   Existing entries use configured proposals when the user supplied one (CUPRA) and
   PVP when they didn't (BYD). Ask the user if ambiguous — the choice affects price,
   `options`, and which equipment counts as "included".
4. If key material is missing (no price, no specs), ask the user before researching
   everything twice. Otherwise proceed.

## Phase 1 — Exhaustive research

Read `references/research-guide.md` for the full source strategy, per-criterion
evidence checklist, and conflict-resolution rules. In summary:

1. **Read the provided material first** (read PDFs directly with the `read` tool).
   Copy any new PDF into `public/sources/` with a kebab-case name like
   `tesla-model-3-oferta.pdf`.
2. **Research the web** for, in order of trust: official brand PT site (specs, price,
   equipment, warranty, dealer network) → official configurator/proposal → EV
   Database → press reviews → owner communities → satisfaction surveys.
   Use web search/fetch tools for each car version. If your runtime has subagents,
   parallelize: one subagent per research domain (press reviews, owner satisfaction,
   equipment extraction, PT market/pricing).
3. Build a **research dossier** (in your head or as scratch notes) with: versions,
   PT prices (IVA included, dated), full specs (WLTP), charging, warranty, equipment
    list, evidence for each editorial criterion and each rubric assessment, and
   URLs for every source.
4. For **satisfaction**, look for press verdicts, owner forums/Facebook groups, and
   brand-level surveys (e.g. Driver Power). For a brand new model, say so explicitly
   in the prose, like the CUPRA dossier does.

Do not skip evidence gathering for editorial criteria — each `baseScore` and each
interior rubric component must be defensible from the sources you cite.

## Phase 2 — Equipment checklist (feature list)

Goal: the new car's features are mapped to the normalized checklist; features that
don't exist yet in the checklist are added as new entries.

1. Read `src/data/equipment.ts` fully.
2. Map every feature of the new car (from the PDF, configurator, and press reviews)
   to existing checklist ids. Only ids present in the checklist may go into
   `equipmentIncluded` — the validator rejects unknown ids.
3. For features with no matching id, **add new items** to `EQUIPMENT_CHECKLIST`:
   - One line per item, exact format: `{ id: "kebab-case-id", label: "…", category: "…" }`
     (the validator parses items with a regex that expects this single-line shape).
   - `id`: kebab-case, unique, English-ish tokens like the existing ones
     (`heat-pump`, `large-screen`).
   - `label`: pt-PT, phrased like the existing items.
   - `category`: one of the existing `EQUIPMENT_CATEGORIES` (add a new category to
     that array only for a genuinely new domain, e.g. "Desempenho" — and then check
     that `src/components/equipment-checklist.tsx` renders it correctly, which it
     does generically).
   - Place the item inside the block of its category, in a sensible position.
4. **Re-audit every existing car.** This is the step people forget: a new checklist
   item changes the denominator shown to all cars (`X/41` instead of `X/38`) and the
   relative equipment score. For each new id, verify whether each existing car's
   *evaluated configuration* has that feature (check its sources/PDF/configurator)
   and add the id to its `equipmentIncluded` if so. Do not guess — a wrong "no"
   unfairly penalizes an existing car; a wrong "yes" is fabrication.
5. **Keep the checklist totals derived, never literal.** `src/data/criteria.ts`
   builds the equipment description from `EQUIPMENT_CHECKLIST.length` and
   `EQUIPMENT_CATEGORIES`, and the UI (`equipment-checklist.tsx`,
   `weighted-score-panel.tsx`, the equipment section in `carros/[slug]/page.tsx`)
   uses `EQUIPMENT_CHECKLIST.length` too: adding items must change every count by
   itself. Do not reintroduce a literal "38" anywhere in `src/`. The only literal
   left is in `README.md` (the data tree and the checklist sentence) — update it
   there in the same change and call it out in the report. Grep to confirm:
   `grep -rnE "\b38\b|/ ?38" src README.md` (word-bounded so "389 km" doesn't match).
6. Also update the `equipment` criterion `description` in `criteria.ts` if the
   categories or item count language changed — the numbers are interpolated, so only
   wording changes need attention.

## Phase 3 — Create the dossier JSON(s)

Read `references/car-json-schema.md` for the complete field-by-field spec, the
template skeleton, and formatting conventions. Core rules:

- **A. One file per version.** If the car has more than one version in scope, each
  version is a separate, complete entry with its own `id`, `slug`, `version`,
  price, specs, equipment, and reviews — exactly like `byd-seal-design.json` and
  `byd-seal-excellence-awd.json` are siblings. Don't invent "shared" files.
- **B. File name and slug**: kebab-case `brand-model-versionsuffix.json`
  (e.g. `mg4-trophy.json`, `tesla-model-3-long-range.json`). `slug` = `id`.
  Both must be unique across all cars (validator enforces).
- **C. Fill every field of the `Car` interface** — provide a review for every ID in
  `CriterionId`/`CRITERIA`. Editorial criteria require an evidence-based
  `baseScore` 0–10; rubric criteria require their own typed `assessment` (never
  `baseScore`); objective criteria store their underlying data without a score.
  For the current brand rubric, follow `src/lib/brand.ts` and the `brand`
  assessment shape in `src/data/types.ts`. Plus the full `dossier` (headline, verdict, ~5 pros, ~5 cons, `bestFor`,
  ~6 sections), `options` (or `[]`), and `sources` with real URLs.
- **D. Score the interior from evidence, not from the line-up.** The rubric
  components are absolute 0–10 judgements:
  `softTouch` = soft-touch coverage on contact surfaces; `upholstery` = leather or
  quality vegan, stitching, seats/steering wheel; `design` = restrained, coherent
  sophistication (showy/gratuitous design scores lower); `assembly` = solidity and
  squeak-free build. `hardPlastic` is the share of visible/touchable hard plastic:
  `low`, `moderate`, `high` (cap 7.0) or `extensive` (cap 5.5). A cabin that is
  mostly hard plastic must never score near 9.
- **E. Portuguese prose, decimal commas in text** ("15,79 kWh/100 km"), plain JSON
  numbers in fields. Prices in EUR, `vatIncluded: true`, dated `asOf`.
- **F. Write reviews at the quality bar of the existing dossiers**: concrete numbers,
  honest cons, 2–4 sentences per summary, 2–3 pros and cons each, real `sourceIds`.

## Phase 4 — Registration and UI updates

1. **Register the car(s)** in `src/data/cars/index.ts`: add the import and extend the
   `CARS` array. Mind the order — the footer shows the first 4 entries of this array
   (plus a "Ver todos" link when there are more). If the list now has more than 4
   cars, decide deliberately which 4 appear in the footer.
2. **Update `SITE_UPDATED_AT`** in `src/data/site.ts` to today's date (`YYYY-MM-DD`).
3. **Check the accent colors.** `accent` is a closed union `"copper" | "ocean"`
   (`src/data/types.ts`, `src/components/score.tsx` maps, `globals.css` variables,
   and the `ComparisonRow` type in `ranking-table.tsx`). Reuse an existing accent
   whenever acceptable. If a genuinely new accent is needed, extend **all** of those
   places consistently (define the CSS variable in `src/app/globals.css` following
   `--color-copper`/`--color-ocean`, and pick a color that reads well on both light
   and dark backgrounds).
4. **Generalize per-car hardcoded UI text.** `src/components/equipment-checklist.tsx`
   has a fallback paragraph for cars with zero `options` that is hardcoded for the
   BYD Excellence ("A versão Excellence AWD já inclui…"). If the new car also has no
   options, make that text generic or data-driven instead of adding another
   special case.
5. **Sweep for other stale references**: README's routes list and data-structure
   tree (they enumerate cars and JSON files), and any component that names a
   specific car. Grep for the existing cars' names to find spots that assume the
   current line-up.
6. **Sweep for hardcoded calculated values in copy.** No component may print a
   number that the engine computes. Grep for numeric literals next to words like
   critérios/equipamentos/carros and for rank or score sentences:
   `grep -rnE "[0-9]+\s*(critérios|equipamentos|carros)|dos [0-9]+|#1|melhor da lista|lidera [0-9]" src`
   (plus `criteria.ts`, `methodology.tsx`, `weighted-score-panel.tsx`,
   `ranking-table.tsx`, `site-url.ts`). Every count must come from
   `CRITERIA.length`, `EQUIPMENT_CHECKLIST.length` or `comparison.cars.length`, and
   every note from `rawLabel`/`score`/`rank` on a `ScoredCar`. If you add copy that
   mentions a count, template it — never type the number.
7. Nothing else should need changes: the hero counts, ranking table, weights modal,
   dossier routes and footer links are all derived from the registry and the scoring
   engine. Every public car name is `brand + model + variant` through
   `formatCarName()`, so a new version cannot be confused with a sibling.

## Phase 5 — Recalculate and verify everything

This is the phase the user cares about most: notes are awarded by comparing cars
with each other, so a new car invalidates every previous score and comparative
sentence. Read `references/verification-checklist.md` and execute it in full.
The essential steps:

1. `npm run validate:data` — must pass with zero errors; it also prints the new
   ranking and cost-benefit table. If it fails, fix the data before anything else.
2. **Hand-check the math** for the new car(s): recompute at least one objective
   criterion score by hand from the formulas in `src/lib/scoring.ts` and the
   interior score from the rubric in `src/lib/interior.ts`, then confirm both match
   the validator's output. Check that a car with `hardPlastic: "high"` or
   `"extensive"` actually respects the 7.0/5.5 cap.
3. **List-relative claims sweep.** Read every car's `reviews` and `dossier` prose
   (old cars included) and make sure it contains **no** claim that depends on the
   current line-up: "melhor consumo da lista", "o mais barato", "o mais caro",
   "líder", "melhor custo por ponto", counts like "29 dos 38 equipamentos", etc.
   They go stale as soon as a car or checklist item is added, so replace them with
   stable facts ("570 km WLTP", "Preço de €50.926 com IVA"). Grep helps
   (`da lista|na lista|o mais |a mais |melhor da lista|pior da lista|38`) but
   judgment is yours. Comparisons against a **named** car ("fica atrás do Seal",
   "o Design consome menos do que o Excellence") are allowed — verify they are
   still numerically true and keep them scoped to those cars. Also grep each
   dossier for the names of the other cars.
4. **Score-explanation check.** Open the new dossier's criteria section and read the
   "Como se chega à nota" line of all ten criteria. It is generated from
   `rawLabel`/`score`/`rank`, so it doubles as a consistency test: every relative
   criterion where the car ranks #1 must display 10,0; the interior must say
   "escala absoluta" and show its rubric index; lower-is-better criteria (eficiência)
   must say "menor consumo", not "melhor valor". A mismatch means the scorer or the
   label is wrong — fix the engine, never the copy. Also confirm the row caption reads
   "relativa à lista" or "escala absoluta" and that the badge (`dado`/`rubrica`
   /`editorial`) matches `criterion.kind`.
5. **Name and variant check.** Every car has a `variant` (trim) and a public name
   `brand + model + variant` rendered by `formatCarName()`. Adding a version of an
   existing model must not create a duplicate public name — the validator checks
   this. Confirm the new name appears correctly in the ranking table, weights
   modal, dossier hero and footer, and that sibling versions read as separate cars.
6. `npm run lint` and `npm run build` — both must pass.
7. Optionally `npm run dev` and eyeball: `/` (hero counts, table, footer),
   `/carros/<new-slug>` (all sections), and one existing dossier (scores,
   equipment checklist shows the new total and the derived counts).

## Phase 6 — Final report to the user

Summarize in chat (do not create a report file unless asked):
- The new ranking and €/ponto table (from the validator output)
- Files created/modified, new equipment ids added and which existing cars gained them
- Comparative claims in old dossiers that were corrected
- Sources relied on, and any spec discrepancies found between sources
- Anything you could not verify and assumptions you made

## Quick reference — files this skill touches

| File | Action |
| --- | --- |
| `src/data/cars/<brand-model-version>.json` | create (one per version) |
| `src/data/cars/index.ts` | register import(s) + `CARS` |
| `src/data/equipment.ts` | add new checklist items |
| `src/data/cars/*.json` (existing) | re-audit `equipmentIncluded`; fix stale comparative prose (Phase 5) |
| `src/data/site.ts` | bump `SITE_UPDATED_AT` |
| `src/data/criteria.ts` | equipment description is derived from `EQUIPMENT_CHECKLIST`/`EQUIPMENT_CATEGORIES` — keep it derived |
| `src/lib/scoring.ts` | confirm the interior rubric is applied absolutely; `rawLabel` is the only place a raw value is formatted for display |
| `src/lib/interior.ts` | rubric weights, penalties and caps — single source of truth |
| `src/components/criterion-list.tsx` | renders the rubric breakdown and the derived "Como se chega à nota" explanation for every criterion |
| `src/components/equipment-checklist.tsx` | equipment counts and present/absent states come from the checklist |
| `README.md` | routes list, data tree, checklist count |
| `public/sources/` | copy provided PDFs |

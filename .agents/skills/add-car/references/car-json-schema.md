# Car JSON schema — complete field guide

One JSON file per car version lives in `src/data/cars/`. The TypeScript source of
truth is the `Car` interface in `src/data/types.ts` — if this document and the
interface ever disagree, the interface wins (and this document should be fixed).

Before writing a new file, read at least one existing dossier end-to-end
(`cupra-raval-vz.json` is the richest example; `byd-seal-design.json` and
`byd-seal-excellence-awd.json` show the multi-version pattern).

## Naming

- File name: `brand-model-versionsuffix.json`, kebab-case, lowercase.
  Examples: `cupra-raval-vz.json`, `byd-seal-excellence-awd.json`.
- `id` and `slug`: identical, equal to the file name without `.json`.
  Must be unique across all cars (the validator rejects duplicates).
- `variant` (display string): the commercial trim, e.g. `"VZ"`, `"Design"`,
  `"Excellence AWD"`. Combined with brand and model it forms the public name
  (`formatCarName()`), so sibling versions never appear as the same car. The
  validator rejects a car without a variant and duplicate public names.
- `version` (display string): the full version/configuration, e.g. `"VZ 55 kWh"`,
  `"Design 82,5 kWh"`, `"Excellence AWD 82,5 kWh"`.

## Top-level fields

| Field | Type | Rules |
| --- | --- | --- |
| `id` | string | See naming above. |
| `slug` | string | Same as `id`. |
| `brand` | string | Display brand, uppercase as marketed (`"CUPRA"`, `"BYD"`). |
| `model` | string | Model name (`"Raval"`, `"Seal"`). |
| `variant` | string | Commercial trim used in the public name (`"VZ"`, `"Design"`, `"Excellence AWD"`). |
| `version` | string | Full version/trim + battery or power differentiator. |
| `year` | number | Model year of the evaluated configuration. |
| `segment` | string | pt-PT segment description (`"Utilitário desportivo"`, `"Sedan desportivo"`). |
| `tagline` | string | One sentence, pt-PT, capturing the car's character. |
| `accent` | `"copper" \| "ocean"` | Visual accent. Prefer reusing; see SKILL.md Phase 4 for extending. |
| `price` | object | See below. |
| `specs` | object | See below. |
| `charging` | object | See below. |
| `warranty` | object | See below. |
| `equipmentIncluded` | string[] | Checklist ids only (from `src/data/equipment.ts`). |
| `options` | array | Optional packs **included in the evaluated configuration**, each with `name`, `price` (EUR number), `description`. Use `[]` if the configuration is fully standard. |
| `reviews` | object | One review for every current ID in `CriterionId`/`CRITERIA`. See below. |
| `dossier` | object | See below. |
| `sources` | array | See below. Every `sourceIds` reference in `reviews` must exist here. |

## `price`

```json
{
  "amount": 38810.12,
  "currency": "EUR",
  "vatIncluded": true,
  "asOf": "2026-11-03",
  "note": "Where the number comes from, what it includes/excludes…",
  "sourceId": "cupra-offer"
}
```

- `amount`: positive number, IVA included, Portugal Continental, key-in-hand if
  that's the basis. Use the exact figure from the proposal/price list (decimals ok).
- `asOf`: ISO date `YYYY-MM-DD` — the day the price was valid/observed.
- `note`: pt-PT, explain the basis: proposal code, included options and their
  prices, campaigns/financing conditions, what's excluded (paint, legalization).
  Look at both existing cars for the expected level of detail.
- `sourceId`: one id from `sources` (usually the PDF offer or the official price
  list source).

## `specs` — all fields required unless marked optional

`powerKw`, `powerHp`, `torqueNm`, `drivetrain` (pt-PT, e.g. `"Tração traseira (RWD)"`),
`acceleration0100` (seconds), `topSpeedKmh`, `batteryKwh` (gross), `usableBatteryKwh`,
`batteryChemistry` (e.g. `"NMC, 400 V"`, `"LFP Blade Battery"`), `rangeKm` (WLTP
combined), `consumptionKwh100` (WLTP combined — drives the `efficiency` criterion,
lower is better), `weightKg` (running order, without driver — state the basis in
prose if sources disagree), `grossWeightKg`, `lengthMm`, `widthMm`, `heightMm`,
`wheelbaseMm`, `bootL`, `frunkL` (optional), `seats`, `doors`, `towingBrakedKg`
(optional).

Rules:
- WLTP figures, preferably from the official PT spec sheet. Note discrepancies
  between the offer PDF and the official site in the review prose.
- `powerHp` must be consistent with `powerKw` (1 kW = 1.35962 cv) — the
  `powerToWeight` criterion uses `powerHp / weightKg`.
- `rangeKm` and `consumptionKwh100` drive objective scores; double-check them
  against at least two sources.

## `charging`

`acKw`, `dcKw`, `dcTime1080Min` (10–80% minutes), `dcTime3080Min` (optional),
`connector` (usually `"CCS2"`), `v2l` (boolean), `v2lKw` (optional), `v2h` (boolean).

The `charging` criterion score is `0.7 × dcKw + 0.3 × acKw` — verify both values.
If the car has V2L/V2H, also make sure the corresponding equipment ids (`v2l`,
`v2h`) are in `equipmentIncluded` — they are checklist items too.

## `warranty`

`vehicle`, `battery` (pt-PT strings with years/km, e.g. `"8 anos / 160.000 km"`),
`note` (conditions, SOH guarantees, extensions, PT legal warranty context).

## `equipmentIncluded`

- Array of ids from `EQUIPMENT_CHECKLIST` in `src/data/equipment.ts` only.
- Includes equipment that is standard **or** included via the options of the
  evaluated configuration (this is how the CUPRA dossier counts the panoramic roof
  that came with the offer).
- The count of these ids is the raw value of the `equipment` criterion and is
  displayed as `X/total` — every id must be defensible from the sources.
- Never include an id for equipment the car doesn't have in the evaluated
  configuration, even if available as an option the user didn't take (mention the
  missed option in the review prose instead, like the Sennheiser audio note).

## `reviews` — all current criteria, no exceptions

Two editorial criteria (need a justified `baseScore`): `comfort` and `sound`.

Three rubric criteria (`interior`, `brand` and `satisfaction` — each needs its
own structured `assessment`, **never a `baseScore`**; interior is absolute, while
brand and satisfaction are relative to the list). Read `src/lib/interior.ts`,
`src/lib/brand.ts` and `src/lib/satisfaction.ts` for the rubrics.

Five objective criteria (score computed from data — do NOT include any score):
`equipment`, `range`, `powerToWeight`, `efficiency`, `charging`.

The set can change. Always check `src/data/types.ts`, `src/data/criteria.ts`, and
the `add-criteria` skill before assuming the count or review shape.

### Editorial reviews

```json
{
  "baseScore": 7.7,          // Only on editorial criteria; 0–10, one decimal
  "summary": "...",
  "pros": ["…", "…"],
  "cons": ["…", "…"],
  "sourceIds": ["cupra-official", "ev-database"]
}
```

### Interior review (rubric)

```json
{
  "assessment": {
    "softTouch": 4,
    "upholstery": 6.5,
    "design": 6.5,
    "assembly": 7,
    "hardPlastic": "high"
  },
  "summary": "...",
  "pros": ["…", "…"],
  "cons": ["…", "…"],
  "sourceIds": ["cupra-official", "autonext"]
}
```

- `softTouch` (40%): soft-touch coverage on the surfaces occupants actually touch
  (dashboard top, door cards, armrests, console). Hard plastic under the elbow is
  not "mostly soft" because the top of the dash is padded.
- `upholstery` (25%): leather or quality vegan leather, stitching, seat and
  steering-wheel quality. Thin PVC and plain cloth score low.
- `design` (20%): restrained, coherent sophistication. Showy contrast, forced
  decoration and gratuitous screens lower the score; that is deliberate.
- `assembly` (15%): panel fit, solidity, squeaks and rattles.
- `hardPlastic`: `low` | `moderate` | `high` (cap 7.0) | `extensive` (cap 5.5).
  Penalty is 0 / 0.5 / 1.0 / 1.8 points respectively.
- The components are **absolute quality judgements**, never scaled against the
  other cars. Do not inflate a mediocre cabin just because it is the best of a
  weak list. The formula lives in `src/lib/interior.ts`.

### Brand and assistance review (relative rubric)

```json
{
  "assessment": {
    "automotiveExperience": 7,
    "portugalServiceNetwork": 9.5,
    "europeanManufacturing": 8,
    "establishedGroupSupport": 9.5,
    "portugalFactory": false
  },
  "summary": "...",
  "pros": ["…", "…"],
  "cons": ["…", "…"],
  "sourceIds": ["brand-history", "brand-network"]
}
```

- Component marks are 0–10; the calculation in `src/lib/brand.ts` uses 30% automotive experience, 30% authorized workshop reach in Portugal, 25% European passenger-car manufacturing maturity, and 15% support from an established group/manufacturer.
- `portugalFactory` is a boolean; an active Portuguese automotive factory adds 0.5 to the weighted index, capped at 10.
- Distinguish a marque's standalone age from its parent or predecessor's history. Group history is evidence of support, not proof that a newer marque itself is equally old or reliable.
- For network marks, count authorized workshops/repairers, not sales-only outlets. For factories, distinguish active series production from pilot output, construction and future plans; note whether the evaluated model is made there.
- Do not infer that age, manufacturing location or affiliation guarantees reliability or shorter parts-delivery times. These are proxies for accumulated experience, service access, industrial capacity and organizational support.
- The rubric index is then scaled relative to the best car. Do not store the final relative score in JSON.

### User satisfaction, defects and recalls (relative rubric)

```json
{
  "assessment": {
    "ownerSentiment": 7,
    "reportedDefects": 6,
    "recallRecord": 5,
    "evidenceLevel": "limited"
  },
  "summary": "...",
  "pros": ["…", "…"],
  "cons": ["…", "…"],
  "sourceIds": ["owner-report", "independent-long-term-test", "recall-database"]
}
```

- `ownerSentiment` (40%): real-owner feedback, independent surveys and long-term tests; distinguish model feedback from brand-wide survey results.
- `reportedDefects` (35%): score recurring owner-reported problems by frequency, severity and independent corroboration. Do not treat the raw number of forum posts as an incidence rate without comparable fleet/mileage exposure.
- `recallRecord` (25%): model-specific safety recalls, severity, known affected population/build dates and remedy status. Separate recalls from service campaigns and note when an individual VIN cannot be verified.
- `evidenceLevel`: `limited` | `moderate` | `broad`, describing post-market exposure rather than vehicle quality. The scorer caps component scores when evidence is limited or moderate, so “no reports found” cannot earn a perfect score on a new model.
- Read `src/lib/satisfaction.ts` for weights and evidence caps. The weighted index is then rescaled against the best car; do not store the final relative score in JSON.
- Prioritize owner reports and independent media. Use official VIN/campaign tools or regulators to verify recall scope, not as substitutes for independent defect evidence. State the date and geographic limits of recall searches.

Quality bar (match the existing dossiers):
- `baseScore` 0–10 with one decimal for the two editorial criteria. It is an
  *absolute* judgement that the site then re-scales against the best car in the
  list, so score on merit, not to game the ranking.
- Interior rubric components are 0–10, one decimal (integers are fine). Judge the
  cabin on its own merit: a plastic-heavy interior scores below 6 even if it is
  the nicest in a weak list. Pick `hardPlastic` honestly — `high` and `extensive`
  cap the score at 7.0 and 5.5.
- `summary`: cite real numbers (km, kWh, cv/t, speaker counts, survey positions),
  acknowledge the evaluated configuration when it matters ("nesta configuração").
- 2–3 `pros` and `cons` each, short and specific. Objective criteria reviews still
  need prose — interpret the number ("melhor consumo da lista" — and verify that
  claim in Phase 5).
- `sourceIds`: only ids declared in this file's `sources`.
- **No list-relative claims.** Do not write "o mais caro da lista", "a maior
  autonomia da lista", "o melhor consumo da lista", "líder" or counts like "29 dos
  38 equipamentos". They are static text and become false when a car or checklist
  item is added. State the fact instead ("Preço de €50.926 com IVA", "570 km
  WLTP") or compare against a named car ("1,6 kWh abaixo do Excellence"), which
  stays true regardless of new entries. The UI already calculates ranks and
  counts dynamically.

## `dossier`

```json
{
  "headline": "Short editorial headline for the car",
  "verdict": "3–5 sentences positioning the car against the others in the list",
  "pros": ["~5 items"],
  "cons": ["~5 items"],
  "bestFor": "One sentence: who should buy this",
  "sections": [
    { "title": "Posicionamento", "body": "…" },
    { "title": "Interior e ergonomia", "body": "…" },
    { "title": "Como se conduz", "body": "…" },
    { "title": "Vida a bordo", "body": "…" },
    { "title": "Propriedade e rede", "body": "…" },
    { "title": "Configuração avaliada", "body": "…" }
  ]
}
```

- Sections are flexible in number/title but should cover the same ground as the
  existing dossiers. The last section typically documents the exact evaluated
  configuration and price breakdown.
- The `verdict` may name rivals ("o Seal justifica o extra") — that's fine, but keep
  it scoped to those named cars. Never phrase it as a list ranking ("o mais
  completo da lista", "líder absoluto"); Phase 5 verifies the named comparisons and
  removes any list-relative claim.
- `pros`/`cons` items are short facts ("570 km WLTP", "Preço de €50.926 com IVA"),
  not rankings. "O mais caro da lista" is forbidden; if the price is the point,
  state it.

## `sources`

```json
{
  "id": "cupra-offer",
  "label": "Proposta CUPRA C84TSZ1 (PDF fornecido)",
  "url": "/sources/cupra-raval-vz-oferta-c84tsz1.pdf",
  "type": "pdf"
}
```

- `id`: kebab-case, prefix with the brand (`cupra-…`, `byd-…`) for readability.
  Unique within the file.
- `type`: one of `"official" | "press" | "owner" | "database" | "pdf"`.
- `url`: external URL, or `/sources/<file>` for local PDFs in `public/sources/`
  (with `type: "pdf"`). Optional.
- `label`: `"Outlet — Context"` style, pt-PT.
- Aim for 8–15 sources like the existing dossiers: official site + specs page +
  offer PDF + warranty/dealers pages + EV Database + 4–6 press reviews + owner
  community. Only cite sources you actually consulted.

## Formatting conventions

- Prose: European Portuguese. Decimals with comma in text ("15,79 kWh/100 km"),
  thousands with dot ("€38.810,12"). JSON numeric fields use plain numbers.
- Dates: ISO `YYYY-MM-DD`.
- Don't invent values. If a spec is unverifiable, prefer omitting an optional field
  over fabricating, and note the gap in the final report to the user.

## Common pitfalls (all caught by `npm run validate:data` — run it after each file)

1. Missing a review for any current criterion in `CRITERIA`.
2. `baseScore` outside 0–10, on an objective criterion (wasteful — it's ignored;
   keep objective reviews score-free) or on `interior` (forbidden — use
   `assessment`).
3. Missing/out-of-range interior `assessment` components or an unknown
   `hardPlastic` value.
4. `sourceIds` pointing to a source that doesn't exist in the same file.
5. `equipmentIncluded` ids not present in `EQUIPMENT_CHECKLIST` (typo or
   not-yet-added item — add it in Phase 2 first).
6. Duplicate `id`/`slug` across files (watch out between versions of the same car).
7. `price.amount` ≤ 0.
8. Forgetting to register the JSON in `src/data/cars/index.ts` — the validator
   scans the folder, but the site only shows registered cars. A file that exists
   but isn't imported silently disappears from the site while still passing
   validation, so always cross-check the validator's car count against the
   registry.

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
| `reviews` | object | All 10 criteria. See below. |
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

## `reviews` — all 10 criteria, no exceptions

Editorial criteria (need a justified score): `interior`, `comfort`, `brand`,
`sound`, `satisfaction`.

Objective criteria (score computed from data — do NOT include `baseScore`):
`equipment`, `range`, `powerToWeight`, `efficiency`, `charging`.

Every entry, editorial or objective, has this shape:

```json
{
  "baseScore": 7.7,          // ONLY on editorial criteria; 0–10, one decimal
  "summary": "2–4 sentences, pt-PT, concrete numbers, honest trade-offs.",
  "pros": ["…", "…"],
  "cons": ["…", "…"],
  "sourceIds": ["cupra-official", "ev-database"]
}
```

Quality bar (match the existing dossiers):
- `baseScore` 0–10 with one decimal. It is a *relative-to-10 absolute* judgement,
  but remember the final score is re-scaled against the best car in the list, so
  score on merit, not to game the ranking.
- `summary`: cite real numbers (km, kWh, cv/t, speaker counts, survey positions),
  acknowledge the evaluated configuration when it matters ("nesta configuração").
- 2–3 `pros` and `cons` each, short and specific. Objective criteria reviews still
  need prose — interpret the number ("melhor consumo da lista" — and verify that
  claim in Phase 5).
- `sourceIds`: only ids declared in this file's `sources`.

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
- The `verdict` almost always names rivals ("o Seal justifica o extra") — that's
  fine, but those sentences are exactly what Phase 5 must re-verify.

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

1. Missing a review for one of the 10 criteria.
2. `baseScore` outside 0–10, or present on an objective criterion (wasteful — it's
   ignored; keep objective reviews score-free).
3. `sourceIds` pointing to a source that doesn't exist in the same file.
4. `equipmentIncluded` ids not present in `EQUIPMENT_CHECKLIST` (typo or
   not-yet-added item — add it in Phase 2 first).
5. Duplicate `id`/`slug` across files (watch out between versions of the same car).
6. `price.amount` ≤ 0.
7. Forgetting to register the JSON in `src/data/cars/index.ts` — the validator
   scans the folder, but the site only shows registered cars. A file that exists
   but isn't imported silently disappears from the site while still passing
   validation, so always cross-check the validator's car count against the
   registry.

# Verification checklist — recalculate and verify everything

Why this exists: every score in this site is **relative** (`src/lib/scoring.ts`):
per criterion, the best car in the list gets 10 and the others get their
proportion. Adding one car changes: every car's per-criterion scores, the weighted
total, the ranking, the €/ponto, the value ranking, and the truthfulness of every
comparative sentence in every dossier. Work through ALL sections below, in order.

## Section 1 — Data validation

```bash
npm run validate:data
```

- Must exit 0 with zero "Erros de dados".
- Confirms: all required fields, unique `id`/`slug`, positive price, `baseScore`
  0–10 on editorial criteria, all `sourceIds` known, all `equipmentIncluded` ids
  known.
- Cross-check the car count it reports against `src/data/cars/index.ts`: the
  validator scans the folder, the site renders the registry. A JSON that exists
  but isn't imported passes validation yet never appears on the site.
- Keep its printed ranking and cost-benefit tables — you'll need them in Sections
  3–5 and for the final report.

## Section 2 — Math spot-check (do at least one by hand)

Formulas from `src/lib/scoring.ts` (criteria weights all default to 1, so the
total is the mean of the 10 criterion scores):

- `equipment` raw = count of `equipmentIncluded` ids that exist in the checklist
- `range` raw = `specs.rangeKm`
- `powerToWeight` raw = `specs.powerHp / specs.weightKg`
- `efficiency` raw = `specs.consumptionKwh100` (lower is better)
- `charging` raw = `charging.dcKw × 0.7 + charging.acKw × 0.3`
- Editorial raw = `reviews.<id>.baseScore`
- Score per criterion (higher-is-better): `clamp(raw / bestRaw × 10, 0, 10)`;
  lower-is-better (only `efficiency`): `clamp(bestRaw / raw × 10, 0, 10)`.
- Total = weighted mean of the 10 scores → `pricePerPoint = price.amount / total`.

Pick the new car and one existing car, recompute two criteria and the totals by
hand, and confirm they match the validator's output and your expectations. If the
site and the validator disagree, the data feeding them differs (usually an
unregistered JSON — see Section 1).

## Section 3 — Stale comparative claims sweep (the heart of Phase 5)

Every existing dossier was written against the old line-up. Now re-read each
car's `reviews` and `dossier` (all JSONs in `src/data/cars/`) and verify every
list-relative claim. Grep finds candidates; you judge each one against the new
ranking:

```bash
grep -rnE "da lista|melhor|pior|mais barato|mais caro|mais eficiente|mais rápido|rival|fica atrás|à frente|líder|lidera|únic" src/data/cars/
grep -rnE "\b38\b|/ ?38" src README.md   # word-bounded, so "389 km" won't match
```

The `38` grep assumes the current checklist size — replace the number with whatever
the total was before this skill ran.

Then, per claim type, recompute who actually leads now and rewrite broken
sentences (in pt-PT, keeping the dossier's voice):

- Superlatives: "melhor consumo da lista", "o mais barato", "melhor custo por
  ponto", "a autonomia mais baixa da lista", "a potência DC mais baixa".
- Cross-references by name: grep for every other car's brand/model inside each
  JSON ("fica muito atrás do Seal", "o Seal justifica o extra") and check the
  relationship still holds numerically.
- Counts and totals: "29 dos 38 equipamentos", "X/Y equipamentos" — recompute
  against the new checklist size and re-audited `equipmentIncluded` arrays.
- Rank statements: "ficou em 28.º de 31 marcas" (external facts stay), but any
  in-list rank or "lidera N dos 10 critérios" style claim must be re-derived.
- Version-pair prose: if the new car slots between two versions of the same model
  (e.g. between BYD Design and Excellence), their mutual comparisons may flip.

Also check the shared UI copy:

- `src/data/criteria.ts` — the `equipment` criterion description mentions the
  checklist item count.
- `src/components/methodology.tsx`, `src/app/page.tsx`, `src/app/carros/[slug]/page.tsx`
  — read for any count or line-up assumptions ("Dez critérios" is fine unless
  criteria changed; "38 itens" is not).

## Section 4 — Name and variant check

Every car has a `variant` (trim) and a public name `brand + model + variant`,
rendered by `formatCarName()` in `src/lib/format.ts`. Adding a version of an
existing model must not create a duplicate public name; `npm run validate:data`
rejects duplicates.

- Confirm the new name appears correctly in the ranking table, weights modal,
  dossier hero, footer and `generateMetadata`.
- If the new car is a sibling version (e.g. BYD Seal Design vs Excellence AWD),
  make sure both read as separate cars everywhere and that no link or prose calls
  them only by `brand + model`.
- Re-read the comparative prose of both siblings; scores are relative, so their
  mutual claims may need updating.

## Section 5 — Equipment re-audit verification

If Phase 2 added checklist items:

- For each new id, confirm every existing car was audited (has the id in
  `equipmentIncluded` if its evaluated configuration includes the feature, with a
  source to back it).
- Confirm the displayed totals are consistent: `equipment-checklist.tsx` is
  dynamic, but `weighted-score-panel.tsx`, the equipment section in
  `carros/[slug]/page.tsx`, `criteria.ts` description and `README.md` had hardcoded
  `38` — re-grep and confirm all now show the new total.
- Equipment criterion scores changed for everyone (denominator grew) — that's
  expected and correct; just make sure the *prose* about equipment counts (Section
  3) matches.

## Section 6 — Build and runtime checks

```bash
npm run lint
npm run build
```

Both must pass. Then, with `npm run dev`, eyeball:

- `/` — hero shows the new car count; ranking table includes the new car(s) with
  plausible scores; sorting by "Melhor custo-benefício" works; footer lists the
  right dossiers (first 4 of the registry order, plus "Ver todos" if > 4).
- `/carros/<new-slug>` — every section renders in order: visão geral, ficha
  técnica, critérios de avaliação (3.1 a 3.10), equipamento com o novo total,
  lista de opcionais (ou o texto genérico sem opções), informações adicionais e
  fontes. Confirme também que o nome completo inclui a variante.
- One existing dossier — scores, prose and full name updated as intended.
- Weights modal on `/` — sliders still recalculate (nothing per-car there, but a
  regression check after touching components).

## Section 7 — Housekeeping

- `SITE_UPDATED_AT` in `src/data/site.ts` bumped to today.
- `README.md`: routes list, data-structure tree (file names), checklist count,
  and the "Dados e preços" section if a new source PDF was added.
- Provided PDFs are in `public/sources/` and referenced with `type: "pdf"`.
- No scratch/research files left inside `src/` or `public/`.

## Section 8 — Final report skeleton

Report in chat (not a file):

1. New ranking (car — total score — €/ponto) and what moved.
2. New car(s) summary: price basis, version(s) added, headline strengths/weaknesses.
3. Equipment: new checklist ids, which existing cars gained them.
4. Comparative claims corrected in old dossiers (before → after).
5. Sources used and any discrepancies found between them.
6. Unverified facts / assumptions made — anything the user should double-check.

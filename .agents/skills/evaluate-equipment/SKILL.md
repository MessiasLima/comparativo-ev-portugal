---
name: evaluate-equipment
description: Evaluate or update the normalized equipment checklist for a car in Comparativo EV Portugal. Use this skill whenever mapping a car's standard or included equipment to `equipmentIncluded`, deciding whether an unlisted feature deserves a new checklist item, adding a checklist item, or re-auditing cars after the checklist changes—including when adding a car or revising the equipment criterion.
---

# Evaluate equipment

Use this workflow whenever preparing or revising a car's `equipmentIncluded` or
changing `EQUIPMENT_CHECKLIST`. The checklist is a normalized comparison of
buyer-relevant features, not an inventory of every detail a manufacturer offers.
`src/data/equipment.ts` is the source of truth for checklist IDs. The count and
scores are derived by the existing scoring and validation code; do not change the
formula in `src/lib/scoring.ts` as part of an equipment assessment.

## Phase 0 — Identify the evaluated configuration

1. Confirm the exact model, model year, market, version/trim and options represented
   by the dossier or offer. Equipment can vary by market, trim, package and model
   year.
2. Count an item only when it is standard on that version or included in the
   evaluated configuration. An option that is merely available, but not selected,
   does not count.
3. Research the equipment on that exact configuration. Prefer official
   Portuguese/European specifications, configurators, price lists and the supplied
   offer; use independent tests to clarify function where official material is
   incomplete. Record the sources that support the mapping and any new-item decision;
   add newly consulted sources to the relevant car's `sources` array using the
   project's existing source format.

## Phase 1 — Map features to the existing checklist

1. Read `src/data/equipment.ts` and compare the configuration's equipment with the
   current `EQUIPMENT_CHECKLIST` IDs and labels. Do not rely on memory or on a past
   car's feature list; the checklist may have changed.
2. Match by function, not by marketing name. Different names for the same function
   map to the same ID. Use one ID per functionality; do not count synonyms,
   duplicate IDs or multiple descriptions of one feature as separate extras.
3. Add only IDs that exist in `EQUIPMENT_CHECKLIST` to `equipmentIncluded`. Do not
   create an ID just because a manufacturer's wording differs from a checklist label.

## Phase 2 — Decide whether an unlisted feature merits a checklist item

An unlisted feature is not automatically a new checklist item. First check that no
existing ID already represents its function, then assess its practical value to an
EV buyer:

1. Describe concretely what the feature lets the driver or passengers do, or what
   meaningful safety, comfort, convenience or other practical benefit it provides.
2. Compare its usefulness and level of detail with the existing checklist. A new
   item should represent a distinct, buyer-relevant function—not merely a new name,
   trim detail or minor variation of an existing item.
3. Exclude features that are essentially decorative or cosmetic and add no meaningful
   practical function. For example, an illuminated logo is an aesthetic choice and
   does not merit its own item.
4. Include a genuinely useful function even if it is a convenience feature. For
   example, hands-free boot opening by moving a foot under the rear bumper has a
   practical use. It may deserve a separate item from `electric-tailgate` if that
   existing ID covers powered movement but not hands-free operation; do not count
   the powered tailgate itself twice.
5. Base the decision on the feature's real function, not its name or the fact that it
   is new. For borderline cases, research how it works, compare it with the
   checklist's existing level of granularity, and document the reasoning. Ask the
   user only if relevant evidence or scope remains materially ambiguous.

Do not add an item if it duplicates an existing function or fails the relevance
test. Do not add a feature merely to increase a car's count.

## Phase 3 — Add a relevant new item

Only after a feature passes Phase 2 and has no existing equivalent:

1. Add one unique, descriptive kebab-case `id`, a concise pt-PT `label`, and a
   `category` from `EQUIPMENT_CATEGORIES` to `src/data/equipment.ts`.
2. Follow the existing one-line object format, which the data validator expects.
   Put the item in the appropriate category. Add a category only for a genuinely
   new domain, and check that `src/components/equipment-checklist.tsx` renders it.
3. Include the new ID for the evaluated car only if the feature is standard or is
   included in that car's evaluated configuration, supported by evidence.

If the feature does not pass the relevance test, leave the checklist and all
`equipmentIncluded` arrays unchanged for that feature.

## Phase 4 — Re-audit existing cars when the checklist grows

For each newly accepted checklist ID, inspect every existing car/version JSON in
`src/data/cars/` and verify whether its exact evaluated configuration includes the
feature. Use each car's sources, offer, official specifications or configurator.

- Add the ID to `equipmentIncluded` only when evidence confirms the feature is
  present in that configuration.
- Do not treat an unchosen option as included, and do not invent a presence or an
  absence to fill gaps. Investigate uncertainty and report it rather than guessing.
- This targeted re-audit is required for every new ID because the checklist and
  equipment scores are shared across the comparison. Do not re-evaluate unrelated
  equipment on existing cars unless separately requested.

## Phase 5 — Verify counts and recalculate

1. Run `npm run validate:data`. It must reject unknown `equipmentIncluded` IDs and
   print the current number of cars and checklist items. Resolve validation errors.
2. Confirm the displayed `X/total` count uses `EQUIPMENT_CHECKLIST.length`; inspect
   `src/lib/scoring.ts` and the validator to ensure the existing equipment counting
   and scoring logic remains the source of truth. Do not replace the checklist size
   with a literal or change the scoring formula for this assessment.
3. If a checklist item was added, search `src/`, `README.md` and `.agents/skills/`
   for fixed item totals and update any documentation or prose that became stale in
   the same change. For example, search for count phrases with:
   `rg -n '\b[0-9]+\s+(itens|equipamentos)\b|dos\s+[0-9]+' src README.md .agents/skills`
   Review matches in context; not every number is a checklist total.
4. Recalculate the equipment values and the full ranking for all cars with
   `npm run validate:data`. The calculated scores and ranks are not stored in car
   JSONs. Check that the new item's denominator and each existing car's inclusion
   state are reflected consistently in the result.
5. If no item was added, do not re-audit existing cars solely because this workflow
   was used.

## Phase 6 — Report

Summarize in pt-PT:

- the evaluated configuration and sources used;
- how its equipment mapped to existing checklist IDs;
- each unlisted feature considered, the relevance decision and its reasoning;
- any new checklist IDs and which existing configurations gained them;
- the `npm run validate:data` result and any recalculated ranking effects; and
- unresolved evidence gaps or assumptions.

Do not claim that a cosmetic or unverified feature is included, and do not store
calculated scores or rankings in dossier data.

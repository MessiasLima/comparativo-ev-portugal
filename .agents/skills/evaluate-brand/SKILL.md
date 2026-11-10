---
name: evaluate-brand
description: Evaluate or update the “Marca e assistência” assessment for a car brand in Comparativo EV Portugal. Use this skill when researching global brand age, the brand's time in Portugal, authorized service coverage, European car production, group support, financial stability or Portuguese production—including when adding a car or revising the brand rubric.
---

# Evaluate brand and after-sales support

Use this workflow when preparing or revising `reviews.brand`. The assessment belongs
to the **marque**, not to an individual trim. Versions of the same marque should
share the same brand assessment unless the user explicitly defines a version-specific
reason to differ. Each component is a sourced 0–10 judgement; `brandScore()` applies
the weighted formula, and `src/lib/scoring.ts` later scales that index relative to
the other cars. Never store either calculated result in car JSON.

## Phase 0 — Fix the entity and date

1. Identify the automotive marque, its current legal/reporting entity, its parent
   group and any predecessor or former division. Keep these entities distinct in
   research notes and prose.
2. Date-stamp changing evidence: Portuguese market presence, repair network, factory
   status, sales and financial reports. Use the latest available information as of
   the review date; do not describe a plan as current production.
3. For a group-owned marque, use group facts only in components where they are
   relevant. Group history is not the marque's age; group production of another make
   is not production by this marque; parent financials are not standalone brand
   results.

## Phase 1 — Gather evidence by component

Prefer official brand, manufacturer, investor-relations, annual-report and factory
sources. Use credible specialist or financial reporting to corroborate gaps, record
the publication date, and explain source conflicts. Add consulted sources to the
car's `sources` array and their IDs to `reviews.brand.sourceIds`.

### `globalBrandAge` — 10%

Use the year the marque was launched as an **autonomous automotive brand**. Do not
use the parent group's founding date, the date a predecessor company began, or an
earlier use of the name as a trim/division. Confirm the origin from the brand or
company history. For example, CUPRA's separate-brand launch and Polestar's
electric-performance brand launch are the relevant origins, not SEAT or Volvo's
founding dates.

| Mark anchor | Time as an autonomous automotive marque |
| --- | --- |
| 0–2 | Less than 2 years |
| 3–4 | 2–5 years |
| 5–6 | 6–10 years |
| 7–8 | 11–20 years |
| 9–10 | More than 20 years |

Use intermediate marks for evidence near a boundary; do not transfer a group's age
to a newer marque.

### `portugalMarketTenure` — 20%

Find the start of the marque's **current uninterrupted official presence** in
Portugal: for example, a dated brand launch, first official sales/order channel, or
appointment of its authorized national importer. Do not count parallel imports,
another marque's older network or the parent group's time in Portugal. A formal
withdrawal followed by re-entry starts a new period; mention any uncertain gap.

| Mark anchor | Current continuous official presence in Portugal |
| --- | --- |
| 0–2 | Less than 2 years |
| 3–4 | 2–5 years |
| 5–6 | 6–10 years |
| 7–8 | 11–20 years |
| 9–10 | More than 20 years |

The score measures local tenure, not the marque's reputation or global sales.

### `portugalServiceNetwork` — 20%

Use the marque's official locator, importer information and authorized-repairer
directories. Count workshops/service points that are explicitly authorized to
service the marque—not sales-only showrooms, general group outlets without service
authorization, or locations in other countries. Assess geographic distribution
across mainland Portugal and the islands, not just the raw number. Record the
directory date because networks change.

| Mark anchor | Evidence of authorized service coverage |
| --- | --- |
| 0 | No confirmed authorized service |
| 2 | One isolated service point |
| 4 | Very sparse network |
| 6 | Some regions or partner coverage |
| 8 | Good national coverage with remaining gaps |
| 10 | Broad, well-distributed national network |

Interpolate between anchors when the verified coverage falls between them.

### `europeanManufacturing` — 15%

Assess passenger cars **produced under this marque** at European sites. A parent
group's plant making only another brand does not count. Distinguish actual pilot or
series production from a future announcement, a site under construction or a
production capability that has not reached the relevant stage. Say whether the
evaluated model is among the cars made there, but score the marque's confirmed
production footprint consistently.

| Mark anchor | European passenger-car production stage |
| --- | --- |
| 0 | No European production |
| 2 | Future plan announced |
| 4 | Factory under construction or being equipped |
| 6 | Pilot production |
| 8 | Series production at one European site |
| 10 | Series production at multiple sites or substantial European capacity |

Interpolate where the evidence supports a position between anchors. Do not count a
factory of another marque in the group.

### `establishedGroupSupport` — 15%

Find concrete support in engineering/development, service, parts, manufacturing,
funding, technology or shared operations. Verify the relationship and what support
the marque actually receives; a corporate affiliation alone is not proof that every
resource is shared. An established, large and vertically integrated independent
manufacturer can score well without an external parent.

Use the scale in `src/lib/brand.ts`: 0–2 for no clear support, 3–5 for a limited
partnership, and 8–10 for substantial integration into an established group or an
independent OEM with relevant scale and capability. Use intermediate values only
when the evidence supports that level of depth.

### `financialStability` — 20%

Evaluate the financial resilience of the company or reporting segment that actually
funds and operates the marque. Review, where disclosed:

- sales/delivery and revenue trends across multiple reporting periods;
- operating profit or loss, margins, and whether results are recurring or driven by
  one-off items;
- operating cash flow, cash/liquidity, debt maturities, leverage and covenant or
  going-concern warnings; and
- official management outlook for profits/losses, margins, cash flow or sales, plus
  reputable analyst forecasts when useful.

Use audited annual statements and the latest interim/quarterly report as primary
evidence. Prefer official management guidance for forecasts. Use reputable external
forecasts only as secondary, dated estimates; do not present them as reported results
or let them outweigh several years of actual performance. Sales volume alone is not
financial health, and a single bad quarter does not establish structural distress.

When standalone brand accounts are unavailable, use the closest disclosed automotive
business/segment or parent entity as a **proxy**. Name that entity and the limitation
in the review summary; do not imply its results are brand-specific. Lack of
disclosure alone is not evidence of distress. Keep financial health separate from
`establishedGroupSupport`: this component scores results, liquidity and outlook;
the support component scores the depth of the relationship and resources available.

| Mark anchor | Financial evidence |
| --- | --- |
| 0–2 | Severe distress or deterioration, such as material going-concern doubt, acute liquidity/debt risk or sustained large losses without credible funding |
| 3–4 | Weak and worsening position, with persistent losses, falling sales/revenue or significant liquidity/debt pressure |
| 5–6 | Mixed signals: meaningful risks or losses alongside improving results, adequate liquidity or credible support/outlook |
| 7–8 | Demonstrated stability: sustainable results/cash generation, manageable debt and a reasonably resilient outlook |
| 9–10 | Consistent financial strength: durable profitability and cash generation, strong liquidity, prudent leverage and resilient prospects |

These are judgement anchors, not a separate formula. Explain which reporting entity
was assessed and why the evidence fits the mark.

## Phase 2 — Set `portugalFactory`

Set `portugalFactory` to `true` only when credible evidence confirms that a physical
plant **in Portugal** actually produces or assembles complete vehicles of the
assessed marque. Active pilot production and series production both qualify; an
announcement, construction, equipment installation or prototype-only activity does
not. The plant need not make the exact model in the dossier, but it must make a car
of this marque. A Portuguese factory that only builds another marque owned by the
same group does not count, and a factory in another country never qualifies for this
Portugal-only bonus.

The existing formula adds `PORTUGAL_FACTORY_BONUS` (0.5) to the weighted index and
caps it at 10. Keep this bonus separate from the European-manufacturing component.
If production by the marque cannot be confirmed, use `false`; do not infer it from
group ownership, shared platforms, regional management or supply-chain links.

## Phase 3 — Write the brand review

Populate `reviews.brand` with:

- `assessment.globalBrandAge`, `assessment.portugalMarketTenure`,
  `assessment.portugalServiceNetwork`, `assessment.europeanManufacturing`,
  `assessment.establishedGroupSupport` and `assessment.financialStability`: finite
  numeric marks from 0 to 10;
- `assessment.portugalFactory`: the sourced boolean defined above;
- `summary`: concise pt-PT prose explaining the marque's profile, local presence,
  financial reporting entity/proxy and material limitations;
- `sourceIds`: only IDs of sources consulted and declared in this car's `sources`;
- `pros` and `cons`: specific, supported points on the six brand components.

Do not store `brandScore()` or the final list-relative score. Avoid claims such as
“a melhor marca da lista”; the review must remain true if the lineup changes. For
multiple versions of the same marque, keep the assessment, summary and source IDs
consistent unless the evidence is genuinely version-specific.

## Phase 4 — Verify and maintain consistency

1. Run `npm run validate:data`; resolve invalid/out-of-range component marks and
   missing `sourceIds`.
2. Confirm each assessment has the six numeric components and the boolean
   `portugalFactory`, and that no calculated brand index or relative score was saved.
3. Obtain the raw index with `brandScore(assessment)` from `src/lib/brand.ts`; do not
   reimplement the weights or bonus. Check that the mirrored calculation in
   `scripts/validate-data.mjs` agrees and that the Portugal bonus is capped at 10.
4. Recalculate every car's relative brand score and the overall ranking after any
   score or weight change. Review all four dossiers, including versions sharing a
   marque assessment; do not change other criteria unless asked.
5. Report missing standalone statements, stale forecasts, uncertainty about the
   Portuguese entry date or service directory, and any factory status that could not
   be verified. Do not re-evaluate cars merely because the skill document changes;
   re-evaluate them when the user explicitly requests a rubric update, as here.

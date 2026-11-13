---
name: evaluate-interior
description: Evaluate or update the “Acabamento interno” assessment for a car in Comparativo EV Portugal. Use this skill whenever assessing cabin materials, interior style/design, soft-touch surfaces, upholstery, assembly quality or hard plastics, including when adding a car or revising the interior criterion.
---

# Evaluate interior finish

Use this workflow whenever you prepare or revise `reviews.interior` for a car. The
assessment is an **absolute** judgement of that cabin, not a score relative to the
current ranking. The scoring formula in `src/lib/interior.ts` is the single source
of truth; do not change or reproduce it in dossier data or prose.

## Phase 0 — Identify the evaluated cabin

1. Confirm the exact model, year, market, trim and fitted options represented by the
   dossier. Interior materials and seat upholstery can vary by trim or package.
2. Use evidence for that configuration. If a source describes another trim, make the
   difference explicit and do not assume its materials apply to the evaluated car.

## Phase 1 — Gather and record evidence

Look for evidence that directly describes the cabin's surfaces, upholstery, design
and build quality. Prefer:

1. Official Portuguese/European specifications, configurators and material guides
   for the evaluated trim.
2. Independent road tests that inspect and touch the cabin, including comments on
   panel fit, perceived quality and noises.
3. Long-term tests and owner reports for wear, rattles and other durability evidence.
4. Direct inspection, when available, recorded with the vehicle/configuration and
   the areas inspected.

Photographs alone rarely establish how a surface feels or how well panels are
assembled. Do not turn a marketing label such as “premium” or “vegan leather” into a
score without supporting evidence. Add consulted sources to the car's `sources`
array and cite them through `reviews.interior.sourceIds`; every claim in the summary
must be supported by those sources.

## Phase 2 — Score the four components

Give each component an absolute mark from 0 to 10 based on evidence, not on the
car's position in the ranking. The weights below describe the existing formula;
they are not an invitation to calculate a second score by hand.

| Assessment field | Weight | What to judge |
| --- | ---: | --- |
| `softTouch` | 40% | Coverage and quality of soft-touch material on the surfaces occupants see and touch: dashboard, door panels, armrests and console. A padded dashboard top does not make a cabin mostly soft if frequently touched areas are hard plastic. |
| `upholstery` | 25% | Seat and steering-wheel materials, stitching and finish. Consider leather and quality alternatives, and distinguish them from thin synthetic coverings or plain cloth; a material name alone does not determine the mark. |
| `design` | 20% | Interior style: coherence, sophistication and restraint across lines, lighting, materials and details. A sober, well-resolved cabin can score well; extravagance, forced contrasts and gratuitous decoration lower this component. Do not confuse distinctive design with incoherent excess. |
| `assembly` | 15% | Perceived solidity, panel alignment and evidence of squeaks, rattles or looseness, including over time where long-term evidence exists. |

The marks below are in `softTouch / upholstery / design / assembly` order. Use the
existing dossiers as calibration examples, not as cars to reassess:

- **BYD Seal Design / Excellence AWD** — `8 / 8.5 / 7.5 / 8.5`, `moderate`: the reviews describe soft contact areas and quality upholstery, while noting hard plastic on the door panels and console and a synthetic seat covering that feels cheaper than it looks.
- **CUPRA Raval VZ** — `4 / 6.5 / 6.5 / 7`, `high`: only the dashboard top and armrests are described as soft; most visible surfaces are hard plastic, although assembly is described as solid.
- **Polestar 4 coupé RM Prime** — `8 / 7.8 / 8.8 / 8.5`, `low`: the review describes a padded dashboard and door panels, soft material covering contact and less-touched areas, a coherent restrained design and praised assembly, with MicroTech upholstery rather than leather.

These are examples of the project's current scoring, not universal thresholds or
targets. Keep each mark defensible from the evidence for the exact configuration.

## Phase 3 — Classify visible/touchable hard plastic

Choose one `hardPlastic` value based on how prevalent hard plastic is across the
cabin's visible and touchable areas. Consider the dashboard, doors, armrests, console
and other common contact points together; do not let one padded area conceal hard
surfaces elsewhere. Record the observed areas in the reasoning and summary.

| Value | Meaning in the review | Existing penalty and maximum |
| --- | --- | --- |
| `low` | Little hard plastic across the visible/contact areas | 0 points; maximum 10 |
| `moderate` | A noticeable but not prevalent share | 0.5 points; maximum 10 |
| `high` | Hard plastic is frequent across those areas | 1 point; maximum 7 |
| `extensive` | Hard plastic dominates the cabin's visible/contact areas | 1.8 points; maximum 5.5 |

The labels are qualitative: the project defines no percentage cut-offs. Do not
invent numeric thresholds. Apply the category consistently to comparable surfaces
and configurations. The penalty and cap are implemented in `src/lib/interior.ts`;
never change them as part of an assessment.

## Phase 4 — Write the assessment

Populate the interior review with:

- `assessment.softTouch`, `assessment.upholstery`, `assessment.design` and
  `assessment.assembly`: finite numeric marks from 0 to 10 (one decimal is allowed);
- `assessment.hardPlastic`: exactly `low`, `moderate`, `high` or `extensive`;
- `summary`: a concise pt-PT explanation of the cabin's strengths and weaknesses,
  including style and the observed hard-plastic distribution where relevant;
- `pros` and `cons`: specific, evidence-based points; and
- `sourceIds`: IDs of the sources that support this review, all declared in the
  car's `sources` array.

Do not store a manually calculated interior result in the JSON. Do not make claims
such as “best in the list”; the review must remain true if the line-up changes.

## Phase 5 — Verify

1. Run `npm run validate:data` and resolve any validation errors.
2. Obtain the displayed interior mark with `interiorScore(assessment)` from
   `src/lib/interior.ts`; do not reimplement the weights, penalty or cap. Confirm
   that the returned value is consistent with the assessment and displayed review.
3. Check that `high` and `extensive` assessments respect their respective caps, and
   that every `sourceId` resolves to a consulted source.
4. Reassess existing cars only when explicitly requested. Adding or documenting this
   workflow alone is not a reason to change existing assessments.

# Research guide — exhaustive car research for a new dossier

Goal: gather enough verified evidence to fill every field of the car JSON with
confidence, and to justify each editorial `baseScore` and each interior rubric
component with citable sources.

## Order of trust

1. **User-provided material** — PDF offers, product guides, configurator exports.
   These define the *evaluated configuration* and price. Read PDFs directly with
   the `read` tool; copy them into `public/sources/` (kebab-case filename).
2. **Official brand sources** — the brand's Portuguese website: model pages, spec
   sheets, price lists, warranty terms, dealer network. Official WLTP figures and
   PVP win over everything else.
3. **Independent databases** — EV Database (ev-database.org) is the house standard
   for cross-checking range, consumption, charging curve and weights.
4. **Specialist press** — reviews and first drives.
5. **Owner evidence** — forums, Facebook groups, long-term tests. Weakest evidence,
   but essential for `satisfaction` on established models.

When two sources disagree: use the official PT figure in the data fields, and
mention the discrepancy explicitly in the review prose (the existing dossiers do
this, e.g. Raval's 389 km vs 384 km). Never average conflicting specs silently.

## Research plan (per version)

Work through these blocks; note the URL for everything you'll cite:

### Block 1 — Versions and positioning
- Full PT-market version/trim list for the model (official site or configurator).
- Which versions are in scope (per the user's Phase 0 decision).
- Segment, launch date (PT availability), platform, production site.
- Rivals in the current list it will be compared against (read the existing
  dossiers to know what it's up against).

### Block 2 — Price and configuration
- PVP Portugal Continental, IVA included, dated. Campaign/financing conditions.
- If a proposal PDF exists: exact total, options included and their prices,
  proposal code and date.
- Cost of paint/wheels/other options NOT included (for the `price.note`).

### Block 3 — Specs (all fields of `specs`)
- Power kW/cv, torque, drivetrain, 0–100, top speed.
- Battery gross/usable, chemistry, voltage architecture (400 V / 800 V).
- WLTP range (combined — note city/highway splits if available). For combined WLTP
  consumption, follow [`evaluate-efficiency`](../../evaluate-efficiency/SKILL.md).
- Weights (running order vs gross — get the basis right), dimensions, boot/frunk,
  seats, doors, towing.

### Block 4 — Charging
- Follow [`evaluate-charging`](../../evaluate-charging/SKILL.md) for AC onboard
  power, DC peak power and charging configuration. Also collect 10–80% and 30–80%
  times, connector, V2L (and its kW), and V2H as supporting specs.

### Block 5 — Equipment (feeds Phase 2)
- Extract the full standard equipment list for the exact evaluated version, and
  distinguish standard items, options included in the evaluated configuration, and
  options not selected (the latter may be relevant to prose, but do not count).
- Map features and decide whether uncovered features merit a new checklist item by
  following [`evaluate-equipment`](../../evaluate-equipment/SKILL.md). Do not assume
  every unlisted feature belongs in the checklist.

### Block 6 — Warranty and network (brand and assistance rubric)
- Vehicle warranty, battery warranty (years/km/SOH), PT legal warranty context.
- For every component of the brand assessment, including its financial evidence and Portugal factory bonus, follow [`evaluate-brand`](../../evaluate-brand/SKILL.md) instead of duplicating the rubric here.
- Do not treat age, manufacturing location or group affiliation as proof of reliability or parts lead times.

### Block 7 — Editorial evidence, criterion by criterion
- `interior`: gather configuration-specific evidence for each component and the
  visible/touchable hard-plastic assessment. Follow
  [`evaluate-interior`](../../evaluate-interior/SKILL.md) for the evidence workflow
  and scoring guidance; do not let the car's position in the list influence marks.
- `comfort`: gather configuration-specific evidence and assess suspension behaviour
  only. Follow [`evaluate-comfort`](../../evaluate-comfort/SKILL.md) for what to
  observe and how to score it; exclude seats and noise.
- `brand`: follow [`evaluate-brand`](../../evaluate-brand/SKILL.md) for all six
  components, financial reporting proxies and the Portuguese-factory bonus. Cite
  evidence for each component in `reviews.brand.sourceIds`; warranty and reliability
  surveys are context only, not extra sub-scores.
- `sound`: identify the system actually fitted to the evaluated configuration and
  follow [`evaluate-sound`](../../evaluate-sound/SKILL.md) for the brand/speaker/
  opinion/RMS evidence hierarchy and the weighted `baseScore`. Never score an
  optional premium pack that is not included. Treat a published wattage as RMS
  unless the source states another measurement basis, and never convert a
  peak/maximum figure into RMS.
- `satisfaction`: follow
  [`evaluate-satisfaction`](../../evaluate-satisfaction/SKILL.md) for evidence
  gathering, component marks, evidence levels and recall handling.

### Block 8 — Press round (aim for 4–6 usable reviews)
Typical outlets used by this project: carwow, electrifying, electrive,
CAR Magazine, Auto Express, Autocar, Top Gear, What Car?, EV Powered, Select Car
Leasing, AutoNext. Also check Portuguese outlets (Auto Motor, NMotormais/autonet)
when available — PT-market quotes are gold for the `brand` criterion.

## Execution tips

- If your runtime supports subagents, run Blocks 3–8 in parallel (one subagent per
  block or per version) and merge results. Keep every URL.
- Query in English AND Portuguese ("[model] review", "[modelo] opinionão Portugal",
  "[model] problemas proprietários", "[model] PVP Portugal").
- EV Database pages usually confirm most objective specs in one stop — use it as
  the cross-check for Block 3/4, not as the primary source.
- Record ALL sources in the JSON's `sources` array — including pages you used for
  a single fact. If you can't cite it, don't claim it.
- For a brand new model with no owner evidence: look for first drives, press
  fleet impressions, and the brand's track record. Say clearly in the
  `satisfaction` summary that the owner sample is limited.
- Keep a running list of facts you could NOT verify — they go in the final report
  to the user, never silently guessed into the JSON.

## Multi-version notes

When the car has several versions in scope:
- Research each version separately for: price, power/torque, 0–100, range,
  consumption, weight, battery, drivetrain, wheels, and equipment differences.
- Shared findings (platform, interior, network, warranty, most press reviews) can
  be reused across the sibling JSONs — but each dossier must be written for *its*
  version (a Design RWD and an Excellence AWD get different `powerToWeight`,
  `comfort`, `range` prose).
- Name siblings consistently: same `brand`/`model`, different `version`/`slug`,
  and mention each other in prose when relevant (see the BYD Seal pair).

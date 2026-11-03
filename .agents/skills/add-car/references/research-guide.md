# Research guide — exhaustive car research for a new dossier

Goal: gather enough verified evidence to fill every field of the car JSON with
confidence, and to justify each editorial `baseScore` with citable sources.

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
- WLTP range (combined — note city/highway splits if available), consumption.
- Weights (running order vs gross — get the basis right), dimensions, boot/frunk,
  seats, doors, towing.

### Block 4 — Charging
- AC onboard power (single vs three-phase), DC peak power, 10–80% and 30–80%
  times, connector, V2L (and its kW), V2H.

### Block 5 — Equipment (feeds Phase 2)
- Extract the FULL standard equipment list for the evaluated version: ADAS suite
  item by item (ACC, lane keep, blind spot, cross traffic front/rear, AEB, traffic
  signs, driver monitoring, 360 camera, remote park, parking sensors, adaptive
  high beam), comfort (heated/ventilated seats, memory, heated steering, climate
  zones, heat pump, rear heated seats), tech (HUD, premium audio brand + speaker
  count, wireless charging, CarPlay/AA, digital cockpit, central screen size,
  connected services, OTA, digital key), body/convenience (panoramic roof, V2L,
  V2H, electric tailgate, frunk, wheel sizes, sport seats, ambient lighting, rear
  USB, adaptive suspension).
- Plus anything the car has that the checklist doesn't cover yet → new checklist
  items (massage seats, rear-wheel steering, electric doors, etc.).
- Which of those come via the included options vs. standard.
- Options NOT included that a buyer might add (for prose context).

### Block 6 — Warranty and network (feeds `brand` criterion)
- Vehicle warranty, battery warranty (years/km/SOH), PT legal warranty context.
- Dealer/after-sales network size in Portugal, importer, time in the PT market.
- Parts availability reputation, brand reliability surveys.

### Block 7 — Editorial evidence, criterion by criterion
- `interior`: materials, build quality complaints/praise, ergonomics of controls
  (touch vs physical), design reception.
- `comfort`: suspension behavior, wheel/tire impact, ride reviews on broken
  roads, motorway stability, noise isolation.
- `brand`: everything from Block 6 plus brand history in PT and satisfaction
  surveys (Driver Power positions, ADAC reliability, etc.).
- `sound`: speaker count, premium system brand (Dynaudio, Sennheiser, Harman…),
  whether it's standard/option/included, press opinions on audio quality.
- `satisfaction`: press verdicts, owner forums/groups, known issues/recalls,
  long-term tests. For new models, state the sample limitation explicitly.

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

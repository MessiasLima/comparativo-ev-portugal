---
name: evaluate-sound
description: Evaluate or update the “Qualidade de som” review and editorial baseScore for a car in Comparativo EV Portugal. Use this skill whenever assessing a sound system, premium audio branding, speaker count, RMS power or independent opinions about audio quality, including when adding a car, revising the sound criterion or re-auditing existing dossiers after new evidence.
---

# Evaluate sound quality

Use this workflow whenever you prepare or revise `reviews.sound`. The result is an
editorial `baseScore` from 0 to 10, built from technical facts and specific
listening evidence. The relative display score is still calculated by
`src/lib/scoring.ts`; never store that calculated score in the dossier.

The evaluation applies to the **installed configuration**, not to an optional
pack, another trim or the car's brand image. A premium system that was not
included in the evaluated car does not count for its score.

## Phase 0 — Identify the evaluated audio configuration

1. Confirm the exact model, model year, market, trim and included options in the
   dossier.
2. Identify the installed system: standard or premium, its brand, speaker count,
   amplifier power and whether a subwoofer is part of the system.
3. If the premium system is an optional pack, confirm whether that pack is present
   in the evaluated configuration. Mention an unavailable optional upgrade only as
   context; never score it as fitted equipment.

## Phase 1 — Gather evidence

Prefer evidence in this order:

1. Official specifications, configurators and product guides for the evaluated
   trim, including the audio section and the options actually included.
2. Independent road tests and specialist audio reviews that describe the system's
   clarity, balance, bass, staging, maximum volume and distortion.
3. Owner reports and forums, used to corroborate or challenge independent findings
   rather than as the only basis for a technical score.
4. Direct listening, when available, recorded with the vehicle, configuration and
   tracks or sources used.

Record the speaker count, the audio brand and the power rating exactly as the source
presents them. When a source publishes a power figure in watts, treat it as RMS
unless the source explicitly states a different measurement basis (for example peak,
maximum or music power). Do not convert a figure that the source labels as
peak/maximum into RMS. If no power figure is published for the installed system, say
so explicitly. Add every consulted source to the car's `sources` array and cite it
through `reviews.sound.sourceIds`; every statement in the summary must be supported
by those sources.

## Phase 2 — Score the four components

Score each component from 0 to 10. These are absolute judgements about the
installed system, not ratings relative to the current line-up. The weighted result
is the editorial `baseScore`.

### Brand of the sound system — 50%

This is the most important component because a system developed or signed by an
audio specialist normally has stronger tuning, hardware and support than an
unbranded factory system. Judge the audio brand of the installed system, not the
car manufacturer.

| Mark | Reference |
| ---: | --- |
| 0–2 | No premium audio brand, an unbranded OEM system, or a manufacturer's own label without specialist audio backing |
| 3–4 | A mainstream consumer-audio brand with a basic factory collaboration |
| 5–6 | A recognised specialist audio brand in a modest or unambitious factory system |
| 7–8 | A recognised premium audio brand with a system developed for this model or configuration |
| 9–10 | A high-end audio marque with a bespoke system, dedicated tuning and a strong reputation in automotive audio |

A premium badge does not prove a premium result. The brand mark must agree with the
installed hardware and the listening evidence. Examples of premium audio marques
include Dynaudio, Harman Kardon, Sennheiser, Bowers & Wilkins, Burmester, Bang &
Olufsen, Meridian and Focal, but the list is illustrative: verify the exact system
and its availability in the evaluated configuration.

### Speaker count — 20%

Count only speakers that are part of the installed system, including a dedicated
subwoofer and functional headrest or height speakers. More speakers can improve
coverage and staging, but the count alone does not prove sound quality.

| Speakers | Mark |
| ---: | ---: |
| 0–4 | 2.0 |
| 5–6 | 4.0 |
| 7–8 | 5.0 |
| 9–11 | 7.0 |
| 12–14 | 8.5 |
| 15–17 | 9.5 |
| 18 or more | 10.0 |

Treat the bands as a reference for the installed system, not as a marketing target.
If a source gives a range or a pack-dependent count, use the count of the evaluated
configuration.

### Specific opinions about the sound — 20%

Use independent tests first, then owner reports that describe the actual system.
Look for consistent comments on clarity, tonal balance, bass, staging, maximum
volume, distortion and usability. Do not turn a single anecdote into a verdict.

| Mark | Reference |
| ---: | --- |
| 0–2 | Repeated, corroborated reports of poor sound or serious defects |
| 3–4 | Mostly negative impressions or frequent significant complaints |
| 5 | No reliable system-specific evidence; neutral mark |
| 6–7 | Mixed impressions, or good but unremarkable feedback |
| 8–9 | Consistently praised by independent tests, with only minor criticism |
| 10 | Exceptional, independently verified quality with no material criticism |

When direct system-specific evidence is unavailable, use the neutral mark of 5 and
state the limitation in the review. Absence of evidence is not proof of poor sound.

### RMS power — 10%

Use a published power figure in watts as an RMS value by default. Only reject that
default when the source explicitly states a different measurement basis — peak,
maximum, music power, amplifier input or similar. Never convert a peak or maximum
figure into RMS. If no power figure is published for the installed system, use the
neutral mark of 5, record the gap and do not infer a value.

When the source gives watts without naming the measurement basis, say in the review
prose that the figure is treated as RMS under this default rule. When the source
explicitly says peak or maximum, say that the figure is not used as RMS and apply the
neutral mark instead.

| RMS power | Mark |
| ---: | ---: |
| 0–100 W | 2.0 |
| 101–200 W | 3.5 |
| 201–350 W | 5.0 |
| 351–500 W | 6.5 |
| 501–750 W | 8.0 |
| 751–1,000 W | 9.0 |
| More than 1,000 W | 10.0 |

A high RMS figure reflects available headroom, not automatically better tuning or
sound quality. It remains a supporting technical signal, not the main judgement.

## Phase 3 — Calculate and classify the baseScore

Apply the agreed weights:

```text
baseScore = 0.50 × brand + 0.20 × speakers + 0.20 × opinions + 0.10 × RMS
```

Round to one decimal place. Classify the result with the editorial bands:

| Band | baseScore | What it represents |
| --- | ---: | --- |
| Low | 0.0–4.9 | An unbranded or basic system, or one with significant weaknesses |
| Medium | 5.0–6.9 | A competent system without a strong premium or technical case |
| High | 7.0–8.9 | A well-equipped system with a recognised audio brand and good evidence |
| Premium | 9.0–10.0 | A bespoke premium-brand system supported by strong technical and independent evidence |

Calibration examples from the current dossiers, given as
`brand / speakers / opinions / RMS`:

- **CUPRA Raval VZ** — `0 / 5 / 5 / 5`, **2.5 (low)**: seven-speaker base system
  without a premium audio signature, with no power figure published for the base
  system and no system-specific independent test.
- **Polestar 4 coupé RM Prime** — `8 / 8.5 / 6 / 10`, **7.9 (high)**: Harman Kardon
  Premium with 12 speakers and 1,320 W published without another measurement basis,
  so treated as RMS; mixed owner opinions.
- **BYD Seal Design / Excellence AWD** — `9 / 8.5 / 8 / 5`, **8.3 (high)**:
  Dynaudio Performance with 12 speakers and strong independent press feedback. The
  775 W figure is published as maximum output, so it is not treated as RMS.

An illustrative medium profile is `5 / 7 / 8 / 5`, giving **6.0**. An illustrative
premium profile is `10 / 10 / 9.5 / 9`, giving **9.8**. The premium band requires a
premium-branded system with explicit technical evidence and consistently strong,
independent listening reports; no current dossier reaches it. Do not force a car
into the premium band merely because it uses a known audio brand.

## Phase 4 — Write the review

Populate `reviews.sound` with:

- `baseScore`: the weighted result from Phase 3, rounded to one decimal;
- `summary`: a concise pt-PT explanation of the installed system, its brand,
  speaker count and the quality evidence, stating when the published power has a
  non-RMS measurement basis or when no power figure exists;
- `pros` and `cons`: two or three specific, evidence-based points each;
- `sourceIds`: IDs of the sources that support the review, all declared in the
  car's `sources` array.

Do not add a second score, a cached relative score, a ranking claim or a
"best in the list" statement to the JSON. The displayed criterion score is
calculated later from the `baseScore`; the review must remain true if the line-up
changes.

## Phase 5 — Verify

1. Run `npm run validate:data` and resolve any validation errors.
2. Recompute the weighted result from the four component marks. Confirm that the
   stored `baseScore` is the result of the documented formula, not a hand-written
   relative score.
3. Confirm that every `sourceId` resolves to a consulted source and that the
   summary, pros and cons agree with the component evidence.
4. Check that the system described is the one actually included in the evaluated
   configuration — not an optional premium pack that the user did not select.
5. Revisit a car's sound review when new technical evidence, recordings or
   independent tests appear, or when this methodology changes. In a continuously
   deployed site, an outdated review is a data defect even when it still validates.

## Required review fields

```json
{
  "baseScore": 8.3,
  "summary": "…",
  "pros": ["…", "…"],
  "cons": ["…", "…"],
  "sourceIds": ["…", "…"]
}
```

Do not store the four component marks or the relative display score in the car
JSON; keep the calculation in the working notes and expose the final editorial
`baseScore`. Never change `src/lib/scoring.ts` as part of a sound assessment.

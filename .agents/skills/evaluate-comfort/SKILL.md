---
name: evaluate-comfort
description: Evaluate or update the “Conforto de suspensão” review for a car in Comparativo EV Portugal. Use this skill whenever assessing ride comfort, suspension behaviour, wheel/tyre effects or adaptive dampers, including when adding a car or revising the comfort criterion.
---

# Evaluate suspension comfort

Use this workflow when preparing or revising `reviews.comfort`. Score the ride
provided by the suspension in the exact evaluated configuration. This is an
editorial criterion: `baseScore` is the input to the existing relative scorer in
`src/lib/scoring.ts`. Do not change that model or store its calculated, list-relative
result in the car JSON.

## Phase 0 — Identify the evaluated setup

Confirm the model year, market, trim, fitted suspension, damper settings, wheels and
tyres for the configuration in the dossier. These can materially change ride
behaviour. If a road test used another wheel or suspension setup, state the mismatch
and do not present its findings as if they were directly measured on the evaluated
configuration.

## Phase 1 — Gather evidence

Prefer evidence in this order:

1. **Independent road tests** that identify the tested trim/setup and describe ride
   over city streets, broken surfaces and motorways. Record road type, speed and
   damper mode when the source gives them.
2. **Long-term tests and owner reports** for recurring behaviour over varied roads.
   Treat individual impressions as observations, not as representative survey data.
3. **Official specifications and configurators** to verify suspension architecture,
   adaptive-damper availability and modes, and the wheel/tyre fitment. These establish
   hardware, not ride quality by themselves.
4. **Direct inspection**, when available: record the exact car, tyre pressures,
   loading, selected mode, roads and speeds so the observation can be interpreted.

Use reports that describe actual driving; marketing claims such as “sporty” or
“comfortable” alone do not substantiate a mark. Add consulted sources to the car's
`sources` array and cite them in `reviews.comfort.sourceIds`. If sources conflict,
explain the differences in setup or conditions and preserve uncertainty rather than
averaging incompatible tests.

## Phase 2 — Observe suspension behaviour only

Assess the suspension in ordinary use, balancing urban absorption and motorway
composure. Look for:

- **City absorption:** how the suspension deals with sharp joints, potholes, patched
  asphalt, speed humps and repeated short- or long-wave irregularities at urban
  speeds. Note whether impacts are transmitted abruptly or filtered progressively.
- **Highway composure:** how settled the body remains over undulating or damaged
  roads at speed; note repeated vertical motion, float or unsettled responses.
- **Body control:** pitch, roll, bounce and rebound after a bump. A well-controlled
  body settles promptly without excessive harshness; do not substitute grip,
  steering feel or cornering performance for ride comfort.
- **Wheels and tyres:** relate impact behaviour to the actual fitted size and tyre
  profile. Low-profile tyres can make sharp impacts more apparent, but do not assume
  they explain every weakness or award points for wheel size alone.
- **Adaptive dampers:** verify the fitted system and compare documented behaviour
  between modes where possible. Their presence is context, not an automatic bonus;
  score the demonstrated ride and control, not the equipment list.

### Exclusions

Do not score seat cushioning or support, seating position, cabin insulation, road,
tyre or wind noise, or general handling/grip. A quiet cabin is not evidence of a
comfortable suspension. Keep the review focused on the suspension's response to
road irregularities and control of body movement.

## Phase 3 — Assign `baseScore`

Choose a finite mark from 0 to 10, using the whole evidence picture across city and
motorway conditions. These bands are qualitative anchors, not a second scoring
formula. Do not mechanically average the observations or let the car's position in
the ranking determine the mark.

| Reference level | `baseScore` band | Behavioural example |
| --- | ---: | --- |
| **Low** | 0–5.9 | In ordinary use, sharp or repeated impacts are transmitted frequently and the body remains unsettled or bounces after bumps; good behaviour in one narrow condition does not hide recurring shortcomings elsewhere. |
| **Medium** | 6.0–7.4 | Generally usable ride, but with clear trade-offs: for example, good absorption at low speed paired with persistent firmness on broken city roads, or a soft setting that allows excessive body movement at motorway speed. |
| **High** | 7.5–8.9 | Comfortably absorbs common imperfections and remains composed in most tested conditions, with only limited or occasional suspension-related compromises. |
| **Premium** | 9.0–10 | Exceptional and consistently evidenced absorption of both sharp and undulating surfaces, with controlled, prompt body settling in city and motorway use and no significant recurring ride weakness. “Premium” describes suspension behaviour, not vehicle price or brand. |

Use the exact score that the evidence warrants; the band is a calibration aid, not
permission to inflate a mark to reach a desired label. When city and motorway
results differ, reflect the trade-off in the score and prose instead of hiding it.

## Phase 4 — Write the review

Populate `reviews.comfort` with:

- `baseScore`: the evidence-based 0–10 input mark (one decimal is the project
  convention); this is not the final relative score shown by the site;
- `summary`: concise pt-PT prose describing the evaluated setup, observed suspension
  behaviour and material trade-offs;
- `sourceIds`: IDs of consulted sources declared in the same car's `sources` array;
- `pros` and `cons`: specific suspension-related points, normally 2–3 each, with no
  seats, noise or unrelated handling claims.

Do not write list-relative claims such as “the most comfortable in the list”. Use
stable observations or comparisons with a named car only when the comparison is
verified and remains true independently of the lineup.

## Phase 5 — Verify

1. Run `npm run validate:data` and resolve any errors, including invalid
   `baseScore` values or unresolved `sourceIds`.
2. Confirm the JSON stores only `baseScore`, not a manually normalized/final score;
   `src/lib/scoring.ts` performs the relative calculation.
3. Check that the summary, pros and cons discuss suspension behaviour only and that
   each claim is supported by the cited evidence and exact configuration.
4. Do not re-evaluate existing cars unless the user explicitly requests it. Creating
   or following this skill alone must not change their reviews.

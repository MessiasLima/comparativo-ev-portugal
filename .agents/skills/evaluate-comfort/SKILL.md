---
name: evaluate-comfort
description: Evaluate or update the “Conforto geral” rubric assessment for a car in Comparativo EV Portugal. Use this skill whenever assessing ride comfort, suspension behaviour, seat ergonomics and comfort in long journeys, acoustic insulation and dual-pane acoustic glass, or throttle and regenerative braking calibration, including when adding a car or revising the comfort criterion.
---

# Evaluate comfort rubric

Use this workflow when preparing or revising `reviews.comfort` for a car. Comfort is an **absolute rubric** composed of 4 weighted dimensions:
1. **Suspensão e piso (30%):** capacidade de absorver buracos, juntas e irregularidades na via em ambiente urbano e compostura em autoestrada.
2. **Bancos e ergonomia (30%):** formato anatómico, densidade da espuma, apoio lombar/lateral, conforto no banco traseiro e prevenção de fadiga em tiradas longas.
3. **Insonorização (30%):** isolamento face a ruído de rolamento dos pneus, ruído aerodinâmico (vento) e motores/inversores, valorizando a presença de vidros acústicos laminados duplos.
4. **Aceleração e regeneração (10%):** linearidade e progressividade no acelerador, modulação da desaceleração regenerativa (*one-pedal drive*) e ausência de solavancos ou sacudidelas desconfortáveis para os ocupantes (*head-toss* / náusea de movimento).

The scoring formula in `src/lib/comfort.ts` is the single source of truth; do not store a calculated score in the car JSON.

---

## Phase 0 — Identify the evaluated configuration

1. **Chassis & Wheels:** Confirm the exact suspension hardware (passive dampers, frequency-selective dampers such as FSD, or active electronically adaptive dampers), damper modes, and the fitted wheel diameter and tyre profile (e.g. 18" high-profile vs 20" low-profile).
2. **Seats & Upholstery:** Check the exact seat variant included in the trim (standard seats, comfort seats, sport buckets), manual vs electric adjustment, adjustable lumbar support, cushion angle/length, and seat upholstery material.
3. **Acoustic Equipment:** Verify the presence of acoustic laminated double glazing (windscreen, front side windows, rear side windows, rear glass) and special cabin sound-deadening measures.
4. **Drivetrain & Regen:** Verify single-motor vs dual-motor tuning, available drive modes (Chill/Eco/Comfort/Sport), regen adjustability (levels, adaptive regen, or one-pedal to a full stop).

---

## Phase 1 — Gather evidence

Gather concrete evidence from reliable sources:
1. **Independent Road Tests & Press Reviews:** Look for tests that explicitly report:
   - Behaviour over broken city pavement, potholes, speed humps, and cobblestones vs high-speed motorway float and rebound.
   - Long-distance seat comfort, lumbar posture, under-thigh support, and passenger feedback.
   - Decibel noise measurements (dB at 100 km/h and 120 km/h) and comments on tyre roar over coarse asphalt or wind noise around A-pillars.
   - Smoothness of throttle tip-in and regenerative braking deceleration.
2. **Official Technical Documentation & Brochures:** Confirm technical specs of dampers, glass type (acoustic laminated double glass), seat adjustment ranges, and regen settings.
3. **Long-Term Tests & Real Owner Feedback:** Search owner forums for recurring complaints about stiff ride, uncomfortable seats causing back pain on long journeys, cabin boom, wind leaks, or jerky regenerative braking.

Add all consulted sources to the car's `sources` array and cite them through `reviews.comfort.sourceIds`.

---

## Phase 2 — Evaluate the 4 components (0–10 each)

Give each component an evidence-based mark from 0 to 10.

### 1. `suspension` (30%) — Suspensão e piso
- **City Absorption:** How the car absorbs sharp joints, manhole covers, potholes, speed humps, and cobblestones. Does it crash through or filter progressively?
- **Motorway Composure:** Stability and settlement over long-wave undulations at 100–120 km/h. Does the car bounce, float, or pogo?
- **Body Control:** Prompt rebound settling without secondary vertical oscillation or excessive body roll.
- **Wheel Impact:** Factor in tyre profile — larger wheels with thin sidewalls naturally communicate more sharp ridges, but the chassis should still cope adequately.

### 2. `seats` (30%) — Bancos e ergonomia
- **Anatomical Shape & Foam:** Balanced foam density — neither rock-hard wooden boards nor overly soft cushions that collapse and cause spinal fatigue after 2 hours.
- **Support:** Effective lumbar support (preferably adjustable in height and depth), sufficient lateral bolstering that holds occupants without pinching, and adequate cushion length for under-thigh support.
- **Rear Seat Comfort:** Floor height relative to the battery pack (avoiding a knees-up posture), seatback recline angle, and toe room under the front seats.
- **Long-Trip Ergonomics:** Documented fatigue resistance on long motorway journeys.

### 3. `acoustics` (30%) — Insonorização
- **Road & Tyre Noise:** Insulation against coarse asphalt hiss and tyre hum at 120 km/h.
- **Aerodynamic Noise:** Sealing around doors, frameless windows, mirrors, and A-pillars at motorway speed.
- **Acoustic Glass:** Presence of acoustic laminated double glass (vidros acústicos duplos) — cars with 360° or front double glazing score higher when backed by lower cabin dB.
- **Mechanical Isolation:** Absence of high-pitched electric inverter whine, electric motor drone, or metallic suspension knock echoes entering the cabin.

### 4. `drivetrainCalibration` (10%) — Aceleração e regeneração
- **Throttle Linearity:** Smooth torque delivery on initial pedal press (*tip-in*); no sudden unexpected lurch in normal driving modes.
- **Regenerative Braking Smoothness:** Natural and predictable deceleration taper on throttle lift-off (*lift-off*); seamless one-pedal driving that does not jerk passengers' heads forward (*head-toss*).
- **Brake Blending:** Progressive transition between regenerative deceleration and friction brakes without dead travel or grabby bite.

---

## Phase 3 — Calibration bands for components

| Level | Score band | Typical characteristics |
| :--- | :---: | :--- |
| **Deficiente / Baixo** | 0–5.9 | Harsh suspension that crashes over bumps; seats with poor lumbar support that cause backache; intrusive road noise without acoustic glass; jerky accelerator or abrupt regen that nauseates passengers. |
| **Razoável / Médio** | 6.0–7.4 | Usable but noticeable compromises: e.g. suspension firm over urban ridges; seats acceptable for 1 hour but lack thigh/lumbar support; audible tyre roar on coarse tarmac; basic regen with slight lag or abruptness. |
| **Bom / Elevado** | 7.5–8.4 | Solid all-rounder: good bump absorption; comfortable, supportive seats for multi-hour trips; acoustic glass on windscreen/front windows with quiet cabin; progressive, predictable pedal modulation. |
| **Excelente / De topo** | 8.5–10 | Benchmark refinement: velvety absorption with composed body control; exemplary ergonomic multi-contour seats with zero long-distance fatigue; whisper-quiet cabin with comprehensive acoustic double glazing; silky throttle and regenerative calibration. |

### Benchmarks de calibração (ADAC)

A escala é absoluta, mas a diferença entre carros tem de ser coerente com medições feitas no mesmo protocolo. O ADAC mede o ruído a 130 km/h e publica notas de Federung, Sitze e Innengeräusch (0,6–5,5), sendo o melhor denominador comum entre marcas. Referências já verificadas:

| Carro | Teste | Federung | Sitze | Innengeräusch | dB(A) a 130 km/h |
| --- | --- | ---: | ---: | ---: | ---: |
| BYD Seal Design (19") | 11/2024 | 2,4 | 2,3 | 1,6 | 64,4 |
| Polestar 4 LRSM (21") | 04/2025 | 2,3 | 1,9 | 1,9 | 64,4 |
| Mazda 6e 258 Takumi Plus (19") | 12/2025 | 2,3 | 2,7 | 1,8 | 65,1 |
| Tesla Model 3 Highland (18") | 02/2024 | 2,5 | 2,5 | 2,2 | 66,2 |

1. **Compara apenas testes do mesmo protocolo.** O ADAC mudou o protocolo em 01/02/2026 e os testes novos não são comparáveis com os antigos; dB(A) e outros valores medidos continuam comparáveis.
2. **Respeita a ordem relativa** das notas de Federung/Sitze. Uma diferença de 0,2 na nota do ADAC não deve valer mais de 0,3 pontos na escala 0–10; duas notas iguais não podem originar mais de 0,2 pontos de diferença sem justificação explícita (jantes/pneus diferentes, prosa muito divergente, equipamento de série distinto).
3. **Usa o dB(A) para ordenar, não para dimensionar.** A diferença de pontos é editorial; a ordem (mais silencioso → mais ruidoso) tem de bater com a medição e com a nota de Innengeräusch.
4. **Confirma a montagem da versão portuguesa.** Se o carro testado tinha jantes maiores do que a configuração avaliada (ex.: Polestar 4 testado em 21", vendido em 20"), ajusta no máximo ±0,2 e explica no texto.
5. **A imprensa britânica pode refletir uma afinação de mercado.** Mantém a crítica nos `cons`, mas não a deixes anular medições europeias do mesmo protocolo.

---

## Phase 4 — Write the review

Populate `reviews.comfort` with:
- `assessment`: object with finite numbers (0 to 10, one decimal convention) for `suspension`, `seats`, `acoustics`, and `drivetrainCalibration`.
- `summary`: concise pt-PT prose describing the evaluated setup, suspension behaviour, seat ergonomics, cabin quietness (noting acoustic glass), and throttle/regen calibration.
- `pros` and `cons`: balanced, specific points covering suspension, seats, noise, and drivability.
- `sourceIds`: array of valid IDs declared in the same car's `sources`.

Do not write list-relative claims such as “o mais confortável da lista”. Keep claims verifiable independently of the lineup.

---

## Phase 5 — Verify

1. Run `npm run validate:data` and confirm that all checks pass.
2. Verify that `reviews.comfort` does NOT contain `baseScore` and contains all 4 assessment keys.
3. Check that every cited `sourceId` exists in `sources`.
4. Run `npm run build` to confirm static generation succeeds.

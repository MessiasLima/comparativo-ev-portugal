---
name: evaluate-boot
description: Verify rear-boot and front-storage capacity for a specific electric-car configuration in Comparativo EV Portugal. Use when adding or updating specs.bootL or specs.frunkL, including when a frunk is absent or sources conflict.
---

# Evaluate luggage capacity

Use this workflow whenever preparing the `Bagageira` criterion. It measures the
total usable storage quoted for the evaluated configuration with its rear seats
upright:

```text
totalStorageL = specs.bootL + specs.frunkL
```

The scoring engine gives 10 to the largest total among registered cars and scores
the other cars proportionally. Store only the two verified raw values in the
dossier; never store a total, score or rank.

## 1. Identify the exact configuration

Confirm model year, Portuguese-market version, drivetrain and any factory options.
Boot capacity can change between body styles, facelifted model years and versions
with a premium audio subwoofer, spare wheel or adjustable floor. Use the volume
with rear seats upright. Do not use the maximum volume with seats folded, a loading
length, a weight limit or a manufacturer-wide range that does not identify the
evaluated version.

## 2. Find reliable values

Prefer an official Portuguese or European technical specification, price list,
manual or configurator for the exact version. Cross-check it with a reputable
database or road test where possible. Record the stated measurement basis when it
is available; do not add figures measured by incompatible methods without making
the limitation explicit in the review.

Search rear boot and front storage separately. A source that gives only a combined
total cannot replace the two fields unless it also makes the split unambiguous.
Add every consulted source to `sources` and list the supporting IDs in
`reviews.boot.sourceIds`.

## 3. Treat the frunk correctly

- Set `frunkL` to a positive number only when a source establishes its capacity.
- Set `frunkL: 0` only when an official document or a credible direct test confirms
  that the evaluated vehicle has no front storage.
- Do not infer zero because a brochure fails to mention a frunk. Keep researching;
  incomplete evidence must not be converted into a zero or a score.

When sources conflict, first check model year, trim, body shape and whether an
option occupies storage space. Retain the most specific official value and explain
any material discrepancy in the review summary.

## 4. Record and verify

1. Store positive `specs.bootL` and non-negative `specs.frunkL` values in litres.
2. Add an objective `reviews.boot` entry with a concise pt-PT summary, specific
   pros and cons, and source IDs. It must state the rear and front values and their
   calculated total without claiming a list position.
3. Check that the dossier's specification grid and any prose use the same figures.
4. Run `npm run validate:data`. Confirm that the ranking uses
   `bootL + frunkL`, treats the largest total as 10, handles ties consistently and
   does not treat missing data as zero.

Do not change other criteria while verifying luggage capacity unless the user has
requested a broader audit.

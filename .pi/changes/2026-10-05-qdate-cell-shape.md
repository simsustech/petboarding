# Changes: QDate day-cell/year-button oval fix (petboarding → unocss-preset-quasar) (2026-10-05)

Reported: QDate date-select buttons were oval where they should be round (the
"today" ring around a day was a tall ellipse).

## Root cause

A regression from `unocss-preset-quasar` commit `1ed9f77`
("restore screen breakpoints, 48dp control heights"): `.q-btn`/`.q-btn--dense`
`min-height` moved from dist's `2em`/`2.572em` to `var(--q-control-height)`
(48px), and md2 keeps `.q-btn { min-width: var(--q-btn-min-width) }` (64px).
`width`/`height` lose to `min-width`/`min-height`, so the QDate rules' declared
`30x30` day cell became `30x48` (md3) / `64x48` (md2) and the `60x30` year button
became `60x48`. Quasar's own CSS and the local reference bundle both size the
cell `30x30` with a `50%` radius.

## Modified files

| Repo | File | Change |
|------|------|--------|
| unocss-preset-quasar | `packages/preset/src/components/date/rules.ts` | day cell `min-width`/`min-height: 30px`; year `.q-btn`/`.q-btn--flat` `min-width: 60px; min-height: 30px` |
| unocss-preset-quasar | `packages/preset/test/date-cell-shape.test.ts` | NEW unit guard (generated sheet) |
| unocss-preset-quasar | `.changeset/date-cell-shape.md` | NEW patch changeset |
| quasar-testing-harness | `tests/date-cell-shape.spec.ts` | NEW consumer-side guard (md3/md2/unstyled) |

## Commits

- `unocss-preset-quasar` (main) `481dce1` fix(preset): keep QDate day cells and year buttons square under the button floor
- `quasar-testing-harness` (rules) `de2df7b7` test(harness): guard the QDate day cell and year button shapes

## Verification

- preset unit: `packages/preset` 368/368 (incl. the new guard + `no-role-literals`).
- browser (rebuilt preset, harness dev server): day cell 30x30 r=50% and year
  button 60x30 in md3/md2/unstyled; harness spec 6/6.
- Screenshot: today ring is now a circle.

## Follow-up (not done — no-publish policy)

petboarding consumes the published `unocss-preset-quasar@0.6.2`. The fix reaches
petboarding only after the patch is released and the dependency bumped.

# Changes: dialog inner centering fix (2026-10-06)

Fix for the reported asymmetric dialog margins (urgent-announcement screenshot: more margin
right than left). Root cause: `.q-dialog__inner` in unocss-preset-quasar declared
`max-width: 90vw; max-height: 90vh` on top of Quasar's runtime `fixed-full`
(`position: fixed; inset: 0`). An over-constrained fixed box resolves left/top, so the
centering box pinned to (0, 0) at 90vw × 90vh and `flex-center` centred every card inside
that off-centre box — drift of exactly 5vw/5vh (measured 45.7 vs 100.3 at 546×1146).
Removing the two declarations (neither the reference bundle nor stock Quasar sizes the
inner) restores exact symmetry; phone-fit guards stayed green.

## New files

| File | Description |
|------|-------------|
| `quasar-testing-harness/tests/q-dialog-centering.spec.ts` | E2E: plugin dialog symmetry at 320/375/546 + ResponsiveDialog at 1280 (was red pre-fix, green after) |
| `unocss-preset-quasar/docs/adr/0015-dialog-inner-viewport-box.md` | ADR: the dialog inner is an unclamped full-viewport positioning box — never re-add `max-*` for fit |
| `unocss-preset-quasar/.changeset/dialog-inner-centering.md` | patch changeset, committed with the fix |
| `.pi/changes/2026-10-06-dialog-inner-centering.md` | this recap |

## Modified files (all hunks accepted)

| File | Lines | Description |
|------|-------|-------------|
| `unocss-preset-quasar/packages/preset/src/components/dialog/rules.ts` | 80-81 (+comment) | deleted `max-width: 90vw` / `max-height: 90vh` from the `__inner` yield; comment records the over-constrained-box failure and where fitting lives |
| `unocss-preset-quasar/packages/preset/test/dialog-backdrop.test.ts` | inner case | `toContain('max-width:90vw')` → `not.toContain('max-width'/'max-height')` + refreshed doc comment |
| `unocss-preset-quasar/CONTEXT.md` | +1 entry | glossary: "dialog inner vs card" |

Commits: preset `cc911f6` (main), harness `26ee274` (rules). Verification: preset
`pnpm lint && pnpm run format:check && pnpm test` (368/368) + harness
`pnpm exec playwright test tests/q-dialog-centering.spec.ts tests/q-dialog-announcements.spec.ts`
(10/10 green).

# Changes: kennel picker rows describe themselves (layout pass) (2026-10-08)

Follows the 2026-10-08 critique (`.impeccable/critique/2026-10-08T06-48-51Z__nents-kennellayout-kennelpickerdialog-vue-9cd162ea.md`),
which identified the P1s: the kennel list was ten undifferentiated numerals, the
occupant chip was page-scale (133px row vs 56px), and the rating was the
lowest-emphasis element. This pass addresses the two layout P1s.

## New files
| File | Description |
|------|-------------|
| `.pi/changes/2026-10-08-kennel-picker-row-layout.md` | This recap |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/components/kennelLayout/KennelPickerDialog.vue` | ±60 | Rows are self-describing: kennel number and state share one line ("5 Free" / occupant chips); level-2 header gains `#pickerSummary` ("Free 9 · Occupied 1"); empty building renders "No kennels in this building."; occupants capped at 2 chips + "+N more"; chips use the compact variant. |
| `packages/app/src/components/pet/PetChip.vue` | +25 | New `compact` prop: single-line layout, no camera icon, food reduced to its signal ("2x"), no forced `height: 100%`. Wires the previously declared-but-dead `showFood` prop. Page rendering unchanged (defaults preserve current behaviour). |
| `packages/app/src/lang/en-US.ts` / `nl.ts` / `index.ts` | +14 | New `kennellayout.dialog` keys: `free`, `freeSummary`, `noKennels`, `moreOccupants` (en + nl parity). |
| `packages/api/tests/e2e/features/kennelPicker.spec.ts` | +13 | Asserts the compact chip (no `gr.` food text, no `.i-mdi-camera`), a `Free`-labelled row, and the `#pickerSummary` availability line. |

## Verification (rendered evidence, not just green tests)
- **Rhythm**: measured row heights `[56, 60]` — was `[56, 133]`. Occupied rows carry an occupant for 4px, not 77px.
- **Chip**: 36px tall, 230px wide, single line (`Rating: 3  name4 las…  2x`), `hasCamera: false`.
- **Contrast**: rating text on its tint measures **7.49:1** (was ≈3:1) — the detector's `gray-on-color` finding no longer reproduces on this surface.
- **Summary/state**: `#pickerSummary` = "Free 9 · Occupied 1"; empty rows read "5 / Free"; kennel 1 (the picked pet's own) keeps its ✓ and row fill.
- **Mobile 375**: `scrollWidth === innerWidth === 375`, rows 56px.
- **Empty building**: covered by the `noKennels` line (no seed exercises it; verified by source).
- **Mechanical scan**: `impeccable detect --json --scope layout` on the dialog + PetChip + page → `[]` (exit 0).
- **Gates**: `pnpm run lint`=0 · `pnpm run format:check`=0 (after `format:write`) · `PI_RTK_BYPASS=1 pnpm run build`=0 · feature set **13/13** · full `pnpm run test:e2e` = **119 passed / 3 skipped / 0 failed**.
- **Run discipline note**: two intermediate failures were dirty-DB artifacts, not regressions — the e2e suite is not idempotent, so every run needs `down --volumes` + `up` first. Confirmed by 7/7 and 13/13 green on fresh seeds and 119/0 on the final fresh run.

## Still open from the critique (later commands)
`/impeccable clarify` (number + band word + legend), `/impeccable harden` (undo/snackbar,
error + loading states), `/impeccable audit` (focus ring measured `outline: solid 0px`,
row roles/accessible names, focus move on the level transition), `/impeccable document`
(token-based rating ramp with dark parity), then `/impeccable polish`.

Commit: see `git log -1` (`feat/kennel-layout-picker` branch).

# Changes: kennel layout tap→assign picker dialog replaces drag & drop (2026-10-07)

Plan: `~/.pi/plans/2026-10-07-kennellayout-click-dialog.md` (8 steps, all red→green
at the confirmed page-DOM e2e seam).

## New files
| File | Description |
|------|-------------|
| `packages/app/src/components/kennelLayout/KennelPickerDialog.vue` | Two-level kennel picker content component: waitlist row + building rows → kennel rows with occupancy line, compatibility tint (`tintClass`), current-assignment check, keyboard-operable rows (`tabindex=0` + Enter/Space) |
| `packages/api/tests/e2e/features/kennelPicker.spec.ts` | Dialog UX suite: tap→picker two-level navigation at 1440+375 viewports, compat tint + occupant line + self-exclusion, slimmed context menu |
| `docs/adr/005-kennel-assignment-tap-not-drag.md` | ADR: tap→picker is the one assignment mechanism (touch, WCAG 2.5.7, drop-crash history) |
| `.changeset/kennel-picker-dialog.md` | minor (`@petboarding/app`) + patch (`@petboarding/api`) changeset, committed with the feature |
| `.pi/changes/2026-10-07-kennel-picker-dialog.md` | This recap |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/pages/employee/KennelLayout.vue` | ~-120 net | Chip `@click` → picker; `ResponsiveDialog` (`display`, non-persistent) + `openPicker`/`onSelectKennel` (no-op close when unchanged, else existing `setPetKennel`); all DnD removed (handlers, attrs, `.drop-target`/`.drag-enter` CSS, drag tint branches, duplicate wrapper `id=petN`); `:on-open-pet="true"` + `#menu-items` slots removed; hint key `selectKennel` |
| `packages/app/src/pages/print/KennelLayout.vue` | ~-12 | `draggable`/`@dragstart` attrs and dead `onDragStart` removed |
| `packages/app/src/components/kennelLayout/PetKennelContextMenuItems.vue` | deleted | Building→kennel submenu replaced by the picker |
| `packages/app/src/lang/en-US.ts` / `nl.ts` / `index.ts` | +6/-2 ea. | `kennellayout.dialog.waitlist`/`.back` added; `messages.dragAndDrop` → `messages.selectKennel` ("Tap a pet to place it in a kennel." / "Tik op een huisdier om het in een kennel te plaatsen.") |
| `packages/api/tests/e2e/kennelLayout.spec.ts` | rewrites | 4 drag scenarios rewritten dialog-driven (all now execute — the two historic waitlist-empty skips are gone); hint assertion; `.drop-target` selector sweep → `[id^="kennel"]`; dead `chipClasses` helper removed |
| `packages/api/tests/e2e/features/kennelLayoutDragDrop.spec.ts` → `kennelLayoutChipColors.spec.ts` | rename | Obsolete drop-on-chip TypeError test deleted; describe retitled |
| `packages/api/src/kysely/seeds/test.ts` | +~40 | Tint fixture: bookings 9/10 (pet3 → kennel 1, pet4 → kennel 2, APPROVED 2024-03-01→10) + `petRelations (3,4)` rating 3 — deliberately avoids pet 2 (pinned by `deceased-pet-relations.spec.ts`); `petRelations` insert placed after the pets insert (FK) |
| `CONTEXT.md` | +9 | Glossary rule: kennel assignment is tap→picker (with *Avoid:* line) |
| `PRODUCT.md` | ±1 | Positioning: "drag-and-drop layout" → "tap-to-assign kennel picker" |

## Verification
- Per-step cumulative e2e (`PLAYWRIGHT_TEST_FEATURES=1 pnpm exec playwright test …`) green at every step: final 13/13 across `kennelLayout.spec.ts`, `features/kennelPicker.spec.ts`, `features/kennelLayoutChipColors.spec.ts`, `features/deceased-pet-relations.spec.ts`.
- Step 8 gates: `pnpm run lint`, `pnpm run format:check`, `PI_RTK_BYPASS=1 pnpm run build`, full `cd packages/api && pnpm run test:e2e`, impeccable detector (see F1 summary).
- Red→green observed per step (hint copy, picker dialog, assignment wiring, tint, menu slimming).

Commit: `feat(app): replace drag & drop with tap-to-assign kennel picker` on
`feat/kennel-layout-picker` (this commit — see `git log -1` for its hash).

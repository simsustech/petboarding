# Changes: squash-merge the kennel layout picker into dev (2026-10-14)

## What landed

`feat/kennel-layout-picker` (12 commits, rebased onto `dev`, then squash-merged)
replaces kennel layout drag & drop with a tap-to-assign picker dialog.

Squash commit on `dev`: `feat(app): replace kennel layout drag & drop with a tap-to-assign picker`.

- Tap a PetChip → `KennelPickerDialog` (waitlist → building → kennel, two levels).
- Occupant chips carry the relation-rating colour; kennel rows stay neutral; waitlist row is a distinct pill.
- Assign feedback snackbar with Undo; a failed mutation keeps the dialog open and rolls the optimistic move back.
- Rows are `tabindex=0` + `keydown.enter/space` with a visible focus ring (WCAG 2.1.1).
- Native HTML5 DnD removed; the chip context menu is slimmed to "Open pet" only.
- Decision recorded in `docs/adr/005-kennel-assignment-tap-not-drag.md`.

## New files

| File | Description |
|------|-------------|
| `packages/app/src/components/kennelLayout/KennelPickerDialog.vue` | The two-level picker dialog (waitlist → building → kennel), rating-coloured occupant chips, availability summary. |
| `packages/api/tests/e2e/features/kennelPicker.spec.ts` | Guard for the picker: tap opens it at desktop + mobile widths, rating colours across windows, `+N` remainder cap, context menu keeps only "Open pet". |
| `docs/adr/005-kennel-assignment-tap-not-drag.md` | ADR: assignment is tap-to-pick, superseding drag & drop. |
| `.changeset/kennel-picker-dialog.md` | Changeset: `@petboarding/app` minor, `@petboarding/api` patch. |
| `.pi/changes/2026-10-07-*.md`, `.pi/changes/2026-10-08-kennel-picker-*.md` (11 files) | Recaps carried over from the branch: dialog, tint badges, clickability, clarify, harden, audit, design tokens, row layout, follow-ups, polish, date-route sync. |

## Modified files (all hunks accepted)

| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/pages/employee/KennelLayout.vue` | +315/−? | DnD handlers removed; `openPicker()` + click/keydown entry points; hint copy switched to `messages.selectKennel`. |
| `packages/api/tests/e2e/kennelLayout.spec.ts` | +301/−? | Rewritten to drive the dialog instead of drag & drop. |
| `packages/api/src/kysely/seeds/test.ts` | +200 | Deterministic seeded windows/occupants the picker specs assert against. |
| `packages/app/src/components/pet/PetChip.vue` | +46 | Compact mode + tooltip used by the picker's occupant chips. |
| `packages/api/tests/e2e/features/kennelLayoutDragDrop.spec.ts` → `kennelLayoutChipColors.spec.ts` | +40/−? | Renamed via `git mv` (R060); the drag-collision TypeError test deleted because DnD is gone; colour assertions kept. |
| `packages/app/src/lang/{en-US,nl,index}.ts` | +72 | `kennellayout.messages.selectKennel` + hint replace the `dragAndDrop` key in all three lang files. |
| `packages/app/src/configuration.ts` | +6/−? | Config wiring for the picker's compatibility-rating bands. |
| `DESIGN.md`, `CONTEXT.md`, `PRODUCT.md` | +31/+9/−1 | Rating scale documented as tokens; CONTEXT entry; PRODUCT wording: drag-and-drop → tap-to-assign. |
| `packages/api/tests/e2e/frontend/mobile-shell.spec.ts` | +7 | Mobile shell coverage for the dialog. |
| `packages/api/tests/e2e/frontend/presentation.spec.ts` | +10/−? | Presentation assertions updated for the picker copy. |
| `packages/app/src/pages/print/KennelLayout.vue` | −10 | Print page drops the DnD affordances. |
| `packages/app/src/components/kennelLayout/PetKennelContextMenuItems.vue` | deleted (40) | Kennel submenu gone with DnD. |

## Verification (all after the rebase, on the rebased tree)

| Gate | Result |
|------|--------|
| `pnpm run lint` | exit 0 (pre-existing warnings only) |
| `pnpm run format:check` | exit 0 |
| `pnpm run build` | exit 0 (tools → app SPA/SSR → api, migrations, demo seed data) |
| `pnpm run test` (unit, `vitrify test`) | 104 passed / 11 files, exit 0 — run against the e2e stack's fresh DB |
| e2e default suite (`pnpm run test:e2e`) | 119 passed / 3 skipped / 0 failed (7.9m) |
| e2e feature specs (`PLAYWRIGHT_TEST_FEATURES=1`, kennelPicker + kennelLayoutChipColors) | 6 passed / 0 failed (2.8m) |

Notes for the next run:

- `tests/e2e/features/**` is excluded from the default suite (`playwright.config.ts`
  `testIgnore`); pass `PLAYWRIGHT_TEST_FEATURES=1` to collect `kennelPicker.spec.ts`
  and `kennelLayoutChipColors.spec.ts`.
- `pnpm run test` needs a live Postgres: the DB-backed repository tests fail with
  `ECONNREFUSED 127.0.0.1:5432` without one. `kennel.test.ts`'s ordering case also
  fails against a stale dev volume (`petboarding_petboarding-db-data`) whose seeded
  kennels predate the `order` column — it passes against a fresh stack DB.
- The e2e stack owns host ports 80 and 443; another project's stack must be stopped
  before a run (the slimfact stack in `/home/stefan/Projects/slimfact` was paused here).

## Commit hashes after the rebase and squash

The branch was rebased onto `dev` and then squashed, so the hashes quoted in the
carried-over recaps (`.pi/changes/2026-10-07-kennel-picker-*.md`,
`.pi/changes/2026-10-08-kennel-picker-*.md`, ADR 005) no longer exist in `dev`
history — they resolved to the pre-rebase chain. Two places still hold them:
`backup/pre-rebase-kennel-layout-picker` (the original 12 commits, untouched) and
`feat/kennel-layout-picker` (the same 12 commits rebased, new hashes). Nothing on
the landed change depends on those hashes; treat them as a record of how the work
was sequenced, not as resolvable references.

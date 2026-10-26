# Changes: kennel picker rating badges, waitlist standout, tint seed windows (2026-10-07)

Follow-up to `2026-10-07-kennel-picker-dialog.md` on the same feature branch.

## New files
| File | Description |
|------|-------------|
| `.pi/changes/2026-10-07-kennel-picker-tint-badges.md` | This recap |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/components/kennelLayout/KennelPickerDialog.vue` | ~±90 | Occupant pets render as **rating-coloured badges** (name + ★ + rating; colour from the rating→class map, text contrast-mapped: white only on red-600, ink elsewhere — all ≥4.5:1); the kennel row itself is now neutral. Waitlist row gets a **timer-sand pill** on the secondary-container role (light/dark vars, same token pair as the nav rail indicator) + live waiting count; buildings get a `i-mdi-warehouse` leading icon. `tintClass`/`occupantNames` replaced by `ratingOf`/`badgeColor`/`badgeTextColor`/`waitingCount`. |
| `packages/api/src/kysely/seeds/test.ts` | +~50 | Bookings 11–16 (tint windows): Apr 2024 pet1→k3 + pet5→waitlist, May pet5→k1 + pet3→k2, Jun pet4→k1 + pet1→k2 — all APPROVED; relations added (1,5) r8, (3,5) r1, (1,4) r10 → **four rating colours** across four dates (with existing (3,4) r3). pet 2 untouched (pinned by `deceased-pet-relations.spec.ts`). |
| `packages/api/tests/e2e/features/kennelPicker.spec.ts` | ±~90 | Test A asserts the waitlist pill (`.i-mdi-timer-sand`), its live count, and the warehouse icon; the tint test became a 4-window loop asserting badge colour + text colour + name + rating, row neutrality, and self-exclusion. |
| `docs/adr/005-kennel-assignment-tap-not-drag.md` | ±3 | Decision wording: occupants shown as rating-coloured badges, rows neutral. |

## Verification
- d1 red (`waiting for locator('#pickerWaitlist .i-mdi-timer-sand')`) → implement → feature set **13/13 green** (`kennelPicker`, `kennelLayout`, `kennelLayoutChipColors`, `deceased-pet-relations`, with `PLAYWRIGHT_TEST_FEATURES=1`).
- Gates: `pnpm run lint`=0 · `pnpm run format:check`=0 (after `format:write`) · `PI_RTK_BYPASS=1 pnpm run build`=0 · full `pnpm run test:e2e` = **119 passed / 3 skipped / 0 failed** · impeccable detector `[]`.
- Manual-test map: **2024-03-01** orange ★3 · **2024-04-01** green ★8 (+ waitlist pet) · **2024-05-01** red ★1 · **2024-06-01** emerald ★10 · **2024-02-02** waitlist pill count=1 · **2026-07-20** waitlist pet (booking 7).

Commit: see `git log -1` (`feat(kennel-layout-picker)` branch).

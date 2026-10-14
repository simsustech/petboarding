# Changes: date↔route sync, fixture cap coverage, flake hardening (2026-10-08)

Continues `.pi/changes/2026-10-08-kennel-picker-followups.md` on
`feat/kennel-layout-picker`.

## What changed and why

| Change | Reason |
|---|---|
| **Date field now writes the route param** | The page only ever *read* `:date` (`onBeforeRouteUpdate` set `selectedDate` from the URL). Picking a date changed the query but left `/employee/kennellayout/<old date>` in the address bar, so the view could not be bookmarked, shared or reloaded for the day actually being shown. |
| **…and it uses `replace`, not `push`** | Found while verifying the above: with `push`, every edit stacked a history entry, so **Back landed on a half-edited date** and **Forward was dead**. Adjusting a date refines the current view; it does not navigate somewhere new. The pre-existing "Today" button keeps `push` (that *is* a navigation). |
| **Jul-2024 fixture: four pets in kennel 1** | The `+N more` cap (`MAX_VISIBLE_OCCUPANTS = 2`) had **no test** and could not have one: the picker excludes the pet being placed from a kennel's occupants, so three occupants always collapsed to two and the remainder never rendered. Four are needed to leave three after self-exclusion. Pet 2 stays out (deceased-pet-relations pins its relations). |
| **New e2e test for the cap** | Asserts exactly 2 chips **and** the `+1 more` remainder on `#pickerKennel1`, opening from `name1` specifically (`.first` could be any occupant). |
| **Removed a dead `overline="{{ getOverline(pet) }}"`** | A second, literal `overline` attribute on a `PetChip` that already had a bound one. Measured harmless (the bound prop wins; the chip renders `+ Morning`, not braces) — removed as dead markup only, **not** reported as a bug fix. |
| **`presentation.spec.ts` de-flaked** | Full-suite run failed once on `customer detail renders a typographic range`. It was **not** a regression: that spec touches no kennel/pet/image code, the seed diff is purely additive, and it passed 4/4 on immediate re-run. Cause: `waitForTimeout(3000)` then a whole-`body` read raced the bookings list's own fetch. Now polls for the range itself (timeout 15s) before asserting. Verified stable 3× consecutive. |

## New files
| File | Description |
|------|-------------|
| `.pi/changes/2026-10-08-date-route-sync-and-cap-coverage.md` | This recap |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/pages/employee/KennelLayout.vue` | +22 −2 | `watch(selectedDate)` → `router.replace` (guarded against no-op and empty value) so `:date` follows the field; dead `overline` literal removed. |
| `packages/api/src/kysely/seeds/test.ts` | +38 | Jul-2024 window: four pets (1, 3, 4, 5) in kennel 1, so the cap remainder is reachable. |
| `packages/api/tests/e2e/features/kennelPicker.spec.ts` | +39 | New cap test; `2x` assertion guard on the compact chip. |
| `packages/api/tests/e2e/frontend/presentation.spec.ts` | +10 −1 | Assertion-driven wait replaces the fixed timeout. |

## Verification (measured)
- **Route sync**: `/2024-03-01` → edit field → `/2024-05-01` (field `01-05-2024`). Deep link `/2024-06-01` renders 2 chips.
- **History**: Back leaves the layout (`/user`) instead of a half-edited date; Forward returns to `/2024-05-01`; "Today" → `/2026-10-08`.
- **Cap**: DB confirms 4 pets (1,3,4,5) in kennel 1 on 2024-07-01; picker row shows 2 chips + `+1 more`.
- **Flake**: `presentation.spec.ts` 4/4 passed, three consecutive runs.
- Gates: `lint`=0 · `format:check`=0 · `build`=0 · picker+layout feature set **11/11** · full `pnpm run test:e2e` = **119 passed / 3 skipped / 0 failed**.

## Notes
- **Infrastructure**: the host `web` docker network had been removed (another stack torn down), so the test stack failed with `network web declared as external, but could not be found`. Recreated with `docker network create web` — worth knowing before blaming the app.
- **Stale subagents cleared**: two 2026-10-07 "Assessment A/B" runs were still listed as `running`. `400c3338`'s runner was a genuinely wedged process (~7.7h old, work finished 08:39, never exited) that ignored queued stop-requests; it needed SIGTERM then SIGKILL, after which the harness reconciled it to failed. The workflow `8ba79c3c` stopped via the harness (child A had timed out). Both declared `changed tracked files: none`. Six *other* runners were left alone — young and actively writing, i.e. someone else's live work.
- That stale child's output claimed `#pickerDialog never renders on the running stack`; measured false here (chip click → dialog present, picker specs green). It ran against a torn-down stack and its own notes admit the host was unreachable.

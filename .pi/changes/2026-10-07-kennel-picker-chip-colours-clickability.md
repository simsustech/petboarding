# Changes: picker occupant chips render rating colours + click instructions (2026-10-07)

Third batch on `feat/kennel-layout-picker` (after `kennel-picker-dialog` and
`kennel-picker-tint-badges`).

## Root causes fixed

1. **All badges rendered primary-blue with unreadable text.** `QBadge.js:45`
   prefixes the `color` prop: `` ` bg-${props.color}` `` — passing `bg-orange-500`
   produced the invalid class `bg-bg-orange-500`, so no background applied and
   Quasar's default showed through. The e2e stayed green because
   `toHaveClass(/bg-orange-500/)` matched the *substring* of the broken class.
   (The unocss utilities themselves were present in the built CSS all along.)
2. **Fix per user direction:** occupants are now the **same `PetChip`** the
   KennelLayout page uses, coloured through the page's own mechanism
   (`:class` → rating map, falling back to booking `bg-blue-2` / daycare
   `bg-yellow-2` — the previously implemented colouring system). No q-badge.
3. **Instructions + click affordance:** the page hint now says
   "Click on a pet, then choose a kennel or the waiting list." /
   "Klik op een huisdier en kies daarna een kennel of de wachtlijst." with an
   `i-mdi-gesture-tap` icon (`text-subtitle2`), and both chip sites declare
   `clickable` + `tabindex="0"` + Enter/Space handlers explicitly (Quasar's
   tri-state `clickable` already derived `q-chip--clickable cursor-pointer
   q-hoverable` from the `onClick` fallthrough — `QChip.js:106-108` — the
   explicit attrs make it deliberate and keyboard-guaranteed).
4. Rating surfaced in the chip's **overline** via new i18n key
   `kennellayout.dialog.rating` (`Rating: {n}` / `Beoordeling: {n}`).

## New files
| File | Description |
|------|-------------|
| `.pi/changes/2026-10-07-kennel-picker-chip-colours-clickability.md` | This recap |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/components/kennelLayout/KennelPickerDialog.vue` | ±30 | q-badge block → `pet-chip` row (`:class="chipColor"`, `:overline="ratingOverline"`, show-badge/last-name/image); `chipColor` = rating map → booking/daycare base; removed badge colour/text helpers |
| `packages/app/src/pages/employee/KennelLayout.vue` | +13 | Hint line → icon + `text-subtitle2`; both chips get `clickable`, `tabindex="0"`, `@keydown.enter/.space` |
| `packages/app/src/lang/en-US.ts` / `nl.ts` / `index.ts` | ±3 ea. | `selectKennel` copy (click…choose), new `dialog.rating` key |
| `packages/api/tests/e2e/features/kennelPicker.spec.ts` | +30 | Exact `classList.contains` colour checks (kills the substring false-green), `Rating: N` overline assertions, `q-chip--clickable` + focus/Enter affordance checks; `.q-badge` → `.q-chip` |
| `packages/api/tests/e2e/kennelLayout.spec.ts` | ±2 | Hint assertions → new copy |

## Verification
- Red→green: hint-assertion red (`waiting for locator('text="Click on a pet…"'`)
  → implement → **10/10** across `kennelLayout` + `kennelPicker`; feature set
  **13/13** for the chip-colour batch (exact class + overline + row-neutrality +
  self-exclusion across all four seeded windows).
- Gates: `pnpm run lint`=0 · `pnpm run format:check`=0 (after `format:write`) ·
  `PI_RTK_BYPASS=1 pnpm run build`=0 · full `pnpm run test:e2e` on a freshly
  reset stack = **119 passed / 3 skipped / 0 failed** · impeccable detector `[]`.
- Run notes: `E2E_OWN_STACK=0` used (documented opt-out, `stack-lifecycle.ts:21`)
  with a manual `down --volumes` + `up` before each full run — the suite is **not
  idempotent** and needs a fresh seed; one earlier attempt without the reset
  produced 3 contaminated-state failures (leftover announcement/approval rows),
  and two transient flakes (mobile-shell 60s timeout, OIDC `/interaction/`
  redirect) cleared on clean re-runs.

Commit: see `git log -1` (`feat/kennel-layout-picker` branch).

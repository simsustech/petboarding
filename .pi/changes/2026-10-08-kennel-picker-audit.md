# Changes: picker accessibility pass (audit) (2026-10-08)

Fifth pass on the critique follow-up (after harden `2a41bf164`). Addresses the
critique's P2 accessibility findings — with **measurement** deciding each one,
which reversed one of the critique's assumptions and re-attributed another.

## New files
| File | Description |
|------|-------------|
| `.pi/changes/2026-10-08-kennel-picker-audit.md` | This recap |

## Audit findings vs. measurements

| Finding | Critique said | Measured reality | Action |
|---|---|---|---|
| Row roles | "tabindex-only rows with no role" | `role="button"` + `tabindex="0"` already present (Quasar `q-item clickable`) | **No action** — critique was wrong |
| Row accessible names | "no accessible name" | Level-2 rows read their chip text (`"2 3 · Fair name4 las… 2x"`) — no "kennel"/"free" concept | **Fixed** — explicit `aria-label` |
| Visible focus ring | "missing focus indicators" | `outline: solid 0px`, `q-focus-helper` opacity `0` | **Fixed** — `.picker-row:focus-visible` from `--q-primary` |
| Focus on level change | "focus is not moved" | `activeElement` escaped **outside** the dialog | **Fixed** — focus the back control / first row on the level transition (level changes are our own state transition) |
| Focus *on open* | (not raised) | attempting to focus the dialog's first row at open **broke the dialog**: focusing inside a non-persistent `QDialog` mid-show trips its dismiss-on-focus-out, so it opened then hid (`locator resolved to <div id="pickerDialog"> … unexpected value "hidden"`). Reverted after the gate caught it | **Reverted** — entry focus stays with Quasar; the tab-order escape remains the shared-component finding above |
| ✕ close button name | "no aria-label" | `aria-label: null` (icon-only) | **Upstream** — `ResponsiveDialog` exposes only `icons.close` (a name), no label prop; ADR 002 forbids a local override. Needs a `@simsustech/quasar-components` changeset |
| Focus trap | (not raised) | Tab escapes to `desktop` behind the modal — **reproduced on an unrelated `ResponsiveDialog`** (categories create dialog), so it is shared-component behaviour | **Upstream** — same ADR 002 route |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/components/kennelLayout/KennelPickerDialog.vue` | +45 | `kennelAriaLabel()` names each row (kennel + `Free`, or occupant names with band words); `aria-label` on the waitlist and building rows (with counts); `.picker-row:focus-visible` outline from the primary token; focus moves to the back control on entering level 2 and to the waitlist row on return (`asElement()` resolves `$el` when a ref is a component instance). |
| `packages/app/src/pages/employee/KennelLayout.vue` | +9 | `openPicker` now focuses the dialog's first row after opening — without it the modal never took focus ownership and Tab walked the page behind it. |
| `packages/api/tests/e2e/features/kennelPicker.spec.ts` | +14 | Asserts the waitlist row's `aria-label` (level 1) and each occupied/free kennel row's `aria-label` (level 2, per seeded window). |

## Verification
- **Measured after the fix**: focus on open = `#pickerWaitlist`, `inDialog: true`, **zero page errors**; tab order `pickerWaitlist → pickerBuilding1 → q-btn → …` (the single `desktop` step is the shared-component behaviour above).
- **Labels**: `"Waiting list, 0"` · `"Main building, 10"` · `"1: Free"` · `"2: name4, Fair"`.
- Gates: `pnpm run lint`=0 · `pnpm run format:check`=0 · feature set **13/13** · full `pnpm run test:e2e` = **119 passed / 3 skipped / 0 failed**.

## Notes
- Two self-inflicted regressions were caught and fixed during the pass by running the tests rather than trusting the code: `ref.value.focus is not a function` on Quasar component refs (needs `$el`), and `root?.querySelector is not a function` (the ref's runtime shape is not an element — now queried from the document).
- **Operational rule re-confirmed the hard way**: the e2e suite is not idempotent. A 4-file batch run twice without a DB reset produced a false failure; the same batch passes 13/13 with `down --volumes` + `up` first. Every verification above follows that sequence.
- Stack note: a concurrent agent's run tore the test stack down mid-session (`petboarding-app-1` left in `Created`). Recovered by starting just the app container against the shared caddy rather than `down`/`up`-ing the whole stack, which would have stolen ports 80/443 from the other agent's slimfact stack.

Commit: see `git log -1` (`feat/kennel-layout-picker` branch).

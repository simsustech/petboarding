# Changes: picker success/undo, failure recovery, race fix (harden pass) (2026-10-08)

Fourth pass on the critique follow-up (after clarify `df0646a3c`). Addresses the
critique's P1 "no confirmation, no undo, no error surface" and one pre-existing
flake the gates kept tripping over.

## New files
| File | Description |
|------|-------------|
| `.pi/changes/2026-10-08-kennel-picker-harden.md` | This recap |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/pages/employee/KennelLayout.vue` | +65 | `onSelectKennel` is now failure-safe: `assigning` ref guards concurrent taps; the optimistic `kennelId` change is rolled back and `executePets()` resyncs on error, with the dialog left OPEN so staff can retry; success closes and notifies with the destination named plus an **Undo** action that re-assigns the previous kennel. Imports `Notify` from quasar. |
| `packages/app/src/lang/en-US.ts` / `nl.ts` / `index.ts` | ±8 | New `undo` (top-level), `dialog.assignDone` (`Placed in {kennel}.` / `Geplaatst in {kennel}.`), `dialog.assignFailed` (`Could not place this pet. Nothing was changed.` / `Kon dit huisdier niet plaatsen. Er is niets gewijzigd.`) — en/nl parity, interface updated. |
| `packages/api/tests/e2e/frontend/mobile-shell.spec.ts` | +7 | Fixed a **pre-existing race**: the width guard measured right after `networkidle`, which can settle before the SPA mounts, producing a false `E-stop: <route> rendered no .q-page`. Now waits for `.q-page` to attach before measuring. |
| `docs/adr/005-kennel-assignment-tap-not-drag.md` | +6/-2 | The "no undo (parity with drag)" consequence is reversed and dated, with the reasoning: removing drag replaced a deliberate gesture with a 56px tap, so a mis-tap became the likelier mistake. |

## Verification — forced-failure evidence (not code reading)

Ran against the live stack with a **forced 500** on the set-kennel endpoints:

| Check | Result |
|---|---|
| Success notify | `Placed in 4. Undo` — destination named, undo offered |
| Dialog closes on success / assignment applied | ✓ / chip in kennel 4 ✓ |
| **Undo** | chip returned to the waitlist ✓ |
| **Error surfaced** | `Something went wrong... Forced failure for hardening test` (via the app's existing `trpc.ts` handler) |
| **Dialog stays open on failure** | ✓ retry possible |
| **Optimistic change rolled back** | pet not in the target kennel ✓, waitlist unchanged ✓ |

- Gates: `pnpm run lint`=0 · `pnpm run format:check`=0 (after `format:write`) · `PI_RTK_BYPASS=1 pnpm run build`=0 · feature set **10/10** · full `pnpm run test:e2e` = **119 passed / 3 skipped / 0 failed**.

## Deliberately not changed (with reasons)

- **No loading state inside the dialog**: the picker can only be opened by clicking a chip, and chips render *from* `petKennels` — a data-absent open is structurally impossible, so a spinner would be dead code (harden ref: "never invent progress").
- **Stale-occupant window on date change**: changing the date refetches while the previous day's chips stay rendered (`watch` on `petKennels`). Real, but page-shell data-freshness rather than a picker concern, and fixing it well needs a page-level loading decision — noted for `/impeccable polish` / a follow-up.
- **RTL / CJK**: out of scope — PRODUCT.md commits to en + nl only, and both are LTR Latin.

Commit: see `git log -1` (`feat/kennel-layout-picker` branch).

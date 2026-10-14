# Changes: rating scale documented as tokens (document pass) (2026-10-08)

Sixth pass on the critique follow-up (after the audit `aa9d00552`). Addresses the
critique's P2 "the rating ramp bypasses the token system, no dark-mode
counterpart" — without touching the rest of `DESIGN.md`.

## New files
| File | Description |
|------|-------------|
| `.pi/changes/2026-10-08-kennel-picker-design-tokens.md` | This recap |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `DESIGN.md` | +19 | Frontmatter gains the ten compatibility tokens (`rating-1` `#dc2626` … `rating-10` `#059669`); Colors gains **The Compatibility Scale Rule**, documenting the scale's meaning, its single legitimate use, the band-word requirement, and that the hue is deliberately theme-invariant. |
| `packages/app/src/components/kennelLayout/KennelPickerDialog.vue` | +4/-2 | `tintForRating`'s comment now names the documented tokens and states that the Tailwind steps are those tokens, so the next reader finds the doc. |
| `packages/app/src/pages/employee/KennelLayout.vue` | −11 | **Reverted** the focus-on-open attempt (see below). |

## Verification
- **Doc↔code match verified against the app's own generated CSS** (`packages/app/dist/csr/assets/unocss-*.css`), all ten steps: `bg-red-600` = `#dc2626`, `bg-red-500` = `#ef4444`, `bg-orange-500` = `#f97316`, `bg-orange-400` = `#fb923c`, `bg-yellow-500` = `#eab308`, `bg-yellow-400` = `#facc15`, `bg-lime-400` = `#a3e635`, `bg-green-400` = `#4ade80`, `bg-green-500` = `#22c55e`, `bg-emerald-600` = `#059669`. The documented values are truthful, not asserted.
- Gates: `pnpm run lint`=0 · `pnpm run format:check`=0 · `PI_RTK_BYPASS=1 pnpm run build`=0 · feature set **13/13** · full `pnpm run test:e2e` = **119 passed / 3 skipped / 0 failed**.

## Correction recorded (the gate did its job)
The audit pass had added focus-on-open (`openPicker` focusing the dialog's first row) as part of the a11y work. That change **broke the dialog**: focusing inside a non-persistent `QDialog` while it is still showing trips Quasar's dismiss-on-focus-out, so the dialog opened and immediately hid — caught by the picker e2e (`locator resolved to <div id="pickerDialog"> … unexpected value "hidden"`). Isolated by reverting it (3/3 pass), and reverted permanently. The audit recap's row is corrected accordingly.

**Nothing was overwritten wholesale.** This pass is additive to `DESIGN.md`; the existing "Calm Control Room" system, its colours, type scale, layout rules and components are untouched. A full `/impeccable document` regeneration is not appropriate here — the incumbent system is coherent, and per the reference a redesign of it is a separate, user-authorised decision.

Commit: see `git log -1` (`feat/kennel-layout-picker` branch).

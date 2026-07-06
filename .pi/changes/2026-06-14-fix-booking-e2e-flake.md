# Changes: Fix booking e2e flake (2026-06-14)

## Modified files
| File | Lines | Description |
|------|-------|-------------|
| `packages/api/tests/e2e/account.spec.ts` | 193 | Added `{ force: true }` to `page.getByRole('option', { name: booking.endTime }).click()` — the "Morning" option was rendered outside the mobile-emulated viewport, causing intermittent "element is outside of the viewport" timeout |

## Why
In Firefox with mobile device emulation, the QSelect options listbox renders partially below the viewport fold. `{ force: true }` bypasses the visibility check since the DOM element is fully present and interactive.

# Changes: skip screenshot specs in CI (2026-10-12)

## Problem
The e2e run on CI still executed `tests/e2e/showcase-daycare-calendar-ux.spec.ts`,
which writes PNGs into the tracked `showcase/daycare-calendar-ux/after/` tree
(it dirtied the working tree on every local run, and is pure capture with no
assertions). The other capture specs (`screenshots*.spec.ts`) were already
gated, but the showcase spec did not match that pattern.

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/api/playwright.config.ts` | testIgnore | Extend the `PLAYWRIGHT_ALLOW_SCREENSHOTS` gate to also ignore `**/showcase-*.spec.ts`, matching the `screenshots*.spec.ts` specs and the spec's own "run with PLAYWRIGHT_ALLOW_SCREENSHOTS=1" header |

## Verification
- `playwright test --list` without the flag → 0 showcase specs, 122 tests.
- `PLAYWRIGHT_ALLOW_SCREENSHOTS=1 playwright test --list` → 4 showcase specs, 126 tests.
- CI (`.github/workflows/test staging.yaml`) never sets the flag, so the capture
  specs are skipped there.

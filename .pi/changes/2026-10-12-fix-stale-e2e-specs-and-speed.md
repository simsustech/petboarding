# Changes: fix the stale e2e specs and speed up the CI e2e (2026-10-12)

## Problem
Four specs still asserted the *pre-seed* "profileless admin" state, but commit
`d9674b201` now seeds `admin@petboarding.app` with a customer profile, contact
person, pets and a daycare subscription. The previous change hid them with a CI
`grepInvert`; this replaces that with real fixes.

## Modified files (all hunks accepted)
| File | Description |
|------|-------------|
| `packages/api/src/kysely/seeds/test.ts` | Seed `admin-profileless@petboarding.app` (administrator+employee, password `qjiNWdT8L`, no customer row) as the empty-state subject |
| `packages/api/tests/e2e/frontend/account-empty-states.spec.ts` | Use the profileless admin; drop the now-unused `ADMIN` constant; update the docstring |
| `packages/api/tests/e2e/frontend/layout-audit.spec.ts` | Content-links test logs in as the profileless admin so the empty-state links exist |
| `packages/api/tests/e2e/frontend/palette.spec.ts` | Empty-state link test logs in as the profileless admin |
| `packages/api/tests/e2e/daycareMonthNavigation.spec.ts` | The add action is the nav-rail FAB now — click `#fabAdd` (waits for it) instead of the removed inline "Add" button |
| `packages/api/playwright.config.ts` | Remove the CI `grepInvert`; `slowMo` off unless `PLAYWRIGHT_SLOWMO` opts in; `workers` now `PLAYWRIGHT_WORKERS ?? 2` |
| `.github/workflows/test staging.yaml` | Install only chromium (`playwright install --with-deps chromium`) |

## Verification
- Targeted run (the 4 specs + `tables.spec.ts`, which reads the accounts list):
  **26 passed / 1 skipped / 0 failed**.
- Full local suite: **117 passed / 5 skipped / 0 failed** (122 collected).
- act (`test staging.yaml`, fresh stack): **🏁 Job succeeded**, 117 passed.

## Speed measurements (same suite, fresh stack)
| Change | Before | After |
|--------|--------|-------|
| `slowMo: 25` → off | 6.4m of test time | 6.3m — negligible, but no reason to keep it |
| `workers: 1` → 2 | 8.2m wall | 4.1–5.1m wall (two clean runs) |
| `install --with-deps` (all browsers) → `chromium` | 33s (act) | 18s (act) |
| act CI job, Playwright step | 8m31 | **4m57** |

`fullyParallel: false` is kept: tests inside a file stay serial, and only files
run concurrently. The file→worker assignment is deterministic, global-setup
always resets the volumes, and two fresh-stack runs were clean; `PLAYWRIGHT_WORKERS=1`
reverts to the old behaviour if a flake ever shows up.

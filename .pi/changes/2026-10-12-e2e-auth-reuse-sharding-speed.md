# Changes: e2e speed — auth reuse, fewer fixed waits (2026-10-12)

## Why
Debugging the slow suite showed the cost was not the assertions: a *minimal* test
(login + one page + one assertion) cost 2.0s, i.e. ~4m across 122 tests. The
per-test OIDC login dominated; fixed `waitForTimeout`/`delay` sleeps added 121s.

## Modified files (all hunks accepted)
| File | Description |
|------|-------------|
| `packages/api/tests/e2e/auth-state.ts` | NEW: capture a role's `storageState` (cookies + lionel localStorage tokens) and replay it onto a context |
| `packages/api/tests/e2e/global-setup.ts` | After the stack is up, log the 3 seeded roles in once and save their state (best-effort: a missing state falls back to a real login) |
| `packages/api/tests/e2e/setup.ts` | `login()` replays the saved state when present; the full flow is the fallback. Also drops `networkidle` for the Email field |
| `packages/api/tests/e2e/daycareMonthNavigation.spec.ts` | Replace 14s of `delay()` with `waitFor`/`expect.poll` condition waits |
| `packages/api/playwright.config.ts` | Remove the CI `grepInvert`; `slowMo` opt-in (`PLAYWRIGHT_SLOWMO`); `workers` stays 1 |
| `.github/workflows/test staging.yaml` | Install only chromium; pin `PLAYWRIGHT_ALLOW_SCREENSHOTS` empty |
| `.github/scripts/act-e2e-workflow.test.sh` | NEW: run the e2e workflow locally via act |
| `.gitignore` | Ignore the captured `tests/e2e/.auth/` |

## Measurements (per-test, host-load independent)
| | before | after |
|---|---|---|
| `tables.spec` per test | 2.0s | **0.9s** |
| `tables.spec` file | 6.1s | **2.8s** |
| `daycareMonthNavigation` file | ~17.6s | **5.6s** |
| fixed-wait budget (CI set) | 121s | down by ~14s (daycare) |

Full suite (workers=1, fresh stack, quiet host): **117 passed / 5 skipped / 0 failed**.

## Rejected: sharding / parallel workers
The suite cannot be split across stacks or run on concurrent workers:
- `account.spec.ts` uses `test.describe.configure({ mode: 'serial' })` — its
  tests build on each other (customer → contact → pet → booking), and Playwright
  shards by test.
- Cross-file order dependencies exist too: `employee/pets` renames the pet that
  `employee.spec`'s agenda test counts, which flaked under `workers: 2`.

So the workflow stays a single job with `workers: 1`; the CI parallelism idea
(shard the suite across runners) was implemented and then reverted.

## Pitfalls found while reusing auth state
- Replaying must land on `/user`, the URL the real flow ends on: on `/` the
  drawer *and* the tablist both render "Administrator", so tests that use `.or()`
  hit a strict-mode violation.
- Replaying must also wait for `.q-drawer` to attach — a direct goto resolves
  before the shell mounts, which broke `layout-polish`'s header probe.

## Not measured reliably
Wall times swung with host load (load average 3–30 during this session, partly
unrelated dev servers), so the table above is per-test rather than end-to-end.

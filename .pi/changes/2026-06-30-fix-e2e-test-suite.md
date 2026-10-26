# Changes: Fix e2e test suite — connection errors, strict mode violations, flaky tests (2026-06-30)

## Root cause
- `docker-compose.test.yaml` caddy label `localhost:3000` made Caddy listen on port 3000 (HTTPS), but Docker only exposed port 443. Tests hit `net::ERR_CONNECTION_CLOSED` for all 13 first-run failures.
- Stacked Quasar dialogs (item menus + edit/delete forms) caused `strict mode violation` on `.q-dialog` and `getByLabel()`.
- Delete API calls were aborted by premature `gotoPage()` navigation.
- `#fabAdd` wasn't rendered when the booking test tried to click it.

## Modified files

| File | Lines | Description |
|------|-------|-------------|
| `docker-compose.test.yaml` | ~72, ~77 | Changed `caddy: localhost:3000` → `caddy: petboarding.localhost` and `VITE_API_HOST: localhost:3000` → `VITE_API_HOST: petboarding.localhost` |
| `tests/e2e/account.spec.ts` | 100-102, 125, 158, 165-168 | `.q-dialog` → `.q-dialog.last()`, `page.getByLabel` → `dialog.getByLabel` in dialog contexts, added `waitForLoadState('networkidle')` + `waitFor()` before FAB click |
| `tests/e2e/administrator/announcements.spec.ts` | 50-53, 62-63 | `.q-dialog` → `.q-dialog.last()`, `page.getByLabel` → `dialog.getByLabel` |
| `tests/e2e/administrator/categories.spec.ts` | 50-52 | `.q-dialog` → `.q-dialog.last()`, `page.getByLabel` → `dialog.getByLabel` |
| `tests/e2e/administrator/openingtimes.spec.ts` | 49-51, 60-61 | `.q-dialog` → `.q-dialog.last()`, `page.getByLabel` → `dialog.getByLabel` |
| `tests/e2e/administrator/periods.spec.ts` | 76-78, 87-88 | `page.getByLabel` → `dialog.getByLabel`, `.q-dialog` → `.q-dialog.last()` |
| `tests/e2e/administrator/services.spec.ts` | 54-58, 72-78 | `.q-dialog` → `.q-dialog.last()`, `page.getByLabel` → `dialog.getByLabel`, replaced `delay(500)` with `expect(locator).not.toBeVisible()` wait |
| `tests/e2e/administrator/vacations.spec.ts` | 75-78, 88-89 | `.q-dialog` → `.q-dialog.last()`, `page.getByLabel` → `dialog.getByLabel` |
| `tests/e2e/employee/pets.spec.ts` | 37-40, 59-60 | `page.getByLabel` → `dialog.getByLabel` |

## Result
- Before: 13 failures (connection), then 7 failures (dialog strict mode), then 1 failure (delete API abort + FAB render)
- After: **38 passed, 1 skipped (slimfact — external service), 0 failed**

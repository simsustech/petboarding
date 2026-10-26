# Changes: Block service workers in e2e tests (2026-06-14)

## Modified files
| File | Lines | Description |
|------|-------|-------------|
| `packages/api/tests/e2e/setup.ts` | 34-36 | Changed `initializePage` from `browser.newPage()` to `browser.newContext({ serviceWorkers: 'block' })` + `context.newPage()`, giving every test file a fresh context with no service workers, cookies, or localStorage |

## Why
Service workers and their caches persisted across test files, causing PWA refresh popups and stale state. Each `beforeAll` now gets a clean browser context with `serviceWorkers: 'block'`. All tests go through `initializePage()`/`initializeAndLogin()`.

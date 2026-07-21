# Petboarding — Agent Memory

Pet boarding/daycare management SaaS (Fastify + Modular API backend, Vue 3 + Quasar frontend, pnpm monorepo).

## Quick Reference

```bash
# Build / lint / test
pnpm run build        # tools → app (SPA) → api (SSR)
pnpm run lint         # oxlint across all packages
pnpm run format:check # oxfmt (run `format:write` to fix)

# Dev environment
docker compose -f docker-compose.dev.yaml up -d                          # Start PG + Caddy
cd packages/api && pnpm run migrate:latest && pnpm run seed:fake && pnpm run dev  # API
cd packages/app && pnpm run dev                                          # App (separate terminal)

# Full quality check (mandatory after every change batch)
pnpm run lint || pnpm run lint:fix
pnpm run format:check || pnpm run format:write
pnpm run build
export SIMSUSTECH_NPM_TOKEN=$(cat ./env/SIMSUSTECH_NPM_TOKEN) \
  && docker compose -f docker-compose.dev.yaml down \
  && docker compose -f docker-compose.test.yaml down --volumes \
  && docker compose -f docker-compose.test.yaml build --no-cache \
  && docker compose -f docker-compose.test.yaml up --force-recreate
cd packages/api && pnpm run test:e2e   # mandatory — never skip
```

## SlimFact Integration Tests

Requires `slimfact-api:latest` image + password from its seed (currently `Sif5uEG5hcTH`).

```bash
export SIMSUSTECH_NPM_TOKEN=$(cat ./env/SIMSUSTECH_NPM_TOKEN)
docker compose -f docker-compose.test.yaml -f docker-compose.test.slimfact.yaml down --volumes
docker compose -f docker-compose.test.yaml -f docker-compose.test.slimfact.yaml build --no-cache
docker compose -f docker-compose.test.yaml -f docker-compose.test.slimfact.yaml up --force-recreate -d
# Wait for healthy, then:
cd packages/api
SLIMFACT_ADMIN_PASSWORD='Sif5uEG5hcTH' PLAYWRIGHT_SLIMFACT=true npx playwright test tests/e2e/slimfact.spec.ts
```

**Ignore logic** (`playwright.config.ts`): `PLAYWRIGHT_SLIMFACT=true` includes slimfact tests; `PLAYWRIGHT_ALLOW_SCREENHOTS` includes screenshots; neither → only normal e2e.

**Tests**: OIDC connect + approve booking #6 (verifies SlimFact invoice at `/employee/bookings/6`) + reject booking #8.

Non-slimfact approve/reject tests at `tests/e2e/administrator/bookings.spec.ts` (no invoice, email via MailHog).

## Debugging Failed E2E Tests

- Screenshots/videos: `./packages/api/test-results/` (captured on failure/retry)
- JSON report: `./packages/api/test-results.json` (which tests failed and why)
- HTML report: `cd packages/api && pnpm playwright show-report`
- Each failure has `error-context.md` with page snapshot YAML — grep for "Page snapshot"
- Console errors + failed XHR/fetch are printed during test execution
- Playwright traces (`on-first-retry`) viewable in HTML report or `pnpm playwright show-trace`

**Common patterns**:

- `#fabAdd` timeouts → Quasar FAB not rendered yet; add `waitForLoadState('networkidle')` first
- `locator('text=...')` not found → route may have changed (check `/admin/configuration/...` vs `/admin/...`)
- Dialogs empty → Vue component missing import or runtime error (check docker logs)
- Server error alerts → read `error-context.md` for page state, then docker logs for SQL/API error
- Docker issues: `docker logs petboarding-[service]` (app, database, etc.)

## Change Tracking

**Mandatory**: save recap to `.pi/changes/<date>-<description>.md` after every file modification task, commit with changes. Format:

```markdown
# Changes: <description> (<date>)

## New files
| File | Description |
|------|-------------|

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
```

Use `git add -p` for mixed-concern files: accept feature hunks, reject unrelated. For adjacent unsplittable hunks: `cp file.ts file.ts.bak`, edit to feature only, stage, restore.

## Post-Task Notification

After every task, send recap: `./scripts/ntfy.sh "<title>" "<recap>"`

## Unit Tests (vitrify test)

Tests live in `src/**/*.test.ts` and run via `pnpm vitrify test` (vitest with happy-dom).

### Mocking env for tests

API modules often import `../../env.js` which requires `POSTGRES_PASSWORD` at module init. To test functions that transitively depend on env, mock it early:

```ts
import { describe, expect, it, vi } from 'vitest'

vi.mock('../../env.js', () => ({
  config: {
    slimfactHost: 'slimfact.localhost',
    lang: 'en-US',
    downPaymentPaymentTermDays: 5
  }
}))

// Mock other side-effect-heavy deps as needed
vi.mock('handlebars', () => ({
  default: { compile: () => (ctx: Record<string, string>) => `${ctx.startDate}` }
}))

import { myFunction } from './module.js'
```

### date-fns locale resolution pattern

date-fns v4.4.0 does not export all locale variants (e.g. `en` doesn't exist — only `en-US`, `nl` exists but `nl-NL` does not). Use `Promise.any` to try candidates in order and take the first that resolves:

```ts
const locale = await Promise.any(
  [localeCode, (localeCode || envValue || 'en-US').slice(0, 2), 'en-US']
    .filter(Boolean)
    .map(async (code) => (await import(`date-fns/locale/${code}`)).default)
)
```

This tries: full code → short 2-letter code → hardcoded `en-US` fallback.

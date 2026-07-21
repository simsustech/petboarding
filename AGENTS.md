# Memory

## Project Overview

Petboarding is a pet boarding/daycare management SaaS application built on Modular API. It provides customer registration, booking management, daycare appointments, and role-based access control.

**Website:** <https://www.petboarding.app>  
**Demo:** <https://demo.petboarding.app>

## Codebase Structure

### Monorepo Layout (pnpm workspaces)

```
packages/
├── api/          # Backend API (Fastify + Modular API)
├── app/          # Frontend SPA (Vue 3 + Quasar)
└── tools/        # Shared tools, types, and utilities
```

### Key Packages

#### `packages/api` - Backend API

- **Framework:** Fastify with Modular API
- **Entry:** `src/main.ts` (dev), `dist/main.js` (prod)
- **Key Features:**
  - Authentication (OIDC)
  - Booking & daycare management
  - Email notifications (nodemailer)
  - PDF generation (Puppeteer)
  - Database: PostgreSQL with Kysely ORM
- **Scripts:** `pnpm run dev`, `pnpm run build`, `pnpm run migrate:latest`

#### `packages/app` - Frontend Application

- **Framework:** Vue 3 + Quasar v2 + Vite
- **Entry:** `src/main.ts`
- **Key Features:**
  - Fully responsive SPA
  - i18n support (vue-i18n)
  - Role-based UI (customer/employee/admin)
  - Calendar views for bookings/daycare
- **Scripts:** `pnpm run dev`, `pnpm run build`

#### `packages/tools` - Shared Utilities

- **Purpose:** Shared types, validation schemas, utilities
- **Entry:** `src/index.ts`
- **Used by:** Both api and app packages

### Entry Points

| Package | Dev Entry | Build Output |
| --------- | ----------- | -------------- |
| api | `src/main.ts` | `dist/main.js` |
| app | `src/main.ts` | `dist/` (SPA files) |
| tools | `src/index.ts` | `dist/index.js` |

### Key Configuration Files

- `docker-compose.yaml` - Production deployment
- `docker-compose.dev.yaml` - Development environment
- `.env.example` - Environment variables template
- `packages/api/.env.example` - API-specific env vars

### Database

- **Type:** PostgreSQL
- **Migrations:** `packages/api/migrations/`
- **Seeding:** `pnpm run seed:fake` (fake data for dev)

### Development Workflow

```bash
# Start infrastructure
docker compose -f docker-compose.dev.yaml up

# Setup database
cd packages/api
pnpm run migrate:latest
pnpm run seed:fake

# Run API dev server
pnpm run dev

# Run App dev server (separate terminal)
cd packages/app
pnpm run dev
```

## Code Style Guidelines

- Use descriptive variable names
- Follow existing patterns in the codebase
- Extract complex conditions into meaningful boolean variables

## Architecture Notes

- **Modular API:** Backend uses @simsustech/modular-api for modular architecture
- **Monorepo:** pnpm workspaces with shared tools package
- **Authentication:** OIDC-based
- **Authorization:** Role-based (customer, employee, admin)

## Common Workflows

- `pnpm run build` - Build all packages
- `pnpm run lint` - Lint all packages
- `pnpm run test` - Run API tests
- `pnpm run format:check` / `pnpm run format:write` - Code formatting

## Debugging Docker

- When a container fails or a service isn't responding, inspect logs: `docker logs petboarding-[service]` (e.g. `petboarding-app-1`, `petboarding-database-1`)

## Debugging Failed E2E Tests

- Screenshots and videos are captured on failure and saved in `./packages/api/test-results/`
- Playwright saves screenshots automatically (`only-on-failure`) and videos (`on-first-retry`)  
- The JSON report is at `./packages/api/test-results.json` — read it to see which tests failed and why
- For visual debugging, open the HTML report: `cd packages/api && pnpm playwright show-report`
- Each failed test has an `error-context.md` file with a YAML page snapshot — grep it for "Page snapshot" to see what was on screen
- Browser console errors are captured by the test runner and printed to the test output during execution
- Failed XHR/fetch responses (e.g. API returning 500 with error messages) are also printed to the test output
- Playwright traces (`on-first-retry`) also contain console messages and can be viewed in the HTML report or with `pnpm playwright show-trace`
- Common failure patterns:
  - `#fabAdd` timeouts — the Quasar FAB wasn't rendered yet; add `waitForLoadState('networkidle')` or a `waitFor` before clicking
  - `locator('text=...')` not found — the page route may have changed (check `/admin/configuration/...` vs `/admin/...`)
  - Dialogs with empty content — the Vue component may have a missing import or a runtime error (check docker logs)
  - Server errors showing as alerts (e.g. "null value in column") — read `error-context.md` to see what's rendered, then check docker logs for the actual SQL error

## Quality Checks (run after every change or batch of changes)

```bash
pnpm run lint || pnpm run lint:fix
pnpm run format:check || pnpm run format:write
pnpm run build
export SIMSUSTECH_NPM_TOKEN=$(cat ./env/SIMSUSTECH_NPM_TOKEN) && docker compose -f docker-compose.dev.yaml down && docker compose -f docker-compose.test.yaml down --volumes && docker compose -f docker-compose.test.yaml build --no-cache && docker compose -f docker-compose.test.yaml up --force-recreate
cd packages/api && pnpm run test:e2e
```

The playwright test results are stored in `./packages/api/test-results.json`. Read it and use it to apply fixes.

## SlimFact Integration Testing

SlimFact integration e2e tests verify OIDC connection + invoice creation flow. These tests require the SlimFact service.

### Prerequisites

- SlimFact Docker image must be pre-built: `docker pull slimfact-api:latest` or built locally
- SlimFact admin password from its seed file (currently `Sif5uEG5hcTH`)

### Running SlimFact tests

```bash
# Start with SlimFact service
cd /path/to/petboarding
export SIMSUSTECH_NPM_TOKEN=$(cat ./env/SIMSUSTECH_NPM_TOKEN)
docker compose -f docker-compose.test.yaml -f docker-compose.test.slimfact.yaml down --volumes
docker compose -f docker-compose.test.yaml -f docker-compose.test.slimfact.yaml build --no-cache
docker compose -f docker-compose.test.yaml -f docker-compose.test.slimfact.yaml up --force-recreate -d

# Wait for all containers to be healthy

# Run slimfact-specific tests
cd packages/api
SLIMFACT_ADMIN_PASSWORD='Sif5uEG5hcTH' PLAYWRIGHT_SLIMFACT=true npx playwright test tests/e2e/slimfact.spec.ts
```

### Test file ignore rules (`playwright.config.ts`)

- `PLAYWRIGHT_SLIMFACT=true` — includes slimfact.spec.ts, excludes screenshots
- `PLAYWRIGHT_ALLOW_SCREENHOTS` set — includes screenshots
- Neither set — only normal e2e tests run

### What the slimfact tests cover

1. **OIDC connect and verify** — connects Petboarding to SlimFact via OIDC, verifies health endpoint reports `slimfact: healthy`
2. **Approve a pending booking** — approves booking #6 (pet "name5"), verifies SlimFact invoice was created via the invoice button on `/employee/bookings/6`
3. **Reject a pending booking** — rejects booking #8 (pet "name2"), verifies the dialog flow succeeds

### Non-slimfact approve/reject tests

`tests/e2e/administrator/bookings.spec.ts` — tests approve/reject WITHOUT SlimFact (runs in normal e2e suite). Approval doesn't create an invoice but sends confirmation email via MailHog.
**Note:** The e2e test step is mandatory — it must be included in every quality check run, not skipped or deferred.

## Post-Task Notifications

After completing every task, send a recap notification via ntfy.sh on topic "cmd":

```bash
./scripts/ntfy.sh "<brief title of what was done>" "<recap of what was done>"
```

- Requires `NTFY_HOST` and `NTFY_ACCESS_TOKEN` environment variables
- Title should be a short summary (e.g., "Fixed booking validation bug")
- Message body should be a brief recap of changes made

## Change Tracking

**MANDATORY: After every file modification task, store a change recap.** Never skip this step.

Store the recap in `.pi/changes/<date>-<description>.md` and commit it along with the changes.

- File paths and line numbers
- What was changed (added/removed/modified)
- For mixed-concern files: which hunks were staged vs rejected

Format:

```markdown
# Changes: <description> (<date>)

## New files
| File | Description |
|------|-------------|

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|

## Modified files (selective hunks via git add -p)
| File | Hunks staged | Hunks rejected | Description |
|------|-------------|----------------|-------------|
```

This recap allows answering questions about changes without rescanning the full codebase.

## Partial Staging with `git add -p`

When working on multiple features simultaneously, use `git add -p` to stage only related hunks per feature commit.

**Strategy:** Pure feature files → stage directly. Single-concern changes → `git add -p file.ts` accept all. Mixed concerns → accept feature hunks (`y`), reject unrelated (`n`). For adjacent hunks that can't be split, use the temporary edit approach: `cp file.ts file.ts.bak`, edit to feature changes only, `git add file.ts`, restore from backup.

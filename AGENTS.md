# Memory

## Project Overview
Petboarding is a pet boarding/daycare management SaaS application built on Modular API. It provides customer registration, booking management, daycare appointments, and role-based access control.

**Website:** https://www.petboarding.app  
**Demo:** https://demo.petboarding.app

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
  - Authentication (OIDC, 2FA/TOTP)
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
|---------|-----------|--------------|
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
- **Authentication:** OIDC-based with optional 2FA/TOTP
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
pnpm run lint
pnpm run format:check || pnpm run format:write
pnpm run build
export SIMSUSTECH_NPM_TOKEN=$(cat ./env/SIMSUSTECH_NPM_TOKEN) && docker compose -f docker-compose.dev.yaml down && docker compose -f docker-compose.test.yaml down --volumes && docker compose -f docker-compose.test.yaml build --no-cache && docker compose -f docker-compose.test.yaml up --force-recreate
cd packages/api && pnpm run test:e2e
```
The playwright test results are stored in `./packages/api/test-results.json`. Read it and use it to apply fixes.

## Change Tracking

After making file changes, store a recap in `.commandcode/changes/<date>-<description>.md` with:
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

When working on multiple features simultaneously (e.g. vacations + audit logs + debug build), use `git add -p` to stage only related hunks per feature commit.

### Strategy per feature type

**Pure feature files** (untracked, 100% about the feature):
- Stage directly: `git add path/to/new/files`

**Modified files with single-concern changes:**
- `git add -p file.ts` → accept all hunks with `y`

**Modified files with mixed concerns:**
- `git add -p file.ts` → accept feature hunks (`y`), reject unrelated (`n`)
- For files where hunks can't be split by context (e.g. adjacent `vacations` + `auditLogs` lines in DB interface):
  1. `cp file.ts file.ts.bak`
  2. Edit file to contain only the feature changes
  3. `git add file.ts`
  4. Restore full content from backup: `cp file.ts.bak file.ts`
  5. Remove backup

### Example: Vacations staging

**Pure additions** (new files, staged directly):
```
packages/api/src/kysely/migrations/30_create_vacations_table.ts
packages/api/src/kysely/seeds/vacations.ts
packages/api/src/kysely/seeds/vacations/
packages/api/src/repositories/vacation.ts
packages/api/src/trpc/configuration/vacations.ts
packages/api/src/zod/vacation.ts
packages/api/tests/e2e/administrator/vacations.spec.ts
packages/app/src/components/vacation/
packages/app/src/mutations/configuration/vacation.ts
packages/app/src/pages/admin/configuration/VacationsPage/
packages/app/src/queries/configuration/vacation.ts
```

**Single-concern modified files** (all hunks accepted):
```
packages/api/src/api.config.ts          # removed hardcoded vacations, refactored handler
packages/api/src/petboarding.d.ts        # vacation types in handler params
packages/api/src/kysely/seeds/data.ts    # seed vacations
packages/api/src/kysely/seeds/fake.ts    # seed vacations
packages/api/src/trpc/configuration/index.ts  # wire vacation routes
packages/app/src/router/routes.ts        # vacation page route
packages/app/src/layouts/MainLayout.vue  # vacation nav item
packages/app/src/lang/index.ts           # vacation i18n type
packages/app/src/lang/en-US.ts           # vacation i18n strings
packages/app/src/lang/nl.ts              # vacation i18n strings
packages/app/src/components/dashboard/DashboardAdminConfigurationMenuList.vue  # vacation menu item
```

**Mixed-concern modified files** (selective hunks):
```
packages/api/src/repositories/booking.ts
  Hunk 1 (y): import { findVacations } from './vacation.js'
  Hunk 2 (y): findVacations() call in calculateBookingCosts
  Hunk 3 (y): vacations param in calculateBookingCosts
  Hunks 4-6 (n): withOpeningTime/withStatus refactoring (unrelated)
  Hunk 7 (y): findVacations() call in cancelBooking
  Hunk 8 (y): vacations param in cancelBooking

packages/api/src/kysely/types.ts
  Adjacent AuditLogs + Vacations hunks can't split via add -p
  → Temporary edit approach: remove AuditLogs, stage Vacations only, restore full file

# Changes: Unit test environment setup (vitest auto-loads .env) (2026-08-03)

## New files

| File | Description |
|------|-------------|
| — | — |

## Modified files (all hunks accepted)

| File | Lines | Description |
| ------ | ------- | ------------- |
| packages/api/vitest.config.ts | +9 | Call Vite `loadEnv(mode, cwd, '')` and inject `packages/api/.env` into `process.env` (real env vars win) so `pnpm test` works without manual exports — `src/trpc/admin/bookings.test.ts` (and similar) import modules that transitively load `env.js`, which `required()`s API_HOST/POSTGRES_*/OIDC_*/OTP_*/MAIL_* at module init |
| packages/api/.env | +1 (gitignored) | Add `API_HOST=localhost:3000` — not present in `.env`; `.env.development` (`VITE_API_HOST`) is not loaded in test mode |
| AGENTS.md | +11 | New "### Test environment setup" section under Unit Tests documenting the auto-load, the required() env vars, and the gitignored `.env` caveat |

## Root cause

`vitest.config.ts` never loaded `.env`, so `pnpm test` failed at collection with
`Missing required environment variable: POSTGRES_PASSWORD` (then POSTGRES_DB, API_HOST, ...)
for any test file that transitively imports `env.js`. `packages/api/.env` already
contained the other required vars.

## Verification

- `env -i HOME=$HOME PATH=$PATH pnpm test` (clean shell, no exports) → 2 files, 66 tests passed
- Full quality check: lint (pre-existing warnings only), format:check clean, `pnpm run build` ok,
  docker test stack rebuilt `--no-cache` with fresh `seed:test` DB, `pnpm run test:e2e` → 45 passed, 2 skipped

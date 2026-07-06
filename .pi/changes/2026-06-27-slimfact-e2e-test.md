# Changes: SlimFact integration — end-to-end working (2026-06-27)

## New files
| File | Description |
|------|-------------|
| `docker-compose.test.slimfact.yaml` | Docker compose override adding slimfact service + routing |
| `packages/api/tests/e2e/slimfact.spec.ts` | Single e2e test: OIDC auth + invoice creation |
| `packages/api/src/kysely/migrations/31_create_oidc_clients_table.ts` | Migration for `modularapi.oidc_clients` table |
| `.docker/init-slimfact-db.sql` | Postgres init script creating slimfact database |

## Modified files
| File | Lines | Description |
|------|-------|-------------|
| `packages/api/playwright.config.ts` | baseURL + projects | Changed baseURL to `https://petboarding.localhost`, added chromium project |

## Architecture
```
https://petboarding.localhost  → caddy → petboarding (port 80)
https://slimfact.localhost      → caddy → slimfact    (port 80)
```
Both `.localhost` domains resolve to 127.0.0.1 (RFC 6761). Single caddy differentiates by Host header. Shared postgres (databases: `petboarding` + `slimfact`).

## Test (1 test, passes in ~9s with Chromium)
1. Checks SlimFact health — if not healthy, runs OIDC flow:
   - Clicks login on Integrations page → redirects to slimfact
   - Logs in as `admin@slimfact.app` / `Sif5uEG5hcTH`
   - Clicks "Allow" on consent screen
   - Verifies `slimfact: healthy`
2. Approves booking 6 (customer name5, 2026-01-01 to 2026-01-11)
   - Clicks action button → "Approve booking"
   - Fills email, skips down payment, clicks "Send"
3. Verifies `slimfact: healthy` + `status: healthy` after invoice creation

## Result
- Invoice created: `e2e7f2e1-8aac-4dfa-a3e6-9636cfb78faf` (€157.50)
- Booking 6 status: PENDING → APPROVED
- SlimFact health: UNHEALTHY → HEALTHY

## Run command
```bash
cd packages/api
pnpm run test:e2e -- tests/e2e/slimfact.spec.ts --project=chromium
```

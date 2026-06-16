# Changes: mountable api.config via docker volume (2026-06-16)

## New files
| File | Description |
|------|-------------|
| `packages/api/configs/api.config.mjs` | Converted the legacy hvbnicky config to the new vacations-as-parameter format (bookingCostsHandler + bookingCancelationHandler). |
| `docker-compose.test.config.yaml` | Copy of `docker-compose.test.yaml` with a volume mount replacing `/app/dist/server/api.config.mjs` from `packages/api/configs/api.config.mjs`. |

## Modified files
None.

## Removed files
| File | Description |
|------|-------------|
| `packages/api/src/api.config.hvbnicky.mjs` | Moved to `packages/api/configs/api.config.mjs` (generalized naming). |

## Verification
- Built and ran `docker compose -f docker-compose.test.config.yaml up --force-recreate` (with a fresh `dist/` since a stale `26_add_index_to_booking_tables copy.js` artifact blocked migrations).
- All four services (database, mailhog, caddy, app) reached `Up`/`healthy`.
- App logged `Server listening at http://...:80` with no errors.
- Mounted file inside container matches the custom config (254 lines, `Feestdagen toeslag` present, `vacation.surchargePerDay` used).
- `GET /` and `GET /healthz` returned HTTP 200.
- Teardown: `docker compose ... down` clean.

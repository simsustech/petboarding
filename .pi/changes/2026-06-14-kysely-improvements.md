# Changes: Kysely improvements (2026-06-14)

## Deleted files
| File | Description |
|------|-------------|
| packages/api/src/kysely/migrations/26_add_index_to_booking_tables copy.ts | Removed stale copy file (leftover from copy operation) |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| packages/api/src/kysely/types.ts | ~8-82 | Removed large commented-out enum blocks (ANNOUNCEMENT_TYPE, VACCINATION_TYPES, PET_SPECIES, etc.) already imported from tools/constants |
| packages/api/src/kysely/types.ts | ~46-56 | Removed commented-out AuthenticationMethods interface |
| packages/api/src/kysely/types.ts | ~166-172 | Removed commented-out CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS enum |
| packages/api/src/kysely/types.ts | ~214-226 | Removed commented-out OidcPayloads interface |
| packages/api/src/kysely/index.ts | ~4-6 | Removed commented-out OidcDatabase import and Database interface; cleaned unused lines |
| packages/api/src/kysely/index.ts | ~36 | Fixed typo: `postgress://` → `postgres://` in connection string |
| packages/api/src/kysely/seeds/test.ts | ~78,96,104 | Fixed typo: `bookingStatuseEnum` → `bookingStatusesEnum` |
| packages/api/src/pgboss.ts | ~2 | Fixed wrong relative import path: `../src/kysely/` → `./kysely/` |

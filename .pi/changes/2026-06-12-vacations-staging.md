# Changes: Vacations partial staging (2026-06-12)

## New files (untracked → staged)
| File | Description |
|------|-------------|
| `packages/api/src/kysely/migrations/30_create_vacations_table.ts` | Vacation table migration |
| `packages/api/src/kysely/seeds/vacations.ts` | Vacation seed runner |
| `packages/api/src/kysely/seeds/vacations/index.ts` | getAllVacations() aggregator |
| `packages/api/src/kysely/seeds/vacations/nl/vacations-2024.ts` | NL vacations 2024 |
| `packages/api/src/kysely/seeds/vacations/nl/vacations-2025.ts` | NL vacations 2025 |
| `packages/api/src/kysely/seeds/vacations/nl/vacations-2026.ts` | NL vacations 2026 |
| `packages/api/src/kysely/seeds/vacations/nl/vacations-2027.ts` | NL vacations 2027 |
| `packages/api/src/kysely/seeds/vacations/nl/vacations-2028.ts` | NL vacations 2028 |
| `packages/api/src/kysely/seeds/vacations/nl/vacations-2029.ts` | NL vacations 2029 |
| `packages/api/src/kysely/seeds/vacations/nl/vacations-2030.ts` | NL vacations 2030 |
| `packages/api/src/repositories/vacation.ts` | CRUD: findVacations, create, update, delete |
| `packages/api/src/trpc/configuration/vacations.ts` | tRPC routes for vacations |
| `packages/api/src/zod/vacation.ts` | Zod validation schema |
| `packages/api/tests/e2e/administrator/vacations.spec.ts` | E2E test |
| `packages/app/src/components/vacation/VacationForm.vue` | Form component |
| `packages/app/src/components/vacation/VacationsList.vue` | List component |
| `packages/app/src/mutations/configuration/vacation.ts` | Pinia Colada mutations |
| `packages/app/src/pages/admin/configuration/VacationsPage/VacationsPage.vue` | CRUD page |
| `packages/app/src/pages/admin/configuration/VacationsPage/VacationsPageFabs.vue` | FAB |
| `packages/app/src/queries/configuration/vacation.ts` | Pinia Colada query |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/api/src/api.config.ts` | L8-167, L185-300+ | Removed hardcoded vacations array; refactored handler to accept `vacations` param with per-vacation surcharge |
| `packages/api/src/petboarding.d.ts` | L42-48, L68-74 | Added `vacations` param to BookingCostsHandler and BookingCancelationHandler |
| `packages/api/src/kysely/seeds/data.ts` | L229-230 | Insert vacations via getAllVacations() |
| `packages/api/src/kysely/seeds/fake.ts` | L205-206 | Insert vacations via getAllVacations() |
| `packages/api/src/trpc/configuration/index.ts` | L5, L25 | Import + wire configurationVacationRoutes |
| `packages/app/src/router/routes.ts` | L184-194 | Added `/admin/vacations` route |
| `packages/app/src/layouts/MainLayout.vue` | L351-356 | Added vacation nav item |
| `packages/app/src/lang/index.ts` | L391-403 | Added vacation i18n type |
| `packages/app/src/lang/en-US.ts` | L411-423 | Added vacation i18n English |
| `packages/app/src/lang/nl.ts` | L420-433 | Added vacation i18n Dutch |
| `packages/app/src/components/dashboard/DashboardAdminConfigurationMenuList.vue` | L55-65 | Added vacation dashboard menu item |

## Modified files (selective hunks via git add -p)
| File | Hunks staged | Hunks rejected | Description |
|------|-------------|----------------|-------------|
| `packages/api/src/repositories/booking.ts` | 1,2,3,7,8 | 4,5,6 | `import { findVacations }` + `findVacations()` calls + `vacations` params in calculateBookingCosts and cancelBooking; rejected withOpeningTime/withStatus refactoring |
| `packages/api/src/kysely/types.ts` | Vacations interface + vacations in DB | AuditLogs interface + auditLogs in DB | Used temporary-edit approach (remove AuditLogs → stage → restore full file) |

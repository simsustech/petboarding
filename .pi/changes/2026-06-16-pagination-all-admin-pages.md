# Changes: Add pagination + disabled filter buttons to all admin list pages (2026-06-16)

## New files
| File | Description |
|------|-------------|
| `PLAN-PAGINATION.md` | Batched implementation plan |

## Modified files (all hunks accepted)

### Batch 1: Vacations
| File | Lines | Description |
|------|-------|-------------|
| `packages/api/src/repositories/vacation.ts` | ~30 | Added optional `pagination` param to `findVacations()` with limit/offset/sortBy/window-function total |
| `packages/api/src/trpc/configuration/vacations.ts` | ~15 | Added zod input with optional `pagination` to `getVacations` |
| `packages/app/src/queries/configuration/vacation.ts` | ~20 | Added `page`, `rowsPerPage`, `sortBy`, `descending` refs + `pagination` computed |
| `packages/app/src/pages/admin/configuration/VacationsPage/VacationsPage.vue` | ~12 | Added toolbar with disabled search btn + q-pagination + total computed |

### Batch 1: Periods
| File | Lines | Description |
|------|-------|-------------|
| `packages/api/src/repositories/period.ts` | ~25 | Added pagination param to `find()` and `findPeriods()` |
| `packages/api/src/trpc/configuration/periods.ts` | ~15 | Added zod input with optional `pagination` to `getPeriods` |
| `packages/app/src/queries/configuration/period.ts` | ~18 | Added pagination refs/computed |
| `packages/app/src/pages/admin/PeriodsPage/PeriodsPage.vue` | ~12 | Added toolbar with disabled search btn + q-pagination + total computed |

### Batch 1: Tests
| File | Lines | Description |
|------|-------|-------------|
| `packages/api/tests/e2e/administrator/vacations.spec.ts` | +1 | Added `await expect(page.locator('.q-pagination')).toBeVisible()` |
| `packages/api/tests/e2e/administrator/periods.spec.ts` | +1 | Added `await expect(page.locator('.q-pagination')).toBeVisible()` |

### Batch 2: Buildings, Kennels, Services
| File | Lines | Description |
|------|-------|-------------|
| `packages/api/src/repositories/building.ts` | ~20 | Added pagination to `find()` and `findBuildings()` |
| `packages/api/src/trpc/configuration/buildings.ts` | ~15 | Added zod input with optional pagination |
| `packages/app/src/queries/configuration/building.ts` | +25 | Added `useConfigurationGetBuildingsPaginatedQuery` (kept original non-paginated for dropdowns) |
| `packages/app/src/pages/admin/configuration/BuildingsPage/BuildingsPage.vue` | ~14 | Switch to paginated query + toolbar + q-pagination + total |
| `packages/api/src/repositories/kennel.ts` | ~20 | Added pagination to `find()` and `findKennels()` |
| `packages/api/src/trpc/configuration/kennels.ts` | ~18 | Added zod input with optional pagination |
| `packages/app/src/queries/configuration/kennel.ts` | ~18 | Added pagination refs/computed |
| `packages/app/src/pages/admin/configuration/KennelsPage/KennelsPage.vue` | ~14 | Toolbar + q-pagination + total |
| `packages/api/src/repositories/service.ts` | ~20 | Added pagination to `find()` and `findServices()` |
| `packages/api/src/trpc/configuration/services.ts` | ~18 | Added zod input with optional pagination |
| `packages/app/src/queries/configuration/service.ts` | ~18 | Added pagination refs/computed |
| `packages/app/src/pages/admin/configuration/ServicesPage/ServicesPage.vue` | ~14 | Toolbar + q-pagination + total |

### Batch 3: Categories, OpeningTimes, DaycareSubscriptions, Announcements
| File | Lines | Description |
|------|-------|-------------|
| `packages/api/src/repositories/category.ts` | ~25 | Added pagination to `find()` and `findCategories()` |
| `packages/api/src/trpc/configuration/categories.ts` | ~12 | Added zod input with optional pagination |
| `packages/app/src/queries/configuration/category.ts` | ~18 | Added pagination refs/computed |
| `packages/app/src/pages/admin/configuration/CategoriesPage/CategoriesPage.vue` | ~14 | Toolbar + q-pagination + total |
| `packages/api/src/repositories/openingTime.ts` | ~20 | Added pagination to `find()` and `findOpeningTimes()` |
| `packages/api/src/trpc/configuration/openingTimes.ts` | ~15 | Added zod input with optional pagination |
| `packages/app/src/queries/configuration/openingTime.ts` | ~18 | Added pagination refs/computed |
| `packages/app/src/pages/admin/configuration/OpeningTimesPage/OpeningTimesPage.vue` | ~12 | Toolbar + q-pagination + total |
| `packages/api/src/repositories/daycareSubscription.ts` | ~25 | Added pagination to `find()` and `findDaycareSubscriptions()` |
| `packages/api/src/trpc/configuration/daycareSubscriptions.ts` | ~18 | Added zod input with optional pagination |
| `packages/app/src/queries/configuration/daycareSubscription.ts` | ~20 | Added pagination refs/computed |
| `packages/app/src/pages/admin/configuration/DaycareSubscriptionsPage/DaycareSubscriptionsPage.vue` | ~14 | Toolbar + q-pagination + total |
| `packages/api/src/repositories/announcement.ts` | ~25 | Added pagination to `find()` and `findAnnouncements()` |
| `packages/api/src/trpc/configuration/announcements.ts` | ~15 | Added zod input with optional pagination |
| `packages/app/src/queries/configuration/announcement.ts` | ~20 | Added pagination refs/computed (default: expirationDate desc) |
| `packages/app/src/pages/admin/AnnouncementsPage/AnnouncementsPage.vue` | ~14 | Toolbar + q-pagination + total |

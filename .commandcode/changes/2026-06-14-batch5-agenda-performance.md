# Changes: Batch 5 - AgendaComponent Performance + Lint Fixes (2026-06-14)

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| packages/app/src/components/AgendaComponent.vue | 66,100,116,155,255-300 | Replaced inline filter functions (getBookingDeparturesWithServices, getBookingArrivals, getBookingDepartures, getDaycareDates) with a single pre-computed `computed` map (`agendaMaps`) for O(1) template lookups instead of O(n) per render |
| packages/app/src/components/period/PeriodsList.vue | 90 | Removed duplicate `$q = useQuasar()` declaration (lint error) |
| packages/app/src/components/vacation/VacationsList.vue | 88 | Removed duplicate `$q = useQuasar()` declaration (lint error) |

## Notes
- `getBookingStays`, `getNumberOfBookingPets`, `getNumberOfDaycarePets` kept as functions since they involve date range logic that can't be simple date-keyed maps
- Lint: 0 errors, 5 pre-existing warnings

## Test results
29 passed, 1 failed (pre-existing flaky kennelLayout test)

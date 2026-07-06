# Changes: Remove component-level lang checks (2026-06-14)

## Modified files (all hunks accepted)
| File | Description |
|------|-------------|
| `packages/app/src/components/vacation/VacationsList.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/service/ServicesList.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/openingTime/OpeningTimesList.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/kennel/KennelsList.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/contactperson/ContactPersonForm.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/period/PeriodsList.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/daycareSubscription/DaycareSubscriptionsList.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/category/CategoriesList.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/building/BuildingsList.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/announcement/AnnouncementsList.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/daycare/DaycareLegend.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/agenda/AgendaLegend.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/pet/PetLabel.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/pet/PetCategorySelect.vue` | Removed if/watch lang block; kept non-lang watch, removed loadLang |
| `packages/app/src/components/pet/PetCategoryItem.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/pet/PetForm.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/booking/BookingItem.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/booking/BookingItemContent.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/booking/BookingForm.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/booking/BookingServicesList.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/booking/BookingServiceForm.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/booking/BookingServicesSelect.vue` | Removed if/watch lang block; kept non-lang watch, removed loadLang |
| `packages/app/src/components/customer/CustomerForm.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/components/AgendaChip.vue` | Removed if/watch lang block and loadLang/watch imports |
| `packages/app/src/layouts/MainLayout.vue` | Language loading stays here (correct location) |

## New files
| File | Description |
|------|-------------|
| `packages/api/tests/e2e/administrator/language.spec.ts` | Playwright test for language switcher (en-US ↔ nl-NL) |

## Summary
Removed the `if (lang.value.isoName !== $q.lang.isoName) loadLang(...)` pattern and its corresponding `watch($q.lang, ...)` from all 24 component-level files. The language loading is correctly handled at the layout level (`MainLayout.vue`) via a `watch(locale, ...)` that calls `loadLang()`.

Added an e2e test that switches between English and Dutch, verifying translated text appears correctly. All 34 e2e tests pass.

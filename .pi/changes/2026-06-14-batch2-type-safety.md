# Changes: Batch 2 - Type Safety & Small Code Quality (2026-06-14)

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| packages/app/src/components/pet/PetChip.vue | 154 | Changed `onOpenPet?: unknown` to `onOpenPet?: boolean` |
| packages/app/src/components/booking/BookingItem.vue | 68, 79-81 | Removed dead `QItem/QItemLabel/QItemSection` imports; changed `onOpenCustomer/onOpenBooking/onOpenPets` from `unknown` to `boolean` |
| packages/app/src/components/booking/BookingItemContent.vue | 255 | Removed dead `QItem/QItemLabel/QItemSection` imports |
| packages/app/src/components/booking/BookingExpansionItem.vue | 210-211 | Changed `onOpenCustomer/onUpdateBookingInvoice` from `unknown` to `boolean` |
| packages/app/src/components/daycare/DaycareCalendarMonth.vue | 166 | Changed `onOpenPets?: unknown` to `onOpenPets?: boolean` |
| packages/app/src/components/pet/PetCard.vue | 280 | Changed `onOpenCustomer?: unknown` to `onOpenCustomer?: boolean` |
| packages/app/src/components/AgendaChip.vue | 99-100 | Changed `onOpenPets/onOpenBooking` from `unknown` to `boolean` |
| packages/app/src/components/pet/PetItem.vue | 83 | Removed dead `QItem` import |
| packages/app/src/components/employee/PetSelect.vue | 50 | Removed dead `QSelect` import |
| packages/app/src/components/admin/AccountSelect.vue | 25 | Removed dead `QSelect` import |
| packages/app/src/components/pet/PetCategoryItem.vue | 22 | Removed dead `QItem/QItemLabel/QItemSection` imports |
| packages/app/src/configuration.ts | 135 | Changed `currencySymbols` type from `Record<string, string>` to `Record<PETBOARDING_CLIENT_CONFIGURATION['CURRENCY'], string>` |

## Test results
33 passed, 0 failed

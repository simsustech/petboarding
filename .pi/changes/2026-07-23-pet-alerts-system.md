# Changes: Pet Alerts System (2026-07-23)

## New files

| File                                                | Description                                                                                           |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `packages/app/src/components/pet/PetAlertsForm.vue` | Separate form component for managing pet alerts (condition select, start/end date inputs, add/remove) |

## Modified files

| File                                                         | Lines                                    | Description                                                                                                                              |
| ------------------------------------------------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/api/src/kysely/types.ts`                           | ~10                                      | Added `PetAlerts` interface                                                                                                              |
| `packages/api/src/repositories/pet.ts`                       | ~27-32, ~174-185, ~238-240               | Added `PetAlert` interface (with `id`), `withAlerts()` subquery function, `alerts` to `ParsedPet`, `relations.alerts` option in `find()` |
| `packages/api/src/repositories/kennel.ts`                    | ~246-247, ~278-279                       | Added `withAlerts(date)` to `getBookingPetKennels` and `getDaycareDatePetKennels` select                                                 |
| `packages/api/src/repositories/booking.ts`                   | ~424                                     | Added `withAlerts()` to booking query pet select                                                                                         |
| `packages/api/src/trpc/employee/pets.ts`                     | ~16, ~265-315                            | Added `db` import, `createAlert`/`updateAlert`/`deleteAlert` tRPC mutations                                                              |
| `packages/app/src/configuration.ts`                          | ~24-29                                   | Added `id?` to `PetAlert` interface                                                                                                      |
| `packages/app/src/lang/en-US.ts`                             | ~200-210                                 | Added `pet.alerts.*` i18n labels                                                                                                         |
| `packages/app/src/lang/nl.ts`                                | ~201-211                                 | Added Dutch translations for alerts                                                                                                      |
| `packages/tools/src/constants/index.ts`                      | ~37-42                                   | Added `PET_ALERTS` constant                                                                                                              |
| `packages/app/src/mutations/employee/pet.ts`                 | ~31-79                                   | Added `useEmployeeCreateAlert`, `useEmployeeUpdateAlert`, `useEmployeeDeleteAlert` hooks                                                 |
| `packages/app/src/components/pet/PetCard.vue`                | ~171-196, ~266-277, ~306-310, ~330, ~445 | Added alerts section with badges, alerts dialog with PetAlertsForm, imports, props, refs                                                 |
| `packages/app/src/components/booking/BookingItemContent.vue` | ~62-67, ~358-371                         | Added alert display in booking item with icon and condition labels                                                                       |
| `packages/app/src/components/pet/PetChip.vue`                | ~24-30, ~45-50                           | Added alert badges to pet chip component                                                                                                 |
| `packages/app/src/components/pet/PetLegend.vue`              | ~20-26                                   | Added alert legend entries                                                                                                               |
| `packages/app/src/pages/employee/KennelLayout.vue`           | ~4                                       | Added PetAlertsForm import                                                                                                               |

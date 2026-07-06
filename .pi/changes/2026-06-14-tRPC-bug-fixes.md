# Changes: Fix tRPC route bugs (2026-06-14)

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| packages/api/src/trpc/admin/accounts.ts | ~128, ~168 | Fixed `addRole` missing duplicate check; fixed `removeRole` splice missing delete count (splice(-1) bug) |
| packages/api/src/trpc/admin/documents.ts | ~19, ~30 | Added missing `await` on `updateDocument()` calls (2 places) |
| packages/api/src/trpc/employee/pets.ts | ~49, ~65, ~194, ~215, ~241 | Added missing `await` on `searchPets`, `findPet`, `createVaccination`, `updateVaccination`, `findVaccinations` |
| packages/api/src/trpc/employee/bookings.ts | ~68, ~84, ~111, ~136 | Added missing `await` on `findBooking`, `findBookings` (2x), `findBookingService` |
| packages/api/src/trpc/configuration/emails.ts | ~18 | Added missing `await` on `findEmailTemplates` |
| packages/api/src/trpc/user/daycare.ts | ~45 | Added missing `await` on `findDaycareDates` |

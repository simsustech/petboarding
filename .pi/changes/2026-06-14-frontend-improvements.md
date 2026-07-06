# Changes: Frontend improvements (2026-06-14)

## Modified files

| File | Lines | Description |
|------|-------|-------------|
| packages/app/src/configuration.ts | 157 | Added `Loading.hide()` before `Loading.show()` in `loadConfiguration` catch block |
| packages/app/src/components/AgendaComponent.vue | 289-325 | Replaced `getBookingStays`, `getNumberOfBookingPets`, `getNumberOfDaycarePets` inline filters with pre-computed `computed` Maps (`staysMap`, `bookingPetCounts`, `daycarePetCounts`) |
| packages/app/src/components/ImageAvatar.vue | 7,15 | Added `aria-hidden="true"` to decorative camera icon; added `:aria-label` to edit/add button |
| packages/app/src/components/InvoiceButton.vue | 13 | Added `:aria-label="lang.booking.messages.openInvoice"` |
| packages/api/tests/e2e/kennelLayout.spec.ts | 11-34 | Added retry loop in `beforeAll` for Caddy warmup; added element wait in `beforeEach` for drag tests |
| .gitignore | 17-19 | Added SigMap generated context to gitignore |

## Modified files (selective hunks via git add -p) — 17 VUE PAGES

| File | Hunks staged | Description |
|------|-------------|-------------|
| packages/app/src/pages/employee/PetsPage.vue | 4 lines | `catch (e) {}` → `catch (e) { console.error(e) }` |
| packages/app/src/pages/account/CustomerPage/CustomerPage.vue | 2 lines | `catch (e) {}` → `catch (e) { console.error(e) }` |
| packages/app/src/pages/account/BookingsPage/BookingsPage.vue | 3 lines | `catch (e) {}` → `catch (e) { console.error(e) }` |
| packages/app/src/pages/account/ContactPeoplePage/ContactPeoplePage.vue | 2 lines | `catch (e) {}` → `catch (e) { console.error(e) }` |
| packages/app/src/pages/account/PetsPage/PetsPage.vue | 2 lines | `catch (e) {}` → `catch (e) { console.error(e) }` |
| packages/app/src/pages/account/DaycarePage/DaycarePage.vue | 3 lines | `catch (e) {}` → `catch (e) { console.error(e) }` |
| packages/app/src/pages/admin/DaycarePage.vue | 3 lines | `catch (e) {}` → `catch (e) { console.error(e) }` |
| packages/app/src/pages/admin/AccountsPage.vue | 2 lines | `catch (e) {}` → `catch (e) { console.error(e) }` |
| packages/app/src/pages/admin/PeriodsPage/PeriodsPage.vue | 1 line | `catch (e) {}` → `catch (e) { console.error(e) }` |
| packages/app/src/pages/admin/AnnouncementsPage/AnnouncementsPage.vue | 3 lines | `catch (e) {}` → `catch (e) { console.error(e) }` |
| packages/app/src/pages/admin/configuration/BuildingsPage/BuildingsPage.vue | 1 line | `catch (e) {}` → `catch (e) { console.error(e) }` |
| packages/app/src/pages/admin/configuration/VacationsPage/VacationsPage.vue | 1 line | `catch (e) {}` → `catch (e) { console.error(e) }` |
| packages/app/src/pages/admin/configuration/CategoriesPage/CategoriesPage.vue | 2 lines | `catch (e) {}` → `catch (e) { console.error(e) }` |
| packages/app/src/pages/admin/configuration/OpeningTimesPage/OpeningTimesPage.vue | 1 line | `catch (e) {}` → `catch (e) { console.error(e) }` |
| packages/app/src/pages/admin/configuration/DaycareSubscriptionsPage/DaycareSubscriptionsPage.vue | 1 line | `catch (e) {}` → `catch (e) { console.error(e) }` |
| packages/app/src/pages/admin/configuration/ServicesPage/ServicesPage.vue | 1 line | `catch (e) {}` → `catch (e) { console.error(e) }` |
| packages/app/src/pages/admin/configuration/KennelsPage/KennelsPage.vue | 1 line | `catch (e) {}` → `catch (e) { console.error(e) }` |

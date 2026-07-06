# Changes: Batch 1 - Frontend Bugs & Dead Code Removal (2026-06-14)

## New files
| File | Description |
|------|-------------|

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| packages/app/src/components/ApprovedAfterDownPaymentCheckbox.vue | 25 | Fixed component name from 'TermsAndConditionsCheckbox' to 'ApprovedAfterDownPaymentCheckbox' |
| packages/app/src/pwa.ts | 10-12 | Added `return` after `updateServiceWorker()` in __DEBUG__ path to prevent notification fallthrough |
| packages/app/src/components/announcement/AnnouncementsList.vue | 58-67 | Removed commented-out old button implementations |
| packages/app/src/components/building/BuildingsList.vue | 58-67 | Removed commented-out old button implementations |
| packages/app/src/components/kennel/KennelsList.vue | 58-67 | Removed commented-out old button implementations |
| packages/app/src/components/daycareSubscription/DaycareSubscriptionsList.vue | 62-71 | Removed commented-out old button implementations |
| packages/app/src/components/service/ServicesList.vue | 58-67 | Removed commented-out old button implementations |
| packages/app/src/components/openingTime/OpeningTimesList.vue | 58-67 | Removed commented-out old button implementations |
| packages/app/src/components/period/PeriodsList.vue | 70-79 | Removed commented-out old button implementations |
| packages/app/src/components/pet/PetLabel.vue | multiple | Removed all commented-out code blocks (sterilized field, breed duplicate, chemical sterilization, color duplicate, date-six-months-ago) and unused import |
| packages/app/src/components/booking/BookingServiceForm.vue | ~15-22 | Removed commented-out old mask pattern input |
| packages/app/src/components/booking/BookingItemContent.vue | ~87-95 | Removed commented-out approval icon |
| packages/app/src/components/customer/CustomerCard.vue | ~121-133 | Removed commented-out openBookings/openPets methods |
| packages/app/src/components/daycare/DaycareCalendarMonth.vue | 66, 293, 310-320 | Removed commented-out slot, getMonthName, getButtonColor |
| .npmrc | 2 | Added `inject-workspace-packages=true` for Docker build compatibility |

## Deleted files
| File | Description |
|------|-------------|
| packages/app/src/pages/admin/DaycareSubscriptionsPage.vue.bak | Stale backup file |
| packages/app/src/pages/admin/configuration/BookingEmailRepliesPage.vue.bak | Stale backup file |
| packages/app/src/pages/admin/OverviewPage.vue | Orphaned page with no route mapping |

## Test results
22 passed, 5 failed (pre-existing flaky tests - all pass when run in isolation)

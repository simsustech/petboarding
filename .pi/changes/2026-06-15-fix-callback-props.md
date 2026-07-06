# Changes: Fix callback prop typing (2026-06-15)

## Modified files

| File | Lines | Description |
|------|-------|-------------|
| packages/app/src/components/booking/BookingExpansionItem.vue | 194-218 | Changed `onOpenCustomer` and `onUpdateBookingInvoice` from `boolean` to function types in Props. Removed `getCurrentInstance`/`computed` imports. |
| packages/app/src/components/booking/BookingItem.vue | 70-90 | Changed `onOpenCustomer`, `onOpenBooking`, `onOpenPets` from `boolean` to function types in Props. Removed `getCurrentInstance`/`computed` imports. |
| packages/app/src/components/pet/PetCard.vue | 270-289 | Changed `onOpenCustomer` and `onDelete` from `boolean` to function types in Props. Removed `getCurrentInstance`/`computed` imports. |
| packages/app/src/components/AgendaChip.vue | 97-103 | Changed `onOpenPets` and `onOpenBooking` from `boolean` to function types in Props. |
| packages/app/src/components/AgendaComponent.vue | 103-168 | Added `:on-open-booking` and `:on-open-pets` props alongside existing event listeners. |
| packages/app/src/components/daycare/DaycareCalendarMonth.vue | 166 | Changed `onOpenPets` from `boolean` to function type. |
| packages/app/src/pages/admin/BookingsPage.vue | 50-69, 155-156, 538, 580 | Added `:on-open-customer` and `:on-update-booking-invoice` props. Replaced `['$props']` type extraction with exported handler types. |
| packages/app/src/pages/employee/BookingsPage.vue | 8-44, 97-103, 238, 260 | Same: added handler props, replaced type extraction. |
| packages/app/src/pages/employee/PetsPage.vue | 23-34, 92-97, 292 | Added `:on-open-customer` and `:on-delete` props. |
| packages/app/src/pages/employee/OverviewPage.vue | 98-155 | Added inline `:on-open-customer`, `:on-open-booking`, `:on-open-pets` handler props. |
| packages/app/src/pages/print/OverviewPage.vue | 16-57 | Same: added inline handler props. |
| packages/app/src/pages/admin/financial/FinancialOverviewPage.vue | 8-10, 41 | Added `:on-open-booking` prop. |
| packages/app/src/pages/admin/DaycarePage.vue | 8-13 | Added `:on-open-pets` prop. |

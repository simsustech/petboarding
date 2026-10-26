---
'@petboarding/app': patch
---

feat: show internal customer comments on the employee customer card

`CustomerCard.vue` rendered rating, name/address, phone, veterinarian and email, but no comment section — even though `Customer.comments` already exists end to end (DB column, zod schema, employee `getCustomer` select, and the edit dialog via `CustomerForm`'s `useComments`).

Adds an opt-in `useComments` prop that renders a comment row, enabled only by `pages/employee/CustomersPage.vue`. The customer-facing `pages/account/CustomerPage/CustomerPage.vue` leaves the flag off, so internal comments remain invisible to customers.

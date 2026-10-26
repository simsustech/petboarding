# Changes: Edit customer daycare subscription expiration date (2026-07-06)

## New files
| File | Description |
|------|-------------|
| `packages/app/src/mutations/employee/customerDaycareSubscription.ts` | Pinia colada mutation for updating daycare subscription |
| `packages/app/src/components/daycareSubscription/CustomerDaycareSubscriptionForm.vue` | Form component with date input for editing expiration date |
| `packages/api/tests/e2e/employee/customerDaycareSubscription.spec.ts` | E2E test for editing expiration date |

## Modified files
| File | Lines | Description |
|------|-------|-------------|
| `packages/api/src/trpc/employee/daycare.ts` | +20 | Added `updateCustomerDaycareSubscription` procedure (input: id, expirationDate) |
| `packages/api/src/kysely/seeds/test.ts` | +23 | Added daycare subscription + customer daycare subscription seed data |
| `packages/api/playwright.config.ts` | 3 changed | Switched to chromium, headless=true, baseURL port 3003 |
| `docker-compose.test.yaml` | 4 changed | Port 3000→3003, VITE_API_HOST updated |
| `packages/app/src/components/daycareSubscription/CustomerDaycareSubscriptionsList.vue` | +19 | Added edit button (pencil icon) with emit('update'), next to invoice button |
| `packages/app/src/pages/employee/CustomersPage.vue` | +45 | Added ResponsiveDialog + form for editing, wired up mutation + refetch |

# Changes: fix re-adding an existing employee daycare date (2026-11-06)

Symptom: adding a daycare date on `/employee/customers/:id` answered
`employee.createDaycareDates` with `BAD_REQUEST`, message `BAD_REQUEST`, no
cause, nothing in the log.

Root cause (reproduced against a dump of the production database):

- A calendar day can legitimately have **more than one** `daycare_dates` row:
  `createDaycareDate` splits a date across customer subscriptions when one
  subscription has fewer days left than the number of pets. Prod data for
  customer 10 / `2026-12-08` holds two rows, one for subscription 1079 (25-day
  plan) and one for subscription 1163.
- `createOrUpdateDaycareDates` then updated each existing row with
  `WHERE date = $1 AND customer_id = $2`, which matches **both** rows and wrote
  the *first* row's `customer_daycare_subscription_id` onto both.
- Production carries `daycare_dates_unique (date, customer_id,
  customer_daycare_subscription_id)` — so that update raised
  `duplicate key value violates unique constraint "daycare_dates_unique"`.
- The mutation's `catch` replaced the cause with a bare `TRPCError`, which is
  why the client only ever saw `BAD_REQUEST`.

Note: that unique constraint exists **only on production** — no migration creates
it, so a freshly migrated database does not reproduce the failure.

## New files
| File | Description |
|------|-------------|
| `packages/api/src/repositories/daycare.test.ts` | Regression: a date with two rows (one per subscription) must be updated in place, each row keeping its own subscription. Fails with `duplicate key value violates unique constraint "daycare_dates_unique"` without the fix. |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/api/src/repositories/daycare.ts` | +9 | `createOrUpdateDaycareDates` updates existing rows by `id` instead of by `(date, customerId)`. |
| `packages/api/src/trpc/employee/daycare.ts` | +18/-1 | `catch` logs the failure (`err`, `customerId`, `dates`) and rethrows with the real message and `cause` instead of a bare `BAD_REQUEST`. |

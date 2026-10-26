# Changes: cancelation status vs the billed cancelation costs (2026-10-15)

Reported: a booking created for tomorrow and canceled immediately showed the correct
cancelation costs, but its status was `canceled`, so it never appeared in
`/admin/financial/overview`.

Root cause: `cancelBooking` passed `getLastApprovedForBooking(booking)` to
`bookingCancelationHandler` **without `await`**, so the handler read `booking.costs` off
a promise (`TypeError: Cannot read properties of undefined (reading 'totalIncludingTax')`)
and threw on every cancelation. The catch block — written for a deployment without an
`api.config.js` — swallowed it and chose the status: its fallback only returns
`canceledoutsideperiod` for a booking that is *currently approved*, so a pending (or
awaiting-down-payment) booking was stored as `canceled`. The billed lines come from the
clock-based handler, not from the stored status, which is why the fee was correct and
invisible at the same time. `admin.getUnpaidBookings` lists `APPROVED` +
`CANCELED_OUTSIDE_PERIOD` only.

The staff route had a second instance of the same symptom: `employee.cancelBooking`
passed `ignoreCancelationPeriod = true`, which forced `canceled` regardless of the clock.

## New files

| File | Description |
| --- | --- |
| `.changeset/olive-fees-record.md` | `@petboarding/api` patch. |
| `packages/api/tests/e2e/administrator/financial-canceled-booking.spec.ts` | Regression: a one-day stay starting tomorrow, canceled through the customer route and the staff route, must be recorded as `canceledoutsideperiod`; and, on a SlimFact-connected stack, must appear in `admin.getUnpaidBookings` and on `/admin/financial/overview`. |

## Modified files (all hunks accepted)

| File | Lines | Description |
| --- | --- | --- |
| `packages/api/src/repositories/booking.ts` | +58/−48 | `cancelBooking`: await the cancelation reference; `bookingCancelationHandler` is a static import now that there is no mountable `api.config.mjs` (so a handler error surfaces instead of being mistaken for a missing config and deciding the status); the clock-derived status is the fallback; the handler is skipped when there is no `costs` to price from; the third parameter is `{ allowPastStartDate }` and no longer overrides the recorded status. Also drops two unused `catch (e)` bindings in `checkDownPayments`. |
| `packages/api/src/trpc/employee/bookings.ts` | +1/−1 | Call site: `{ allowPastStartDate: true }`. |
| `packages/api/src/trpc/admin/bookings.ts` | +3/−1 | Call site (`settleBookingCancelation`): `{ allowPastStartDate: true }`. |
| `packages/api/src/slimfact/slimfact.d.ts` | +7/−2 | The admin `getInvoices` input was stale: `status` was required and the `statuses` / `startDate` / `endDate` SlimFact accepts were missing, so the `statuses:` argument in `trpc/admin/bookings.ts` could not type-check. Patched field-for-field against SlimFact's `packages/api/src/trpc/admin/invoices.ts:307-339`. |

## Verification

- New spec, red→green: before the fix booking 21 (customer route) and booking 22 (staff
  route) were stored `canceled`; after it both are `canceledoutsideperiod`
  (`packages/api` → `pnpm exec playwright test tests/e2e/administrator/financial-canceled-booking.spec.ts`).
- Full suite: `pnpm run test:e2e` → 124 passed / 6 skipped / 0 failed.
- `pnpm run lint` (warnings only, all pre-existing), `pnpm run format:check`,
  `pnpm run build`, `packages/api` → `pnpm run test` (114/114).

## Verified on a SlimFact-connected stack

The spec's third test (the booking is listed as unpaid, and the overview page renders it)
was first written against a booking *for tomorrow*, which cannot pass: `admin.getUnpaidBookings`
bounds the list with `startDate <= today` (the "last 90 days" window), so a future stay is
excluded however its cancelation is recorded. Measured on the data: booking 23 (start
`2026-10-16`, `canceledoutsideperiod`, invoice `4fedb169…`) was filtered out by that date
bound, not by its status. The window is kept as it is (Stefan's call), so the test now uses
a stay that starts **today** and is cancelled by staff — a stay that has started can only
be cancelled with `{ allowPastStartDate: true }`, and the date bound admits it:

```text
booking 24 start 2026-10-16 (customer route) -> canceledoutsideperiod
booking 25 start 2026-10-16 (staff route)    -> canceledoutsideperiod
booking 26 start 2026-10-15 (staff route)    -> canceledoutsideperiod
  → has an invoice, is in admin.getUnpaidBookings, and renders on /admin/financial/overview
```

3/3 passed on the `docker-compose.test.slimfact.yaml` stack.

## The SlimFact connect outage that hid that run (corrected)

Getting there took a wrong turn worth recording, because the first diagnosis was wrong.
The connect flow failed with `InvalidClient: invalid_client` from
`https://slimfact.localhost/oidc/authorize`, and I read that as "the request omits
`redirect_uri`" — it had been omitted, and `openid-client` never derives it from the empty
client metadata. Measured per instance afterwards (curl from inside each container,
bypassing caddy):

```text
petboarding-slimfact-1 (knows client `petboarding`)  no redirect_uri -> 303   with -> 303
slimfact-api-1         (standalone slimfact stack)   no redirect_uri -> 400   with -> 400
```

So the parameter was never the blocker. **Two containers claimed `slimfact.localhost`** —
`petboarding-slimfact-1` (network `petboarding_test`) and `slimfact-api-1` (network
`slimfact_staging`), both carrying the caddy label for that host — so requests alternated
(`400 400 303 303 303 303 400 400 400 303`) and the browser kept landing on the instance
that has no `petboarding` client registered. With the standalone stack stopped, the connect
test passes in 9.6 s, `/health` reports `slimfact: healthy`, and `modularapi.oidc_clients`
(a schema `@modular-api/api`'s `oidcClientPlugin` creates only inside its OIDC callback,
inside a `try/catch` that reports failures with `console.error` alone) is created with the
`slimfact` row — which is why a failed connect is silent in health.

Stefan kept the explicit `redirect_uri` in `@modular-api/api` anyway, as robustness (a
provider with more than one registered redirect URI requires it). For any future SlimFact
run: **only one container may serve `slimfact.localhost`** — stop the standalone `slimfact`
stack (`docker stop slimfact-api-1`) before bringing up the overlay.

## The type errors that kept flagging this file (now fixed)

`tsc` cannot be run with the repo's own config (`baseUrl` is a TS 7 error), so the type
check was:

```sh
cd packages/api && pnpm exec tsc --noEmit -p tsconfig.json --ignoreDeprecations 6.0
```

It reports 84 errors on this branch's base and **82** after it, and the two that went away
are the `TS2322`s in `repositories/booking.ts` that every edit kept surfacing: the local
`BookingService` interface declared `service: Service`, while `withServices` builds that
object with kysely's `jsonObjectFrom`, which is typed — and can only be — `Service | null`.
Every reader already guards it (`service.service && service.listPrice` in `api.config.ts`,
`service.service?.name` in the app), so the declaration was corrected to match what the
query returns, and `findBooking`/`findBookings` type-check. The remaining 82 are unrelated
and pre-existing (missing `vitest` types in test files, inference in `api.config.test.ts`,
`'en-US' | 'nl'` in `slimfactInvoice.ts`, `kennel.ts`, the screenshot specs…).

Other unused SlimFact entries are stale in the same way (the `user` router's
`getInvoices`, `getReceipts` and `getBills` are typed `input: void`; the server takes
`{ pagination? }`) — left as-is because petboarding only ever calls
`fastify.slimfact.admin.*`.
SlimFact entries are stale in the same way (the `user` router's `getInvoices`,
`getReceipts` and `getBills` are typed `input: void`; the server takes
`{ pagination? }`) — left as-is because petboarding only ever calls
`fastify.slimfact.admin.*`.

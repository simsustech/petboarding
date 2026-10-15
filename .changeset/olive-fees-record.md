---
'@petboarding/api': patch
---

fix: record the cancelation period's status when a booking is canceled

A booking canceled inside the cancelation period is stored as `canceledoutsideperiod`
again instead of `canceled`, so its cancelation fee shows up in
`admin.getUnpaidBookings` — and therefore in `/admin/financial/overview`.

`cancelBooking` handed the cancelation handler an *unawaited*
`getLastApprovedForBooking(booking)` call, so the handler read `booking.costs` off a
promise and threw. The surrounding catch — meant for a deployment that ships no
`api.config.js` — then decided the status, and its fallback only says
`canceledoutsideperiod` for a booking that is *currently approved*. Cancelling a
pending or awaiting-down-payment booking therefore stored `canceled` while the fee was
billed anyway (the cost lines come from the clock, not from the stored status).

- `await` the cancelation reference, and import `bookingCancelationHandler` statically
  (the mountable `api.config.mjs` template is gone): a handler error surfaces instead of
  being mistaken for a missing config and silently choosing a different status.
- `cancelBooking`'s third parameter is now `{ allowPastStartDate }` (cancelling a stay
  that already started, e.g. a staff no-show or an expired down payment). It no longer
  also forces `canceled`, which hid the fee of every staff cancellation.
- A booking whose pets are not all categorised has no `costs` to price a cancelation
  from, so the handler is skipped there instead of throwing.
- `calculateBookingCosts` uses the same static import: its fallback pricing for a missing
  `api.config.js` is gone with the template, so a handler or vacation-lookup failure now
  surfaces instead of silently pricing the booking a different way.
- `BookingService['service']` is declared `Service | null` — what the `withServices` join
  actually returns (`jsonObjectFrom`) — which removes the two `TS2322`s that
  `findBooking`/`findBookings` reported.

Also refreshed the stale SlimFact client type it depends on: the admin `getInvoices`
input in `packages/api/src/slimfact/slimfact.d.ts` still typed `status` as required and
lacked the optional `statuses`, `startDate` and `endDate` the procedure accepts. So
`/admin/financial/bookings`, which sends `statuses: [OPEN, PAID, RECEIPT, BILL]`, worked
at runtime but could not type-check. Patched against SlimFact's
`packages/api/src/trpc/admin/invoices.ts`.

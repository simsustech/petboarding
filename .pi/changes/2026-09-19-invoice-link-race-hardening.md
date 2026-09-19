# Changes: invoice-link race hardening (2026-09-19)

Review follow-up on `15735fe40 fix(daycare): make subscription invoice creation
idempotent under concurrency`. No happy-path behaviour change: the conditional
link (`WHERE invoiceUuid IS NULL`), the loser-cancels-orphan policy and the
winner-follow-up are unchanged — they are now shared, documented and covered by
a test that runs in CI.

## New files

| File | Description |
| ------ | ----------- |
| `packages/api/src/trpc/admin/slimfactInvoice.test.ts` | Unit tests for `cancelOrphanAndFollowWinner`: cancels then follows the winner, a refused cancel still follows the winner, no winner uuid → `null` without reading an invoice, unreadable winner → `null`, no SlimFact client → `null`. Runs under `pnpm test` (`src/**/*.test.ts`) — unlike the race e2e specs, which need SlimFact + Mollie and are skipped without `PLAYWRIGHT_SLIMFACT`. |

## Modified files (all hunks accepted)

| File | Lines | Description |
| ------ | ------- | ------------- |
| `packages/api/src/trpc/admin/slimfactInvoice.ts` | 71 | Extract the loser half of the race into an exported `cancelOrphanAndFollowWinner` (cancel the orphan bill best-effort, then read the winner's invoice); the booking branch calls it. |
| `packages/api/src/trpc/user/customerDaycareSubscriptions.ts` | 31 | The daycare loser branch uses the same helper instead of its own copy of cancel-then-read; two catch blocks drop the unused `catch (e)` binding. |
| `packages/api/src/repositories/booking.ts` | 17 | `onlyIfInvoiceUuidNull` without `criteria.id` now throws: the guard sits inside the `criteria.id` branch, so it could previously be silently skipped. JSDoc states the `null` contract. |
| `packages/api/src/repositories/customerDaycareSubscription.ts` | 27 | Same requirement for `criteria.id`; the conditional branch no longer duplicates the tail and returns `null` instead of `undefined`, matching `updateBooking`. |

## Verification

- `cd packages/api && pnpm run test` — 71 passed (3 files), including the new
  `slimfactInvoice.test.ts`.
- `pnpm run lint:api` — pre-existing warnings only (unused catch params and
  imports elsewhere in `src`); nothing new from this change.
- `pnpm run format:check:api` — all matched files use the correct format.
- `cd packages/api && ./node_modules/.bin/tsc --noEmit -p tsconfig.json` — only
  the pre-existing config errors (25 × TS6059 `rootDir` on `tests/**`, TS5101
  `baseUrl` deprecated). No semantic errors.
- Not run: `tests/e2e/slimfact.spec.ts` and the concurrent case in
  `tests/e2e/bookings.spec.ts` — both need the SlimFact + Mollie test stack.

## Found while reviewing, left alone (need a decision)

- **Duplicate payment on the winner's bill.** `customerDaycareSubscriptions.ts`
  near the end of the route: the reuse lookup for an `OPEN`/`PENDING` payment is
  a read-then-create, so two racers that both miss it each call
  `addPaymentToInvoice` and the customer gets two checkout URLs. Checkout 0.11.0
  already implements that reuse server-side (`invoiceHandler.addPaymentToInvoice`)
  while petboarding is on 0.10.0 — see
  `.pi/changes/2026-09-19-handoff-slimfact-invoice-payments.md`; the local block
  disappears with the version bump. The amount is not a concern: subscription
  invoices are created with `requiredDownPaymentAmount: 0` and are paid in full
  in one payment.
- **`Invoice.payments` type gap.** The checkout package types `payments` as
  `Pick<Payment, 'id' | 'currency' | 'amount' | 'paidAt' | 'description' |
  'status' | 'uuid' | 'paymentServiceProvider'>` — no `checkoutUrl` and no
  `createdAt`, which the reuse code reads. Either the payload is richer than the
  type (the reuse works by accident) or the reuse never matches; the e2e
  assertion on equal `checkoutUrl`s cannot tell.
- **Subscription-creation race.** The read-then-`createCustomerDaycareSubscription`
  pair has no unique constraint on (customerId, daycareSubscriptionId, period),
  so two requests that both miss the read create two rows, each links its own
  bill successfully and `onlyIfInvoiceUuidNull` never fires. Narrower window
  than the link race (single insert vs a SlimFact round trip) but real.
- **`tests/e2e/bookings.spec.ts` race test cannot fail on the pre-fix code**: it
  only asserts the booking ends up with a truthy, stable `invoiceUuid`, which
  last-write-wins also satisfies. It needs to assert the orphan was canceled
  (e.g. one non-canceled bill for the booking) to be a regression test.
- Pre-existing `tsc`-invisible type mismatches in
  `customerDaycareSubscriptions.ts` (10 diagnostics: 3 × `currency`/locale
  literal widening, `companyDetails.emailBcc` nullability,
  `numberPrefixTemplate` possibly `undefined`, 5 × the `payments` gap above).
  Reproduced unchanged on the committed file, so not introduced here.

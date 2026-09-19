# Invoice-link races, payment reuse, BILL semantics — handoff for slimfact (2026-09-19)

Petboarding creates one SlimFact bill per booking / daycare subscription and
links it to its own row with a conditional write
(`UPDATE … WHERE invoiceUuid IS NULL`). When a request loses that race it
cancels the bill it just created and continues on the winner's, so the row's
`invoiceUuid` stays the single authority. That half is petboarding's problem and
is handled locally (see "Petboarding state" below).

This document is the part that needs your side: one version bump that removes a
duplicate implementation we wrote against the old package, plus three contract
questions where petboarding is currently guessing.

Versions in play: **slimfact `@modular-api/fastify-checkout` 0.10.2**,
petboarding **0.10.0**, latest published **0.11.0**.

## 1. Bump @modular-api/fastify-checkout to 0.11.0 (highest value)

0.11.0 already contains `272ebb6b feat(checkout): prevent duplicate payments on
concurrent checkouts`. `invoiceHandler.addPaymentToInvoice` now looks for an
existing `OPEN`/`PENDING` payment with a non-null `checkoutUrl` and returns it
instead of minting a second one —
`@modular-api/fastify-checkout/src/invoiceHandler.ts:1057-1083`:

```ts
// Reuse an in-flight checkout instead of minting another one. A caller
// retrying while a checkout is still payable (OPEN/PENDING) must get the
// same URL back; creating a second payment would leave the first
// orphaned and could double-charge if both were paid.
```

SlimFact's admin `addPaymentToInvoice` calls that handler and forwards
`checkoutUrl` (slimfact `packages/api/src/trpc/admin/invoices.ts:866-923`), so the
behaviour arrives through your existing API — **no SlimFact API change is
needed, only the dependency bump.**

Until that lands, petboarding re-implements the same lookup client-side
(`packages/api/src/trpc/user/customerDaycareSubscriptions.ts`), which is both
duplicate logic and untypeable on 0.10.x: `Invoice['payments']` on 0.10.x is a
`Pick` without `checkoutUrl`/`createdAt`, while the query actually projects them.
0.11.0 fixes the type (`@modular-api/fastify-checkout/src/index.ts:83-99`) to match
`withPayments` (`@modular-api/fastify-checkout/src/invoiceHandler.ts:274-295`).

After the bump petboarding deletes its local reuse block and reads
`invoice.payments` with real types.

Residual gap worth a decision: the upstream reuse is still read-then-create —
no lock, and I found no unique index on in-flight payments — so two
*simultaneous* calls can both miss the lookup and both create a payment. The
window shrinks from "a Mollie round trip" to "one query", it does not close. A
partial unique index on `(invoiceId)` where `status in (OPEN, PENDING)`, or an
advisory lock around the lookup, would make a double charge impossible rather
than unlikely.

## 2. `setInvoiceStatus` refusals are invisible to callers (two separate causes)

`invoiceHandler.setInvoiceStatus` **returns** `{ success: false, errorMessage }`
for a refused transition instead of throwing (catch at
`@modular-api/fastify-checkout/src/invoiceHandler.ts:573-575`), and your admin procedure passes that object
straight through (slimfact `packages/api/src/trpc/admin/invoices.ts:924-944`). Two
consequences on our side:

1. tRPC resolves successfully, so a caller that only handles rejections believes
   the status change happened. Petboarding's orphan-cancel is exactly such a
   caller: it cancels the loser's freshly created bill best-effort, and a
   refusal would leave an orphan bill alive while petboarding reports success.
2. Petboarding's generated SlimFact client types the procedure as
   `output: void` (petboarding `packages/api/src/slimfact/slimfact.d.ts:1125-1131`),
   so we *cannot* check `success` even if we wanted to.

Asks: make the admin procedure throw a `TRPCError` when the handler reports
`success: false` (then callers get a rejection, and `void` becomes honest), or
return the result object and refresh the generated types. Either way it is worth
deciding which contract petboarding should code against.

## 3. Webhook payload: canceled bills look identical to anomalies

`fetchWebhookUrl` posts exactly `{ uuid }`
(`@modular-api/fastify-checkout/src/fetchWebhookUrl.ts`, pinned by its own
`fetchWebhookUrl.test.ts`), and `setInvoiceStatus` fires it on **every**
transition, including the cancel of the orphan bill
(`@modular-api/fastify-checkout/src/invoiceHandler.ts:556`).

Petboarding's handler (`packages/api/src/setup.ts`, `/webhook/slimfact`) looks
the document up by uuid; an orphan bill matches no booking and no subscription,
so it logs `log.error` "paid bill matches no subscription or booking". Every
lost race therefore produces an error line that reads like an incident.

Asks: include `status` plus the invoice's `metadata` (petboarding already sends
`referenceId: 'petboarding'` and `referenceUrl`) in the payload, so a consumer
can tell "a document we deliberately discarded" from "an unexpected paid bill".
If you would rather not widen the payload, say so and petboarding will fetch the
invoice and downgrade `CANCELED` + references-nothing to debug — but then the
`log.error` alert is muted for real anomalies too.

## 4. BILL semantics we assume (please confirm)

- Cancelling works for CONCEPT and BILL only, and never for a BILL that has
  payments (`@modular-api/fastify-checkout/src/invoiceHandler.ts:510-525`). So
  cancelling a bill that was just created, never opened and never paid should
  always succeed — that is what makes our "loser cancels its own bill" policy
  safe.
- Numbering happens in `openInvoice`, in a serializable transaction, and refuses
  to renumber (`@modular-api/fastify-checkout/src/invoiceHandler.ts:933-977`). So
  an orphan that is only created and cancelled consumes **no** document number.
  Petboarding creates with `status: BILL` and cancels before any payment is
  added; please confirm that discarding a document this way is the intended
  pattern with no numbering gap to explain to an accountant.
- Petboarding relies on a bill being linkable to at most one document row (it is
  also backed by the unique index on `invoice_uuid` in its own tables). If
  SlimFact ever allows one bill to be referenced from several documents, the
  conditional-link design breaks; worth stating in the API docs.

## 5. Type-contract nits (checkout package / modular-api side)

These force workarounds in petboarding and are invisible today because the API
package has no typecheck gate in CI:

- `createInvoice`/`updateInvoice` expect `companyDetails.emailBcc: string`, but
  `admin.getCompany` returns `string | null`; passing that company record
  straight through is a type error.
- `numberPrefixTemplate: string` is required, while `getCompany`'s
  `defaultNumberPrefixTemplate` is nullable and `getNumberPrefixes()[0].template`
  optional — our `a || b` chain can produce `undefined`.
- `currency: 'EUR' | 'USD'` versus `config.currency` (plain `string`) from env.

## Petboarding state (for reference, no action needed)

- `385774f75 refactor(api): share the invoice-race loser path and guard its id`
  — extracted `cancelOrphanAndFollowWinner`
  (`packages/api/src/trpc/admin/slimfactInvoice.ts`) for both loser paths, and
  both conditional-link guards now reject a missing `criteria.id`
  (`packages/api/src/repositories/{booking,customerDaycareSubscription}.ts`).
  Unit test: `packages/api/src/trpc/admin/slimfactInvoice.test.ts` (runs without
  SlimFact/Mollie, unlike the e2e race specs).
- Still open on our side: the subscription-creation race (read-then-create with
  no unique constraint on `(customerId, daycareSubscriptionId, period)` — two
  requests that both miss the read create two rows and `onlyIfInvoiceUuidNull`
  never fires), the payment amount when a loser lands on a part-paid winner bill
  (`amount: invoice.totalIncludingTax` ignores `amountPaid`), and the bookings
  race e2e test that cannot fail on the pre-fix code.

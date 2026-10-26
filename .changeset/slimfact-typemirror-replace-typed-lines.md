---
'@petboarding/api': patch
---

Declare `replaceTypedLines` in the SlimFact type mirror.

`packages/api/src/slimfact/slimfact.d.ts` is the hand-maintained mirror of
SlimFact's router types, and it had drifted: SlimFact's `invoiceValidation`
declares `replaceTypedLines: string | string[]` (optional, nullable) on both
`admin.createInvoice` and `admin.updateInvoice`, while the mirror still ended at
`reminderSentDates`. The call site has been sending the key since "replace the
billed lines when a booking is canceled" (`slimfactInvoice.ts:152`), so the local
type described a payload the app does not send — and anything written against
this mirror could not pass the key without a cast.

Patched field-for-field against SlimFact's `packages/api/src/zod/invoice.ts`
(`replaceTypedLines` is forwarded to `@modular-api/fastify-checkout`'s
`updateInvoice`; on `createInvoice` the shared validation accepts it but the
router does not forward it, which the mirror now says).

No runtime change: `packages/api` never type-checks `src` (`build:api` is
`vitrify build -m fastify`, `tsc` runs only for migrations), which is why the
drift was invisible. Verified that the repo's type-error count is unchanged by
this edit — 82 before and 82 after `tsc -p tsconfig.json --noEmit` — and that the
mirror now accepts the key the call site passes.

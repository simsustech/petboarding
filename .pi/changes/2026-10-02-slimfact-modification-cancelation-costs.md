# Changes: Sync a modified booking's cancelation costs to SlimFact (2026-10-02)

## Problem

When a customer edits a booking inside the cancelation period and it is approved,
the cancelation costs shown on the booking view were missing from the SlimFact
invoice — and "update invoice" (sync) did not fix it either.

Two independent causes:

1. `createOrUpdateSlimfactInvoice` recomputed the costs with its **own** reference
   selection (`getLastApprovedForBooking`, the most recent approved version). For a
   modification that version *is* the edited booking, so the cancelation delta was
   zero. The display path used a different rule (`getHighestDaysApprovedForBooking`),
   so the invoice and the booking view disagreed.
2. `approveBooking` generated the invoice while the booking was still `PENDING`
   (the customer's edit), so the modification branch never ran at approval.

## Fix

- **Invoice uses the booking's own costs.** `createOrUpdateSlimfactInvoice` now sends
  `booking.costs` (the same computation the UI renders) instead of recomputing — the
  invoice can no longer drift from the displayed costs. (The SlimFact line schema is a
  plain `z.object`, so the extra computed fields are stripped, not rejected.)
- **Charge only in-period removals.** The reference selection was replaced by
  `pickCancelationReferenceStatus`: the approved version in effect when the
  cancelation window opened (`startDate − 2 months`, `− 4` in the summer vacation),
  not the highest-days or most-recent version. A `5wk → 1wk` change made outside the
  window and a later `1wk → 3d` change inside it now charge only `1wk → 3d`.
- **`AWAITING_DOWNPAYMENT` counts as approved** for the modification surcharge, so a
  booking awaiting its deposit is billed and displayed consistently.
- **Approval syncs the costs.** `approveBooking` recomputes the booking costs for the
  approved status (`calculateBookingCostsForStatus`) and generates the invoice from
  them, so a modification's fee is billed the moment the booking is approved.

## New files

| File | Description |
|------|-------------|
| `packages/api/src/repositories/booking.cancelationReference.test.ts` | Unit tests for `pickCancelationReferenceStatus` (multi-stage shortenings). |
| `packages/api/src/trpc/admin/slimfactInvoice.cancelation.test.ts` | Asserts the invoice bills `booking.costs`, including the cancelation line. |

## Modified files (all hunks accepted)

| File | Lines | Description |
|------|-------|-------------|
| `packages/api/src/repositories/booking.ts` | ~+70/−60 | Add `calculateBookingCostsForStatus`; replace the highest-days selection with the period-start reference (`pickCancelationReferenceStatus`); route `findBooking`/`findBookings` through the helper. |
| `packages/api/src/trpc/admin/slimfactInvoice.ts` | ~+10/−97 | Bill `booking.costs` instead of recomputing via `bookingCostsHandler`. |
| `packages/api/src/api.config.ts` | +2/−1 | Modification surcharge also fires for `AWAITING_DOWNPAYMENT`. |
| `packages/api/src/trpc/admin/bookings.ts` | +12/−3 | `approveBooking` generates the invoice from the approved-state costs. |
| `packages/api/src/api.config.test.ts` | +52 | Cover the `AWAITING_DOWNPAYMENT` modification surcharge. |

## Pre-existing (not caused by this change, left untouched)

- `booking.ts` `findBooking`/`findBookings` returns: `services.service` nullability
  vs `BookingService` (present on `dev`).
- `slimfactInvoice.ts`: `locale = config.lang`, `companyDetails` / `currency` /
  `numberPrefixTemplate` narrowing (present on `dev`).
- `admin/bookings.ts:130` `statuses: invoice.statuses` (present on `dev`).
- Test files: tsserver cannot resolve `vitest`; `downPayment` optionality in
  `api.config.test.ts`.

## Verification

```bash
pnpm run lint && pnpm run format:check && pnpm run build   # all green
cd packages/api && pnpm test                               # 104 passed
```

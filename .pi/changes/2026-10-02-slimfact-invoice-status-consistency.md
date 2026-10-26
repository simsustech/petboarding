# Changes: One invoice-sync path for every booking status change (2026-10-02)

## Problem

Invoice syncing was inconsistent across the booking lifecycle:

- **Approval** created the invoice — but from the pre-approval (PENDING) costs, so a
  modification's cancelation fee was missing (fixed in the previous commit, which
  computed the approved costs in the tRPC layer).
- **Cancel** synced the invoice only on the *customer* path (`user.cancelBooking`).
  Cancelling via `employee.cancelBooking` or `admin.settleBookingCancelation` left the
  invoice untouched.
- **Reject / standby** never touched the invoice.

## Fix

Introduce one helper, `syncBookingInvoice({ fastify, bookingId })`
(`trpc/admin/slimfactInvoice.ts`), and route every status change through it:

- It re-reads the booking (so `booking.costs` reflect the *new* status), syncs the
  invoice from those costs, and logs (never throws) a failed sync.
- It only syncs bookings that were approved (`invoiceUuid`, or an `APPROVED` /
  `AWAITING_DOWNPAYMENT` status in history) — a booking that is rejected or stood by
  while still pending is never invoiced.

Call sites now:

| Flow | Before | After |
|------|--------|-------|
| `admin.approveBooking` | computed approved costs inline, invoice before status | creates the status, then `syncBookingInvoice` |
| `admin.rejectBooking` | none | `syncBookingInvoice` |
| `admin.standbyBooking` | none | `syncBookingInvoice` |
| `admin.settleBookingCancelation` | none | `syncBookingInvoice` |
| `employee.cancelBooking` | none | `syncBookingInvoice` |
| `user.cancelBooking` | inline block, guarded by "was APPROVED" | `syncBookingInvoice` (guard now includes `AWAITING_DOWNPAYMENT`, which the old guard missed) |

`calculateBookingCostsForStatus` is no longer used by `approveBooking`; it remains the
internal cost helper for `findBooking` / `findBookings`.

## Modified files

| File | Description |
|------|-------------|
| `packages/api/src/trpc/admin/slimfactInvoice.ts` | Add `syncBookingInvoice`. |
| `packages/api/src/trpc/admin/bookings.ts` | approve/reject/standby/settle use the helper; drop the inline approved-costs computation. |
| `packages/api/src/trpc/employee/bookings.ts` | Cancel syncs the invoice. |
| `packages/api/src/trpc/user/bookings.ts` | Cancel uses the helper (guard fixed for awaiting-down-payment bookings). |
| `.changeset/curvy-pens-agree.md` | Note the unified status-change sync. |

## Notes / pre-existing

- Reject/standby of a **pending** booking has no invoice, so the helper is a no-op;
  it only matters for a rejected *modification* (which has an approved invoice).
- `admin.updateBookingService` and `employee.updateBookingInvoice` still call
  `createOrUpdateSlimfactInvoice` directly (not status changes) — left as-is.
- Pre-existing in `api.config.test.ts` (present on `dev`, project-wide): `vitest` is not
  a direct dependency of `packages/api` (it comes via `vitrify`), so tsserver cannot
  resolve `import … from 'vitest'` for **any** test file; and ten
  `downPayment: …requiredDownPaymentAmount` lines rely on the value being present at
  runtime. Neither is introduced here; the project has no `tsc` gate for `api`.

## Verification

```bash
pnpm run lint && pnpm run format:check && pnpm run build
cd packages/api && pnpm test   # 104 passed
```

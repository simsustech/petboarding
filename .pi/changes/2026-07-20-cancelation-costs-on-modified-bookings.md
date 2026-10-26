# Changes: Wire cancelation costs for modified bookings (2026-07-20)

## Modified files

| File | Lines | Description |
|------|-------|-------------|
| `packages/api/src/repositories/booking.ts` | ~80 | Add `bookingStatus` / `lastApprovedBooking` params to `calculateBookingCosts` and pass through to `bookingCostsHandler`. Wire `findBooking` and `findBookings` to compute `getLastApprovedForBooking` and pass the data. |
| `packages/api/src/api.config.test.ts` | ~105 | Add test: cancelation surcharge for 27.5→20.5 day Zomervakantie booking shortened within 14 days of start (summer, 4-month cancel window). |

## Problem

When booking dates were shortened after approval, the cancelation costs for the removed dates were not calculated. The `bookingCostsHandler` already has the logic (lines 348-402 in `api.config.ts`), but `calculateBookingCosts` never received `bookingStatus`, `lastApprovedBooking`, or `ctx` params — so the cancelation surcharge branch never executed.

## Fix

1. **`calculateBookingCosts`** — added optional `bookingStatus`, `lastApprovedBooking` params, passes them (plus `ctx` with `BOOKING_STATUS`) to `bookingCostsHandler`
2. **`findBooking`** — calls `getLastApprovedForBooking(result)` and passes `bookingStatus` + `lastApprovedBooking` to `calculateBookingCosts`
3. **`findBookings`** — same for each booking in the loop

## Pre-existing issues (not caused by this change)

2 test failures in `api.config.test.ts` related to removing pets from bookings:

- `computes a cancellation surcharge equal to the removed pet when a pet is dropped` — expects delta 20000, gets 17000
- `shortening one pet and then the other both accrue surcharges against the highest-days version` — expects firstDelta 20000, gets 17000

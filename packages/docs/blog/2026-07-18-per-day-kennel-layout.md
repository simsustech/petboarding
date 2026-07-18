---
title: Per-Day Kennel Layout for Bookings
description: Kennel assignments for bookings can now be set per day instead of once per booking.
date: 2026-07-18
author: Petboarding
---

# Per-Day Kennel Layout for Bookings

Kennel assignments for bookings are now resolved per day rather than once per booking. The base layout still lives on the booking row; specific days that need to differ are stored as overrides.

## What changed

- The kennel layout for a booking pet is no longer a single value that applies to every day of the booking.
- Dragging a pet into a kennel for a specific day writes an override for that date only.
- A drag-to-waitlist on a specific day removes forward overrides for that pet in that booking. The booking base takes over again.
- The effective kennel for any (booking, pet, date) is the most recent override with `date <= <date>` inside the booking, or the base if there is no override.
- Daycare is unchanged; daycare assignments were already per-day.
- Storage cost is one row per drag, regardless of booking length. There is no per-day row expansion.

## Backend

The change is in `packages/api/src/repositories/kennel.ts` and `packages/api/src/trpc/employee/kennels.ts`. The read path adds a `LEFT JOIN LATERAL` against `booking_pet_kennel_override`, picking the override with `date <= $inputDate` ordered by `date DESC LIMIT 1` and clamped to `bookings.startDate..endDate`. The override is on `(booking_id, pet_id, date)`, indexed on `(booking_id, date)` for the lookup.

The write path uses PostgreSQL `INSERT … ON CONFLICT (booking_id, pet_id, date) DO UPDATE SET kennel_id = EXCLUDED.kennel_id`. Drag-to-waitlist is implemented as a `DELETE` on `(booking_id, pet_id)` with `date >= <day>`.

A new migration `31_create_booking_pet_kennel_override_table.ts` creates the table.

## Frontend

`packages/app/src/pages/employee/KennelLayout.vue` now calls `employee.setBookingPetKennelForDate` with the selected date as part of every drag. `getPetKennels` is unchanged from the client's perspective; it still takes `{ date }` and the server resolves the effective kennel.

## Behavior

- Same booking, no overrides: behaves exactly as before.
- Drag pet X into kennel 7 for day _D_: the pet is in kennel 7 on day _D_ and every subsequent day of the booking that does not have its own override.
- Drag pet X into a different kennel for day _D+5_: that drag replaces the fill-forward from _D+5_ onward.
- Drag pet X to the waitlist for day _D_: any overrides for pet X on `date >= D` are removed; the pet's effective kennel from _D_ onward falls back to the booking base.
- Editing a booking (changing the pet list) clears all overrides for that booking in the same transaction as the existing `booking_pet_kennel` clear.

## Storage

Row count is bounded by the number of explicit drags per booking, not the booking length.

## Verification

`packages/api/tests/e2e/kennelLayout.spec.ts` adds a case that drags a booking pet into a kennel for day _A_, drags the same pet into a different kennel for day _B_, switches back to day _A_, and asserts the day-_A_ layout is unchanged. `pnpm run test:e2e` passes 40 / 40.

![Kennel layout drag and drop](/screenshots/employee-kennellayout.png)

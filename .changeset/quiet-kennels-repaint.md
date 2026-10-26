---
'@petboarding/api': patch
---

fix: drag-to-waitlist on the kennel layout (employee + print) now persists across a fresh server read

When a pet was dragged from a kennel back to the waitlist on `/employee/kennellayout/:date`, the optimistic UI hid the pet locally, but a fresh server read — the print route `/print/kennellayout/:date`, an F5, or any later load — put the pet back in its original kennel. Pet-2 used to live in its default kennel until you moved it; after cancelling the move, it reappeared.

Two cooperating bugs in `packages/api/src/repositories/kennel.ts`:

- The CASE resolver picked `WHEN override.kennelId IS NOT NULL THEN ... ELSE booking_pet_kennel.kennel_id`, which cannot distinguish "no override row found" from "override row found with `kennelId = NULL`" — both fell through to the booking's default kennel.
- `clearForwardBookingPetKennelOverrides` deleted forward override rows only and never wrote a NULL sentinel, so the drag-to-waitlist mutation was a no-op on disk for pets whose kennel came from `bookingPetKennel`.

Fix:

- The lateral `getBookingPetKennels` select now also returns `bpk_o.bookingId as has_override` so the resolver can tell "row found" from "row not found".
- The CASE rewires to `WHEN override.has_override IS NOT NULL THEN override.kennel_id` (NULL allowed = pet is on the waitlist for that day) `ELSE booking_pet_kennel.kennel_id`.
- `clearForwardBookingPetKennelOverrides` now writes a NULL sentinel via UPSERT on `(bookingId, petId, fromDate)`, wrapped in a transaction so the DELETE and INSERT stay atomic.

Adds regression coverage in `packages/api/tests/e2e/kennelLayout.spec.ts` ("should keep pet on waitlist across a print-route server read after drag-to-waitlist") and one kennel assignment to booking-2/pet-2 in `packages/api/src/kysely/seeds/test.ts` so the e2e can actually provoke the bug. Daycare pets (`getDaycareDatePetKennels`) are unchanged.

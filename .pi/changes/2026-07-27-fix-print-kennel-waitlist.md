# Changes: fix drag-to-waitlist on print kennel layout (2026-07-27)

## Root cause

`packages/api/src/repositories/kennel.ts` had two cooperating bugs that together made drag-to-waitlist
appear to work locally but vanish on any fresh server read (e.g. the print route, any F5):

- The CASE resolver read `WHEN override.kennelId IS NOT NULL THEN override.kennel_id ELSE booking_pet_kennel.kennel_id`,
  which can't distinguish "no override row found" from "override row found with kennelId = NULL" — both fall
  through to the booking's default kennel.
- `clearForwardBookingPetKennelOverrides` only deleted forward override rows and never wrote a NULL sentinel,
  so when a pet's kennel came from `bookingPetKennel` (not from an override) the drag-to-waitlist mutation
  was a no-op on disk.

The locally optimistic UI in `packages/app/src/pages/employee/KennelLayout.vue` makes the drag _appear_ to
succeed on the employee view, but `packages/app/src/pages/print/KennelLayout.vue` re-fetches fresh data and
the pet reappears in its original kennel — exactly what the user reported.

## New files

none

## Modified files (all hunks accepted)

| File                                          | Lines                       | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/api/src/repositories/kennel.ts`     | 163-167 + 232-238 + 340-367 | Read-side: lateral select adds `bpk_o.bookingId as has_override` so we can tell "row found vs row not found"; CASE rewires to `WHEN override.has_override IS NOT NULL THEN override.kennel_id` (NULL allowed = waitlist) `ELSE booking_pet_kennel.kennel_id`. Write-side: `clearForwardBookingPetKennelOverrides` is now a transaction that deletes forward overrides as before AND UPSERTs a `(bookingId, petId, date, kennelId = NULL)` sentinel row, so the read path picks up explicit waitlist state. |
| `packages/api/src/kysely/seeds/test.ts`       | 74-89                       | Adds one kennel assignment to booking-2/pet-2 so the e2e regression can actually provoke the original bug (every existing seeded booking has NULL `bookingPetKennel.kennelId`; the bug requires at least one non-NULL fallback).                                                                                                                                                                                                                                                                           |
| `packages/api/tests/e2e/kennelLayout.spec.ts` | 98-157                      | New playwright test `'should keep pet on waitlist across a print-route server read after drag-to-waitlist'` placed before the existing kennel→waitlist test so pet 2 still starts in kennel 1: drags pet 2 from kennel 1 to `#waitlist`, navigates to `/print/kennellayout/2024-01-02`, and asserts pet 2 is **not** inside any `#kennel*` (which by construction places pet 2 in the print page's top waitlist row).                                                                                      |

## Verification

| Gate           | Command                                                                    | Result                                                                                                                                                                                           |
| -------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| format         | `pnpm run format:check`                                                    | exit 0                                                                                                                                                                                           |
| lint           | `pnpm run lint`                                                            | exit 0 (pre-existing warnings only)                                                                                                                                                              |
| build          | `pnpm run build` (tools → app → api)                                       | exit 0                                                                                                                                                                                           |
| vitest         | `cd packages/api && pnpm run test` (with the env-var set the runner needs) | `Test Files 2 passed (2); Tests 66 passed (66)` — same as baseline                                                                                                                               |
| playwright e2e | `cd packages/api && pnpm run test:e2e`                                     | **NOT RUN IN THIS SANDBOX** — requires `SIMSUSTECH_NPM_TOKEN` + live `docker-compose.test.yaml` stack. User must run it in the proper environment to confirm the red→green flip on the new test. |

## Edge cases the design covers

- Drag to waitlist from a booking-default kennel (the original bug).
- Drag to waitlist from a per-day override kennel (delete-forward + NULL sentinel coexist).
- Drag to waitlist and then later drag to a different kennel on a later day (override-after-sentinel correctly resumes per-day semantics on the later date).
- Drag to waitlist on the same date twice (UPSERT replaces the row, idempotent).
- Daycare pets (`getDaycareDatePetKennels`) untouched.

See `~/.pi/plans/2026-07-26-fix-print-kennel-waitlist.evaluation.md` for the full
implement-run log and process-improvement recommendations written by the implement step.

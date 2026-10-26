# ADR 001: customers never edit a pet's category or comments

- Status: accepted
- Date: 2026-09-24
- Context: frontend screenshot audit of 2026-09-23 and the `pet` form/dialog review
  (`packages/app/src/components/pet/PetForm.vue`, account and employee pet pages)

## Context

`PetForm` exposes category and comments through `use-category` / `use-comments` flags.
Employees need both: the category decides the price a booking is billed at, and comments
are internal notes staff write about a pet. The account-side (customer) pet dialogs do not
pass those flags, and the customer pet card does not render comments.

During the audit this asymmetry read as an inconsistency — the employee dialog shows
`Category*` and `Comments` where the customer dialog shows neither — and "fixing" it by
parity was the obvious-looking change.

## Decision

**Customers may never edit a pet's category and never see comments.** The asymmetry is
the design:

- the category is pricing configuration owned by the business; letting a customer pick one
  would let them choose their own rate, and categories carry ordering/availability rules
  the customer cannot see;
- comments are internal staff notes about the pet and its owners — passing them to the
  customer-facing card would leak internal observations by design, not by bug.

## Consequences

- The account pet dialog/card stay without `use-category` / `use-comments`.
- `packages/api/tests/e2e/frontend/dialogs.spec.ts` asserts the **absence** of
  `Category*` and `Comments` in the customer dialog (and their presence in the employee
  dialog as a positive control), so a well-meaning parity change fails the suite first.
- New pet-facing fields default to employee-only unless explicitly decided otherwise in
  a successor ADR.
- The glossary entry lives in `CONTEXT.md` under "Pet category and comments are
  staff-only".

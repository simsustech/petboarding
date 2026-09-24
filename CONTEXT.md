# CONTEXT — petboarding app

Short glossary so a change here stays consistent with decisions already made. Each entry
records a rule and the audit that produced it (frontend screenshot audit of
2026-09-23, artifacts in `packages/api/test-results/frontend-audit/`).

## Pet category and comments are staff-only

**Customers may never edit a pet's category and never see pet comments.** Both belong to
the employee/administrator side:

- category drives pricing (it selects the category price for a booking) and is managed
  under `/admin/configuration/categories`;
- comments are internal staff notes (`use-comments` on employee dialogs and cards only),
  surfaced to employees on the customer/pet cards since
  `feat(app): show internal comments on employee customer card`.

Concretely: the account-side pet dialogs/cards do **not** pass `use-category` or
`use-comments`, and `packages/api/tests/e2e/frontend/dialogs.spec.ts` asserts their
**absence** in the customer dialog — a future "parity" change that hands these fields to
customers fails that guard first. Employees keep both (same spec, positive control).

## The mono/overline label style is intentional

Dates, ids and status lines rendered in a monospace-looking face are Quasar's
`q-item-label overline` (MD3 overline/caption treatment) — a deliberate design token, not
a missing font. The screenshot audit initially flagged it as a typography bug; the
decision after review is that it stays. Do not "fix" it to a body font.

## Employee list pages are search-first

`/employee/customers` and `/employee/pets` are search-only until something is selected:
they show a search field (with a hint: "Type to search …") and, while nothing is chosen,
say what selecting something will show (`lang.listPages.*`). Empty space with no
explanation was the audit finding; the search-first shape is the accepted answer, not a
defect to fill with default content.

## Related

- `docs/adr/001-customers-never-edit-category-or-comments.md` — why the first rule is an
  architectural constraint rather than a UI preference.

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

## Search prefix-matches from two characters

Employee customer/pet search runs Postgres full-text search over an `unaccented` vector:
terms are stopword-filtered and AND-joined, and **every** term prefix-matches (`:*`). The
old min-4 gate is gone, so `Jan` finds `Jansen`. Both tRPC procedures require at least two
characters, so a one-character prefix never reaches the database; results are ordered
deterministically (`last_name, first_name` / pet `name`).

*Avoid*: "minimum 4 characters", "exact match for short terms" — both name the removed
behaviour.

## Quasar and preset overrides live upstream, not in the app

**A defect in Quasar or in `unocss-preset-quasar` is fixed there, with a changeset; the app
keeps only what is app policy.** Restating a shared rule locally (`!important` z-index
bumps, `:deep(.q-*)` overrides) duplicates it and forces the next one — the header→dialog
z-index chain is the proof, and two byte-identical rule pairs in six files are the same
shape. A new Quasar conflict is a hole in the preset's scale, not a local patch. The
overrides that stay are enumerated with their reasons in
`docs/adr/002-no-quasar-overrides-in-the-app.md`.

## Related

- `docs/adr/001-customers-never-edit-category-or-comments.md` — why the first rule is an
  architectural constraint rather than a UI preference.
- `docs/adr/002-no-quasar-overrides-in-the-app.md` — why a Quasar or preset defect is
  fixed upstream with a changeset rather than re-stated in the app.
- `docs/adr/003-remove-min-4-search-gate.md` — why short search terms prefix-match from
  two characters (the 2024 min-4 gate is removed).

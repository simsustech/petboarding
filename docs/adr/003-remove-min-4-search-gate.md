# ADR 003: drop the min-4 search prefix gate

- Status: accepted
- Date: 2026-10-01
- Context: `buildSearchTsQuery` in `packages/api/src/repositories/search.ts`, commit
  `2c6c58aab` (2024-05-08), the customer/pet search rework (`ed3c1f2f6`)

## Context

Employee customer and pet search is Postgres full-text search over an `unaccented`
tsvector. Each surviving term is turned into a tsquery term, and a term of **four or more
characters** got prefix matching (`term:*`) while shorter terms matched **exactly**
(`term`). So `jan` did not find `Jansen` — you had to type four characters.

That threshold came from commit `2c6c58aab`, *"fix: only find exact matches with search
terms up to three characters (fixes #2)"*. At the time the query was built as a **disabled
OR** — `terms.map(t => t + ':*').join(' | ')` — so a short term like `ja:*` matched every
row containing any token starting with `ja`, and a one- or two-character query returned
most of the table. Capping short terms at exact match was the workaround.

The query has since changed shape (`ed3c1f2f6`): terms are now **AND-joined**, **stopwords
are dropped** (`van`, `de`, `het`, `een`, `the`, `le`, …), and the index **folds accents**.
Under AND, a short term can only ever *narrow* the result set — the widening that issue #2
was about cannot occur, because a match now requires every other term too.

## Decision

**Drop the length gate: every surviving term gets prefix matching (`:*`), and the minimum
query length becomes two characters at the API.**

- `buildSearchTsQuery` appends `:*` unconditionally.
- Both tRPC procedures require `searchPhrase.length > 1` (`customers.ts` already did;
  `trpc/employee/pets.ts` is raised from "any non-empty input" to match), so a
  one-character query never reaches the database. Worst case is a two-character prefix.
- Search results get a deterministic `ORDER BY` (`last_name, first_name` for customers,
  `name` for pets) — previously the union of the two CTEs was unordered, so a short query
  returned rows in an arbitrary order.

### Why not

- **Keep the gate at four characters** — it reproduces the complaint that motivated this
  change: a person typing a real short name (`Jan`, `Ans`, `Bram`) gets no match until the
  fourth keystroke.
- **Keep exact matching for one- or two-character terms only** — reintroduces the same
  cliff one notch lower, and the AND join already bounds the result set, so the guard has
  nothing left to guard.
- **Rely on the query alone with no API floor** — a one-character prefix (`a:*`) matches
  every token starting with `a`; the floor is what keeps that off the database.

## Consequences

- `Jan` now finds `Jansen`, and every short term prefix-matches.
- The result set for a short query is larger by design; search still returns **all**
  matches (there is no `LIMIT`), which a future change may want to cap.
- The two API floors now agree on `> 1`, so the behaviour no longer depends on which
  entity you search.
- `packages/api/src/repositories/search.test.ts` guards both directions: a short prefix
  finds the surname, and a 3-character prefix still does not return everything.

## Related

- `docs/adr/001-customers-never-edit-category-or-comments.md`
- `docs/adr/002-no-quasar-overrides-in-the-app.md`

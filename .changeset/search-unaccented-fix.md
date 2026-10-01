---
'@petboarding/api': patch
---

fix: fold accents and ignore stopwords in customer/pet full-text search

Two defects in the employee customer/pet search:

- **Accents were not folded** — searching `Madel` never found `Mädel`, and typing the accented form (`Mädel`) was stripped to `Mdel` before it reached the database. Both directions now match via the `unaccent` dictionary.
- **Articles/particles were match criteria** — `van`, `de`, `het`, `een`, … were indexed as ordinary lexemes and the terms were OR-joined, so `van Huppeldepup` returned everyone whose name contained `van`. Stopwords are now dropped in the query builder and the remaining terms are AND-joined.

The index moves from a stored `english`-stemmed `fulltext` tsvector column to a language-neutral `unaccented` configuration (stock `simple` + `unaccent`) behind functional GIN indexes (`customers_search_idx`, `pets_search_idx`). No stemmer is used — appropriate for proper nouns — and the shared query builder lives in `repositories/search.ts`. Existing databases need the one-off SQL in `MIGRATION.md`.

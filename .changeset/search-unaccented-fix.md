---
'@petboarding/api': patch
---

fix: fold accents and ignore stopwords in customer/pet full-text search

Two defects in the employee customer/pet search:

- **Accents were not folded** — searching `Madel` never found `Mädel`, and typing the accented form (`Mädel`) was stripped to `Mdel` before it reached the database. Both directions now match via the `unaccent` dictionary.
- **Articles/particles were match criteria** — `van`, `de`, `het`, `een`, … were indexed as ordinary lexemes and the terms were OR-joined, so `van Huppeldepup` returned everyone whose name contained `van`. Stopwords are now dropped in the query builder and the remaining terms are AND-joined.

The index moves from a stored `english`-stemmed `fulltext` tsvector column to a language-neutral `unaccented` configuration (stock `simple` + `unaccent`) behind functional GIN indexes (`customers_search_idx`, `pets_search_idx`). No stemmer is used — appropriate for proper nouns — and the shared query builder lives in `repositories/search.ts`.

Migrations 07 and 10 are already applied on an existing database, so editing them only reaches a fresh one. An existing deployment needs this, in order:

1. Search configuration — additive, needs a role that may create extensions:

   ```sql
   CREATE EXTENSION IF NOT EXISTS unaccent;

   CREATE TEXT SEARCH CONFIGURATION unaccented (copy = pg_catalog.simple);
   ALTER TEXT SEARCH CONFIGURATION unaccented
     ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
     WITH unaccent, simple;
   ```

2. Functional GIN indexes — additive and non-blocking. `CREATE INDEX CONCURRENTLY` cannot run inside a transaction, so run each statement on its own:

   ```sql
   CREATE INDEX CONCURRENTLY customers_search_idx ON customers USING GIN (
     to_tsvector('unaccented',
       coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' ||
       coalesce(city, '') || ' ' || coalesce(address, ''))
   );

   CREATE INDEX CONCURRENTLY pets_search_idx ON pets USING GIN (
     to_tsvector('unaccented',
       coalesce(name, '') || ' ' || coalesce(breed, '') || ' ' ||
       coalesce(chip_number, '') || ' ' || coalesce(color, ''))
   );
   ```

   A cancelled `CREATE INDEX CONCURRENTLY` leaves an **invalid** index; check `pg_index.indisvalid` before continuing, and `DROP INDEX CONCURRENTLY` + re-run if it is false.

3. Deploy this code. The query errors with `text search configuration "unaccented" does not exist` until step 1 is done, so do not deploy before it.

4. Drop the old stored column — metadata-only, instant — which also drops `customers_fulltext_idx` / `pets_fulltext_idx`:

   ```sql
   ALTER TABLE customers DROP COLUMN IF EXISTS fulltext;
   ALTER TABLE pets      DROP COLUMN IF EXISTS fulltext;
   ```

Rollback rebuilds the column (a table rewrite) and is therefore the expensive path; the forward change is deliberately not.

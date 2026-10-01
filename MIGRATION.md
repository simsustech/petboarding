# 2026-10-01 — language-neutral customer/pet search

Production migration for the customer/pet full-text search fix. Companion to the
edits made in `packages/api/src/kysely/migrations/07_create_customers_table.ts`
and `10_create_pets_table.ts`.

Those two migrations are **already applied** on production, so editing them changes
only *fresh* databases — a running server is skipped (Kysely records applied
migrations in `kysely_migration`, and `npm start` runs `migrate:latest` on boot).
This is the SQL to run **once on an existing production database** to reach the
same end state.

## What it fixes

| aspect | before | after |
| --- | --- | --- |
| search config | `english` (stems + English stopwords only) | `unaccented` = stock `simple` + stock `unaccent` (folds accents, no stemming, no stopwords) |
| indexed vector | `STORED` generated column `fulltext` | functional GIN index (`customers_search_idx` / `pets_search_idx`) |
| particle matching | Dutch articles (`van`, `de`, `het`, `een`) indexed as lexemes → `van Huppeldepup` matched everyone with `van` | stopwords dropped in the query builder, terms `&`-joined |
| accent matching | `Madel` did not find `Mädel` | accents folded by `unaccent` |

Replacing the stored column with a functional index lets the vector change
**without a table rewrite / `ACCESS EXCLUSIVE` lock**.

## Preconditions

- `CREATE EXTENSION unaccent` needs a role with the right privilege. Dev/test (the
  `postgres` image) are fine; a managed or unprivileged production needs a DBA to
  enable `unaccent` first, or step 1 fails and the deploy must wait.
- Run step 2 **outside a transaction** — `CREATE INDEX CONCURRENTLY` cannot run
  inside one. In `psql`, paste each statement on its own; do not wrap in `BEGIN`.

## Ordering (zero-downtime)

Steps 1–2 are purely additive, so the **old** code keeps working while they run.
Deploy the new application code (step 3) only after they succeed, then drop the old
column (step 4).

### 1. Search configuration (additive, fast)

```sql
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE TEXT SEARCH CONFIGURATION unaccented (copy = pg_catalog.simple);
ALTER TEXT SEARCH CONFIGURATION unaccented
  ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
  WITH unaccent, simple;
```

### 2. Functional GIN indexes (additive; non-blocking, run each on its own)

```sql
CREATE INDEX CONCURRENTLY customers_search_idx ON customers USING GIN (
  to_tsvector('unaccented',
    coalesce(first_name, '') || ' ' ||
    coalesce(last_name, '') || ' ' ||
    coalesce(city, '') || ' ' ||
    coalesce(address, ''))
);
```

```sql
CREATE INDEX CONCURRENTLY pets_search_idx ON pets USING GIN (
  to_tsvector('unaccented',
    coalesce(name, '') || ' ' ||
    coalesce(breed, '') || ' ' ||
    coalesce(chip_number, '') || ' ' ||
    coalesce(color, ''))
);
```

A cancelled `CREATE INDEX CONCURRENTLY` leaves an **invalid** index. Check and retry
before continuing:

```sql
SELECT c.relname, i.indisvalid
FROM pg_index i JOIN pg_class c ON c.oid = i.indexrelid
WHERE c.relname IN ('customers_search_idx', 'pets_search_idx');
```

If `indisvalid` is false: `DROP INDEX CONCURRENTLY <name>;` and re-run that statement.

### 3. Deploy the new application code

The repository now queries `to_tsvector('unaccented', …) @@ to_tsquery('unaccented', …)`
(see `packages/api/src/repositories/search.ts`). Until step 1 is done the query errors
with `text search configuration "unaccented" does not exist`, so do **not** deploy
before step 1.

### 4. Drop the old stored column (metadata-only, instant)

```sql
ALTER TABLE customers DROP COLUMN IF EXISTS fulltext;
ALTER TABLE pets      DROP COLUMN IF EXISTS fulltext;
```

This also drops the old `customers_fulltext_idx` / `pets_fulltext_idx` indexes.

## Verification

```sql
-- accent folding, both directions
SELECT to_tsvector('unaccented', 'Mädel') @@ to_tsquery('unaccented', 'Madel');  -- t

-- the query shape matches the index (enable_seqscan=off needed on small tables)
SET enable_seqscan = off;
EXPLAIN (COSTS OFF)
SELECT c.id FROM customers c
WHERE to_tsvector('unaccented',
        coalesce(c.first_name, '') || ' ' || coalesce(c.last_name, '') || ' ' ||
        coalesce(c.city, '') || ' ' || coalesce(c.address, ''))
      @@ to_tsquery('unaccented', 'Huppeldepup:*');
-- expect: Bitmap Heap Scan ... Index Scan using customers_search_idx
```

## Rollback

```sql
DROP INDEX CONCURRENTLY IF EXISTS customers_search_idx;
DROP INDEX CONCURRENTLY IF EXISTS pets_search_idx;

ALTER TABLE customers ADD COLUMN fulltext tsvector
  GENERATED ALWAYS AS (to_tsvector('english',
    coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' ||
    coalesce(city, '') || ' ' || coalesce(address, ''))) STORED;
CREATE INDEX customers_fulltext_idx ON customers USING GIN (fulltext);
-- (same shape for pets; this DOES rewrite the table)

DROP TEXT SEARCH CONFIGURATION unaccented;
-- DROP EXTENSION unaccent;  -- only if nothing else uses it
```

Rollback rebuilds the column, so it is the expensive path — the forward change is
deliberately not.

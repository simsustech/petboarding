import { sql } from 'kysely'
import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('customers')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('rating', 'integer')
    .addColumn('gender', 'varchar', (col) => col.notNull())
    .addColumn('first_name', 'varchar', (col) => col.notNull())
    .addColumn('last_name', 'varchar', (col) => col.notNull())
    .addColumn('address', 'varchar', (col) => col.notNull())
    .addColumn('postal_code', 'varchar', (col) => col.notNull())
    .addColumn('city', 'varchar', (col) => col.notNull())
    .addColumn('telephone_number', 'varchar', (col) => col.notNull())
    .addColumn('veterinarian', 'varchar', (col) => col.notNull())
    .addColumn('account_id', 'integer', (col) =>
      col.references('accounts.id').unique().onDelete('set null')
    )
    .addColumn('comments', 'text')
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()

  // Language-neutral search: `unaccented` = the stock `simple` parser plus the
  // `unaccent` dictionary. It folds accents but does not stem or drop stopwords
  // — the query layer owns those (see src/repositories/search.ts).
  await sql`
    CREATE EXTENSION IF NOT EXISTS unaccent;
    CREATE TEXT SEARCH CONFIGURATION unaccented (copy = pg_catalog.simple);
    ALTER TEXT SEARCH CONFIGURATION unaccented
      ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
      WITH unaccent, simple;
  `.execute(db)

  // Functional GIN index (not a STORED generated column) so the vector can change
  // without a table rewrite. MUST stay in sync with customerSearchVector() in
  // src/repositories/search.ts or Postgres will not use it.
  await sql`
    CREATE INDEX customers_search_idx ON customers USING GIN (
      to_tsvector('unaccented',
        coalesce(first_name, '') || ' ' ||
        coalesce(last_name, '') || ' ' ||
        coalesce(city, '') || ' ' ||
        coalesce(address, ''))
    );
  `.execute(db)
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('customers').execute()
}

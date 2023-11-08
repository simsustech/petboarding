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

  await sql`ALTER TABLE customers
    ADD COLUMN fulltext tsvector
      GENERATED ALWAYS AS 
      (to_tsvector('english', 
      coalesce(first_name, '') || ' ' || 
      coalesce(last_name, '') || ' ' ||
      coalesce(city, '' || ' ' ||
      coalesce(address, '') || ' '))) STORED;
  CREATE INDEX customers_fulltext_idx ON customers USING GIN (fulltext);`.execute(
    db
  )
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('customers').execute()
}

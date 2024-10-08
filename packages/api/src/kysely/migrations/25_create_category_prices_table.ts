import { sql } from 'kysely'
import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('category_prices')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('category_id', 'integer', (col) =>
      col.references('categories.id').notNull().onDelete('cascade')
    )
    .addColumn('date', 'date', (col) => col.notNull())
    .addColumn('list_price', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('category_prices').execute()
}

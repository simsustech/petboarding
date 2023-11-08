import { sql } from 'kysely'
import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('services')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('description', 'varchar')
    .addColumn('list_price', 'integer')
    .addColumn('type', 'varchar', (col) => col.notNull())
    .addColumn('hidden', 'boolean', (col) => col.defaultTo(false))
    .addColumn('disabled', 'boolean', (col) => col.defaultTo(false))

    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('services').execute()
}

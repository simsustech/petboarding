import { sql } from 'kysely'
import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('periods')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('start_date', 'date', (col) => col.notNull())
    .addColumn('end_date', 'date', (col) => col.notNull())
    .addColumn('type', 'varchar', (col) => col.notNull())
    .addColumn('comments', 'text')
    .addColumn('minimum_rating_for_exception', 'integer', (col) =>
      col.defaultTo(0)
    )
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('periods').execute()
}

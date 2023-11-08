import { sql } from 'kysely'
import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('kennels')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('building_id', 'integer', (col) =>
      col.references('buildings.id')
    )
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('description', 'varchar')
    .addColumn('capacity', 'integer')

    .addColumn('order', 'integer')
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('kennels').execute()
}

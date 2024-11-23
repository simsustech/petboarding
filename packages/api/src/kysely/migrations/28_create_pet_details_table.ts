import { sql } from 'kysely'
import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('pet_details')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('pet_id', 'integer', (col) =>
      col.references('pets.id').notNull().onDelete('cascade')
    )
    .addColumn('type', 'varchar', (col) => col.notNull())
    .addColumn('start_date', 'date')
    .addColumn('end_date', 'date')
    .addColumn('comment', 'varchar')

    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('pet_details').execute()
}

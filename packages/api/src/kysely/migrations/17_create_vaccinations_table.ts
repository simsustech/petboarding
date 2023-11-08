import { sql } from 'kysely'
import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('vaccinations')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('image', 'bytea', (col) => col.notNull())
    .addColumn('expiration_date', 'date', (col) => col.notNull())
    .addColumn('types', 'json', (col) => col.defaultTo('[]'))
    .addColumn('pet_id', 'integer', (col) =>
      col.references('pets.id').onDelete('cascade')
    )
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('vaccinations').execute()
}

import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('pet_alerts')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('pet_id', 'integer', (col) =>
      col.references('pets.id').onDelete('cascade').notNull()
    )
    .addColumn('condition', 'varchar', (col) => col.notNull())
    .addColumn('start_date', 'date')
    .addColumn('end_date', 'date')
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('pet_alerts').execute()
}

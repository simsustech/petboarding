import { sql } from 'kysely'
import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('booking_status')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('booking_id', 'integer', (col) =>
      col.references('bookings.id').onDelete('cascade').notNull()
    )
    .addColumn('status', 'varchar', (col) => col.notNull())
    .addColumn('modified_at', 'timestamptz', (col) => col.notNull())
    .addColumn('pet_ids', 'json', (col) => col.defaultTo('[]'))
    .addColumn('start_date', 'date', (col) => col.notNull())
    .addColumn('end_date', 'date', (col) => col.notNull())
    .addColumn('start_time_id', 'integer', (col) =>
      col.references('opening_times.id').onDelete('restrict').notNull()
    )
    .addColumn('end_time_id', 'integer', (col) =>
      col.references('opening_times.id').onDelete('restrict').notNull()
    )
    .addColumn('comments', 'text')
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('booking_status').execute()
}

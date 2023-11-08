import { sql } from 'kysely'
import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('bookings')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('start_date', 'date', (col) => col.notNull())
    .addColumn('end_date', 'date', (col) => col.notNull())
    .addColumn('start_time_id', 'integer', (col) =>
      col.references('opening_times.id').onDelete('restrict')
    )
    .addColumn('end_time_id', 'integer', (col) =>
      col.references('opening_times.id').onDelete('restrict')
    )
    .addColumn('comments', 'text')
    .addColumn('customer_id', 'integer', (col) =>
      col.references('customers.id').onDelete('cascade').notNull()
    )
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('bookings').execute()
}

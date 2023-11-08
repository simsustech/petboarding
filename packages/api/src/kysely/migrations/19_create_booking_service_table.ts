import { sql } from 'kysely'
import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('booking_service')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('booking_id', 'integer', (col) =>
      col.references('bookings.id').onDelete('cascade').notNull()
    )
    .addColumn('service_id', 'integer', (col) =>
      col.references('services.id').onDelete('cascade').notNull()
    )
    .addColumn('comments', 'text')
    .addColumn('price', 'integer')
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('booking_service').execute()
}

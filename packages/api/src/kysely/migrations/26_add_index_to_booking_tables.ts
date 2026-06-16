import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createIndex('bookings_start_date_end_date_index')
    .on('bookings')
    .columns(['start_date', 'end_date'])
    .execute()

  await db.schema
    .createIndex('bookings_invoice_uuid_index')
    .on('bookings')
    .column('invoice_uuid')
    .execute()

  await db.schema
    .createIndex('booking_status_start_date_end_date_status_index')
    .on('booking_status')
    .columns(['start_date', 'end_date', 'status'])
    .execute()

  await db.schema
    .createIndex('booking_status_booking_id_modified_at_status_index')
    .on('booking_status')
    .columns(['booking_id', 'modified_at', 'status'])
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex('bookings_start_date_end_date_index').execute()

  await db.schema.dropIndex('bookings_invoice_uuid_index').execute()

  await db.schema
    .dropIndex('booking_status_start_date_end_date_status_index')
    .execute()

  await db.schema
    .dropIndex('booking_status_booking_id_modified_at_status_index')
    .execute()
}

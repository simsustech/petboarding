import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('booking_pet_kennel_override')
    .addColumn('booking_id', 'integer', (col) =>
      col.references('bookings.id').notNull().onDelete('cascade')
    )
    .addColumn('pet_id', 'integer', (col) =>
      col.references('pets.id').notNull().onDelete('cascade')
    )
    .addColumn('date', 'date', (col) => col.notNull())
    .addColumn('kennel_id', 'integer', (col) =>
      col.references('kennels.id').onDelete('set null')
    )
    .addPrimaryKeyConstraint('booking_pet_kennel_override_primary_key', [
      'booking_id',
      'pet_id',
      'date'
    ])
    .execute()

  await db.schema
    .createIndex('booking_pet_kennel_override_booking_id_date_index')
    .on('booking_pet_kennel_override')
    .columns(['booking_id', 'date'])
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .dropIndex('booking_pet_kennel_override_booking_id_date_index')
    .execute()

  await db.schema.dropTable('booking_pet_kennel_override').execute()
}

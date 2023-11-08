import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('booking_pet_kennel')
    .addColumn('booking_id', 'integer', (col) =>
      col.references('bookings.id').notNull().onDelete('cascade')
    )
    .addColumn('pet_id', 'integer', (col) =>
      col.references('pets.id').notNull().onDelete('cascade')
    )
    .addColumn('kennel_id', 'integer', (col) =>
      col.references('kennels.id').onDelete('set null')
    )
    .addPrimaryKeyConstraint('booking_pet_kennel_primary_key', [
      'booking_id',
      'pet_id'
    ])
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('booking_pet_kennel').execute()
}

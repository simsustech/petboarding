import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('daycare_date_pet_kennel')
    .addColumn('daycare_date_id', 'integer', (col) =>
      col.references('daycare_dates.id').onDelete('cascade').notNull()
    )
    .addColumn('pet_id', 'integer', (col) =>
      col.references('pets.id').onDelete('cascade').notNull()
    )
    .addColumn('kennel_id', 'integer', (col) =>
      col.references('kennels.id').onDelete('set null')
    )
    .addPrimaryKeyConstraint('daycare_date_pet_kennel_primary', [
      'daycare_date_id',
      'pet_id'
    ])
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('daycare_date_pet_kennel').execute()
}

import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('pet_relations')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('pet_id1', 'integer', (col) =>
      col.references('pets.id').onDelete('cascade').notNull()
    )
    .addColumn('pet_id2', 'integer', (col) =>
      col.references('pets.id').onDelete('cascade').notNull()
    )
    .addColumn('rating', 'integer', (col) => col.notNull())
    .addColumn('comment', 'varchar')
    .addUniqueConstraint('pet_relations_unique_pet_pair', [
      'pet_id1',
      'pet_id2'
    ])
    .addCheckConstraint('pet_relations_different_pets', sql`pet_id1 != pet_id2`)
    .addCheckConstraint('pet_relations_pair_order', sql`pet_id1 < pet_id2`)
    .addCheckConstraint(
      'pet_relations_rating_range',
      sql`rating >= 1 AND rating <= 10`
    )
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('pet_relations').execute()
}

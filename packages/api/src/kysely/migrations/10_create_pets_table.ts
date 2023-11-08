import { sql } from 'kysely'
import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('pets')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('species', 'varchar', (col) => col.notNull())
    .addColumn('rating', 'integer', (col) => col.defaultTo(0))
    .addColumn('image', 'bytea')
    .addColumn('chip_number', 'varchar')
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('breed', 'varchar', (col) => col.notNull())
    .addColumn('gender', 'varchar', (col) => col.notNull())
    .addColumn('sterilized', 'boolean', (col) => col.notNull())
    .addColumn('birth_date', 'date', (col) => col.notNull())
    .addColumn('chemical_sterilization_date', 'date')
    .addColumn('color', 'varchar')
    .addColumn('medicines', 'varchar')
    .addColumn('food', 'varchar')
    .addColumn('weight', 'varchar')
    .addColumn('deceased', 'boolean', (col) => col.defaultTo(false))
    .addColumn('particularities', 'text')
    .addColumn('comments', 'text')
    .addColumn('customer_id', 'integer', (col) =>
      col.references('customers.id').notNull().onDelete('cascade')
    )
    .addColumn('category_id', 'integer', (col) =>
      col.references('categories.id').onDelete('set null')
    )
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()

  await sql`
    ALTER TABLE pets
      ADD COLUMN fulltext tsvector
        GENERATED ALWAYS AS 
        (to_tsvector('english', 
        coalesce(name, '') || ' ' || 
        coalesce(breed, '') || ' ' ||
        coalesce(chip_number, '' || ' ' ||
        coalesce(color, '') || ' '))) STORED;
    CREATE INDEX pets_fulltext_idx ON pets USING GIN (fulltext);`.execute(db)
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('pets').execute()
}

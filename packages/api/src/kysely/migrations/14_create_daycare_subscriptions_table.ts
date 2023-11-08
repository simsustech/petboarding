import { sql } from 'kysely'
import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('daycare_subscriptions')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('period', 'varchar')
    .addColumn('amount', 'integer', (col) => col.notNull())
    .addColumn('product_id', 'integer')
    .addColumn('customer_id', 'integer', (col) =>
      col.references('customers.id').onDelete('cascade')
    )

    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('daycare_subscriptions').execute()
}

import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('customer_daycare_subscriptions')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('effective_date', 'date', (col) => col.notNull())
    .addColumn('expiration_date', 'date', (col) => col.notNull())
    .addColumn('status', 'varchar', (col) => col.notNull())
    .addColumn('invoice_uuid', 'varchar')
    .addColumn('daycare_subscription_id', 'integer', (col) =>
      col.references('daycare_subscriptions.id').onDelete('set null').notNull()
    )
    .addColumn('customer_id', 'integer', (col) =>
      col.references('customers.id').onDelete('cascade').notNull()
    )
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('customer_daycare_subscriptions').execute()
}

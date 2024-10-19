import { sql } from 'kysely'
import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('daycare_dates')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('date', 'date', (col) => col.notNull())
    .addColumn('comments', 'text')
    .addColumn('status', 'varchar', (col) => col.notNull())
    .addColumn('customer_id', 'integer', (col) =>
      col.references('customers.id').onDelete('cascade').notNull()
    )
    // Changed
    .addColumn('daycare_subscription_id', 'integer', (col) =>
      col.references('daycare_subscriptions.id').onDelete('set null')
    )

    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addUniqueConstraint('daycare_date_unique', [
      'customer_id',
      'date',
      'daycare_subscription_id'
    ])
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('daycare_dates').execute()
}

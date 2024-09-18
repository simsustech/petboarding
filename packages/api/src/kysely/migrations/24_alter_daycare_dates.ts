import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable('daycare_dates')
    .dropColumn('daycare_subscription_id')
    .addColumn('customer_daycare_subscription_id', 'integer', (col) =>
      col.references('customer_daycare_subscriptions.id').onDelete('cascade')
    )
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable('daycare_dates')
    .addColumn('daycare_subscription_id', 'integer', (col) =>
      col.references('daycare_subscriptions.id').onDelete('set null')
    )
    .dropColumn('customer_daycare_subscription_id')
    .execute()
}

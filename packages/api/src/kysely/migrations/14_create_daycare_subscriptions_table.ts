import { sql } from 'kysely'
import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('daycare_subscriptions')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('description', 'varchar', (col) => col.notNull())
    .addColumn('number_of_days', 'integer', (col) => col.notNull())
    .addColumn('validity_period', 'json', (col) =>
      col.defaultTo('{ "years": 1, "months": 0, "days": 0 }')
    )
    .addColumn('list_price', 'integer', (col) => col.notNull())

    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('daycare_subscriptions').execute()
}

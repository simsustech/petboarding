import { sql } from 'kysely'
import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('opening_times')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('start_day_counted', 'decimal(2, 1)', (col) => col.notNull())
    .addColumn('end_day_counted', 'decimal(2, 1)', (col) => col.notNull())
    .addColumn('days_of_week', 'json', (col) => col.notNull().defaultTo('[]'))
    .addColumn('unavailable_holidays', 'json', (col) =>
      col.notNull().defaultTo('[]')
    )
    .addColumn('start_time', 'time', (col) => col.notNull())
    .addColumn('end_time', 'time', (col) => col.notNull())
    .addColumn('disabled', 'boolean', (col) => col.defaultTo(false))
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('opening_times').execute()
}

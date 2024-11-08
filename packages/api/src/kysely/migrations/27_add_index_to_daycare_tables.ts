import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createIndex('daycare_dates_date_status_index')
    .on('daycare_dates')
    .columns(['date', 'status'])
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex('daycare_dates_date_status_index').execute()
}

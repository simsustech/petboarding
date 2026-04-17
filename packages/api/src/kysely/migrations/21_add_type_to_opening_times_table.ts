import type { Kysely } from 'kysely'
import { OPENING_TIME_TYPE } from '@petboarding/tools/constants'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable('opening_times')
    .addColumn('type', 'varchar', (col) =>
      col.notNull().defaultTo(OPENING_TIME_TYPE.ALL)
    )
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable('opening_times').dropColumn('type').execute()
}

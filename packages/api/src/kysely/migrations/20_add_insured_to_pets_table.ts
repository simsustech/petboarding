import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable('pets').addColumn('insured', 'boolean').execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable('pets').dropColumn('insured').execute()
}

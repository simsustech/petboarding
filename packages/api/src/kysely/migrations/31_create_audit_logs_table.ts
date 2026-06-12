import { sql } from 'kysely'
import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('audit_logs')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('account_id', 'integer', (col) => col.notNull())
    .addColumn('action', 'varchar', (col) => col.notNull())
    .addColumn('resource', 'varchar', (col) => col.notNull())
    .addColumn('resource_id', 'varchar')
    .addColumn('details', 'jsonb')
    .addColumn('ip_address', 'varchar')
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()

  await db.schema
    .createIndex('idx_audit_logs_account_id')
    .on('audit_logs')
    .column('account_id')
    .execute()

  await db.schema
    .createIndex('idx_audit_logs_action')
    .on('audit_logs')
    .column('action')
    .execute()

  await db.schema
    .createIndex('idx_audit_logs_created_at')
    .on('audit_logs')
    .column('created_at')
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('audit_logs').execute()
}

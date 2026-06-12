import { db } from '../kysely/index.js'

export interface AuditLogEntry {
  accountId: number
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, unknown>
  ipAddress?: string
}

export const createAuditLog = async (entry: AuditLogEntry) => {
  await db
    .insertInto('auditLogs')
    .values({
      accountId: entry.accountId,
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId ?? null,
      details: entry.details ? JSON.stringify(entry.details) : null,
      ipAddress: entry.ipAddress ?? null
    })
    .execute()
}

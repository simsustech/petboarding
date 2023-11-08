import { db } from '../kysely/index.js'
import type { EmailTemplates } from '../kysely/types.d.ts'

import type { Insertable, Selectable, Updateable } from 'kysely'
type EmailTemplate = Selectable<EmailTemplates>
type NewEmailTemplate = Insertable<EmailTemplates>
type EmailTemplateUpdate = Updateable<EmailTemplates>

const defaultSelect = [
  'id',
  'name',
  'body',
  'subject'
] as (keyof EmailTemplate)[]

function find({
  criteria,
  select
}: {
  criteria: Partial<EmailTemplate> & { names?: string[] }
  select?: (keyof EmailTemplate)[]
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('emailTemplates')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  if (criteria.name) {
    query = query.where('name', '=', criteria.name)
  }

  if (criteria.names) {
    query = query.where('name', 'in', criteria.names)
  }

  return query.select(select)
}

export async function findEmailTemplate({
  criteria,
  select
}: {
  criteria: Partial<EmailTemplate> & { names?: string[] }
  select?: (keyof EmailTemplate)[]
}) {
  const query = find({ criteria, select })

  return query.executeTakeFirst()
}

export async function findEmailTemplates({
  criteria,
  select
}: {
  criteria: Partial<EmailTemplate> & { names?: string[] }
  select?: (keyof EmailTemplate)[]
}) {
  const query = find({
    criteria,
    select
  })
  return query.execute()
}

export async function createEmailTemplate(emailTemplate: NewEmailTemplate) {
  return db
    .insertInto('emailTemplates')
    .values(emailTemplate)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateEmailTemplate(
  criteria: Partial<EmailTemplate>,
  updateWith: EmailTemplateUpdate
) {
  let query = db.updateTable('emailTemplates')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query.set(updateWith).executeTakeFirstOrThrow()
}

import { db } from '../kysely/index.js'
import type { ContactPeople } from '../kysely/types.d.ts'

import type { Insertable, Selectable, Updateable } from 'kysely'
type ContactPerson = Selectable<ContactPeople>
type NewContactPerson = Insertable<ContactPeople>
type ContactPersonUpdate = Updateable<ContactPeople>

const defaultSelect = [
  'id',
  'firstName',
  'lastName',
  'telephoneNumber'
] as (keyof ContactPerson)[]

function find({
  criteria,
  select
}: {
  criteria: Partial<ContactPerson>
  select?: (keyof ContactPerson)[]
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('contactPeople')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  if (criteria.customerId) {
    query = query.where('customerId', '=', criteria.customerId)
  }

  return query.select(select)
}

export async function findContactPerson({
  criteria,
  select
}: {
  criteria: Partial<ContactPerson>
  select?: (keyof ContactPerson)[]
}) {
  const query = find({ criteria, select })

  return query.executeTakeFirst()
}

export async function findContactPeople({
  criteria,
  select
}: {
  criteria: Partial<ContactPerson>
  select?: (keyof ContactPerson)[]
}) {
  const query = find({
    criteria,
    select
  })
  return query.execute()
}

export async function createContactPerson(contactPerson: NewContactPerson) {
  return db
    .insertInto('contactPeople')
    .values(contactPerson)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateContactPerson(
  criteria: Partial<ContactPerson>,
  updateWith: ContactPersonUpdate
) {
  let query = db.updateTable('contactPeople')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  if (criteria.customerId) {
    query = query.where('customerId', '=', criteria.customerId)
  }
  return query.set(updateWith).executeTakeFirstOrThrow()
}

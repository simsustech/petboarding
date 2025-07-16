import { db } from '../kysely/index.js'
import type { Documents } from '../kysely/types.d.ts'

import type { Insertable, Selectable, Updateable } from 'kysely'
type Document = Selectable<Documents>
type NewDocument = Insertable<Documents>
type DocumentUpdate = Updateable<Documents>

const defaultSelect = ['id', 'name', 'content'] as (keyof Document)[]

function find({
  criteria,
  select
}: {
  criteria: Partial<Document>
  select?: (keyof Document)[]
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('documents')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  if (criteria.name) {
    query = query.where('name', '=', criteria.name)
  }

  return query.select(select)
}

export async function findDocument({
  criteria,
  select
}: {
  criteria: Partial<Document>
  select?: (keyof Document)[]
}) {
  const query = find({ criteria, select })

  return query.executeTakeFirst()
}

export async function findDocuments({
  criteria,
  select
}: {
  criteria: Partial<Document>
  select?: (keyof Document)[]
}) {
  const query = find({
    criteria,
    select
  })
  return query.execute()
}

export async function createDocument(document: NewDocument) {
  return db
    .insertInto('documents')
    .values(document)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateDocument(
  criteria: Partial<Document>,
  updateWith: DocumentUpdate
) {
  let query = db.updateTable('documents')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  if (criteria.name) {
    query = query.where('name', '=', criteria.name)
  }

  return query.set(updateWith).executeTakeFirstOrThrow()
}

export async function deleteDocument(id: number) {
  return db.deleteFrom('documents').where('id', '=', id).executeTakeFirst()
}

import { db } from '../kysely/index.js'
import type { Categories } from '../kysely/types.d.ts'

import type { Insertable, Selectable, Updateable } from 'kysely'
export type Category = Selectable<Categories>
type NewCategory = Insertable<Categories>
type CategoryUpdate = Updateable<Categories>

const defaultSelect = [
  'id',
  'name',
  'order',
  'species',
  'price',
  'productId'
] as (keyof Category)[]

function find({
  criteria,
  select
}: {
  criteria: Partial<Category>
  select?: (keyof Category)[]
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('categories')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query.select(select)
}

export async function findCategory({
  criteria,
  select
}: {
  criteria: Partial<Category>
  select?: (keyof Category)[]
}) {
  const query = find({ criteria, select })

  return query.executeTakeFirst()
}

export async function findCategories({
  criteria,
  select
}: {
  criteria: Partial<Category>
  select?: (keyof Category)[]
}) {
  const query = find({
    criteria,
    select
  })
  return query.execute()
}

export async function createCategory(category: NewCategory) {
  return db
    .insertInto('categories')
    .values(category)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateCategory(
  criteria: Partial<Category>,
  updateWith: CategoryUpdate
) {
  let query = db.updateTable('categories')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query.set(updateWith).executeTakeFirstOrThrow()
}

export async function deleteCategory(id: number) {
  return db.deleteFrom('categories').where('id', '=', id).executeTakeFirst()
}

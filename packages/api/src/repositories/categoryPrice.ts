import { db } from '../kysely/index.js'
import type { CategoryPrices } from '../kysely/types.d.ts'

import type { Insertable, Selectable, Updateable } from 'kysely'
export type CategoryPrice = Selectable<CategoryPrices>
type NewCategoryPrice = Insertable<CategoryPrices>
type CategoryPriceUpdate = Updateable<CategoryPrices>

const defaultSelect = [
  'id',
  'categoryId',
  'date',
  'listPrice'
] as (keyof CategoryPrice)[]

function find({
  criteria,
  select
}: {
  criteria: Partial<CategoryPrice>
  select?: (keyof CategoryPrice)[]
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('categoryPrices')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query.select(select)
}

export async function findCategoryPrice({
  criteria,
  select
}: {
  criteria: Partial<CategoryPrice> & { date?: string }
  select?: (keyof CategoryPrice)[]
}) {
  const query = find({ criteria, select })

  return query.executeTakeFirst()
}

export async function findCategoryPrices({
  criteria,
  select
}: {
  criteria: Partial<CategoryPrice> & { date?: string }
  select?: (keyof CategoryPrice)[]
}) {
  const query = find({
    criteria,
    select
  })
  const result = await query.execute()

  return result
}

export async function createCategoryPrice(categoryPrice: NewCategoryPrice) {
  return db
    .insertInto('categoryPrices')
    .values(categoryPrice)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateCategoryPrice(
  criteria: Partial<CategoryPrice>,
  updateWith: CategoryPriceUpdate
) {
  let query = db.updateTable('categoryPrices')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query.set(updateWith).executeTakeFirstOrThrow()
}

export async function deleteCategoryPrice(id: number) {
  return db.deleteFrom('categoryPrices').where('id', '=', id).executeTakeFirst()
}

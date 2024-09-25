import { jsonArrayFrom } from 'kysely/helpers/postgres'
import { Database, db } from '../kysely/index.js'
import type { Categories } from '../kysely/types.d.ts'

import type {
  ExpressionBuilder,
  Insertable,
  Selectable,
  Updateable
} from 'kysely'
export type Category = Selectable<Categories>
type NewCategory = Insertable<Categories>
type CategoryUpdate = Updateable<Categories>

export interface ParsedCategory extends Category {
  prices?: {
    id: number
    date: string
    listPrice: number
  }[]
}

const defaultSelect = [
  'id',
  'name',
  'order',
  'species'
  // 'price',
] as (keyof Category)[]

function withPrices(eb: ExpressionBuilder<Database, 'categories'>) {
  return jsonArrayFrom(
    eb
      .selectFrom('categoryPrices')
      .whereRef('categoryPrices.categoryId', '=', 'categories.id')
      .select([
        'categoryPrices.id',
        'categoryPrices.date',
        'categoryPrices.listPrice'
      ])
  ).as('prices')
}

function find({
  criteria,
  select
}: {
  criteria: Partial<Category> & { date?: string }
  select?: (keyof Category)[]
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('categories')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query.select(select).select([withPrices])
}

export async function findCategory({
  criteria,
  select
}: {
  criteria: Partial<Category> & { date?: string }
  select?: (keyof Category)[]
}) {
  const query = find({ criteria, select })

  return query.executeTakeFirst()
}

export async function findCategories({
  criteria,
  select
}: {
  criteria: Partial<Category> & { date?: string }
  select?: (keyof Category)[]
}) {
  const query = find({
    criteria,
    select
  })
  const result = await query.execute()

  return result
}

export async function createCategory(category: NewCategory) {
  return db
    .insertInto('categories')
    .values({
      name: category.name,
      species: category.species,
      order: category.order
    })
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

  return query
    .set({
      name: updateWith.name,
      species: updateWith.species,
      order: updateWith.order
    })
    .executeTakeFirstOrThrow()
}

export async function deleteCategory(id: number) {
  return db.deleteFrom('categories').where('id', '=', id).executeTakeFirst()
}

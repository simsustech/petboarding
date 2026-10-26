import { jsonArrayFrom } from 'kysely/helpers/postgres'
import { Database, db } from '../kysely/index.js'
import type { Categories } from '../kysely/types.ts'

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

const defaultSelect = ['id', 'name', 'order', 'species'] as (keyof Category)[]

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
  select,
  pagination
}: {
  criteria: Partial<Category> & { date?: string }
  select?: (keyof Category)[]
  pagination?: {
    limit: number
    offset: number
    sortBy: 'name' | 'order' | null
    descending: boolean
  }
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('categories')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  if (pagination) {
    if (pagination.sortBy)
      query = query.orderBy(
        pagination.sortBy,
        pagination.descending ? 'desc' : 'asc'
      )

    query = query.limit(pagination.limit).offset(pagination.offset)
  }

  return query
    .select(select)
    .select([withPrices])
    .$if(pagination !== void 0, (qb) =>
      qb.select((seb) =>
        seb.cast<number>(seb.fn.count('id').over(), 'integer').as('total')
      )
    )
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
  select,
  pagination
}: {
  criteria: Partial<Category> & { date?: string }
  select?: (keyof Category)[]
  pagination?: {
    limit: number
    offset: number
    sortBy: 'name' | 'order' | null
    descending: boolean
  }
}) {
  const query = find({
    criteria,
    select,
    pagination
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

import { type ExpressionBuilder } from 'kysely'
import { Database, db } from '../kysely/index.js'
import type { Buildings } from '../kysely/types.d.ts'

import type { Insertable, Selectable, Updateable } from 'kysely'
import { jsonArrayFrom } from 'kysely/helpers/postgres'
type Building = Selectable<Buildings>
type NewBuilding = Insertable<Buildings>
type BuildingUpdate = Updateable<Buildings>

const defaultSelect = [
  'id',
  'name',
  'location',
  'description',
  'order'
] as (keyof Building)[]

function withKennels(eb: ExpressionBuilder<Database, 'buildings'>) {
  return jsonArrayFrom(
    eb
      .selectFrom('kennels')
      .selectAll()
      .whereRef('buildings.id', '=', 'kennels.buildingId')
  ).as('kennels')
}

function find({
  criteria,
  select
}: {
  criteria: Partial<Building>
  select?: (keyof Building)[]
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('buildings')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  if (criteria.name) {
    query = query.where('name', '=', criteria.name)
  }

  return query.select(select).select([withKennels])
}

export async function findBuilding({
  criteria,
  select
}: {
  criteria: Partial<Building>
  select?: (keyof Building)[]
}) {
  const query = find({ criteria, select })

  return query.executeTakeFirst()
}

export async function findBuildings({
  criteria,
  select
}: {
  criteria: Partial<Building>
  select?: (keyof Building)[]
}) {
  const query = find({
    criteria,
    select
  })
  return query.execute()
}

export async function createBuilding(building: NewBuilding) {
  return db
    .insertInto('buildings')
    .values(building)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateBuilding(
  criteria: Partial<Building>,
  updateWith: BuildingUpdate
) {
  let query = db.updateTable('buildings')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query.set(updateWith).executeTakeFirstOrThrow()
}

export async function deleteBuilding(id: number) {
  return db.deleteFrom('buildings').where('id', '=', id).executeTakeFirst()
}

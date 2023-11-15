import { jsonObjectFrom, jsonArrayFrom } from 'kysely/helpers/postgres'
import { Database, db } from '../kysely/index.js'
import type { Customers } from '../kysely/types.d.ts'

import {
  sql,
  type Insertable,
  type Selectable,
  type Updateable,
  ExpressionBuilder
} from 'kysely'
export type Customer = Selectable<Customers>
type NewCustomer = Insertable<Customers>
type CustomerUpdate = Updateable<Customers>

const defaultSelect = [
  'id',
  'firstName',
  'lastName',
  'gender',
  'address',
  'postalCode',
  'city',
  'telephoneNumber',
  'veterinarian',
  'accountId'
] as (keyof Customer)[]

function withAccount(eb: ExpressionBuilder<Database, 'customers'>) {
  return jsonObjectFrom(
    eb
      .selectFrom('accounts')
      .select(['accounts.email', 'accounts.name'])
      .whereRef('customers.accountId', '=', 'accounts.id')
  ).as('account')
}

function withPets(eb: ExpressionBuilder<Database, 'customers'>) {
  return jsonArrayFrom(
    eb
      .selectFrom('pets')
      .select(['pets.id'])
      .whereRef('customers.id', '=', 'pets.customerId')
  ).as('pets')
}

function withBookings(eb: ExpressionBuilder<Database, 'customers'>) {
  return jsonArrayFrom(
    eb
      .selectFrom('bookings')
      .select(['bookings.id'])
      .whereRef('customers.id', '=', 'bookings.customerId')
  ).as('bookings')
}

export async function findCustomer({
  criteria,
  select,
  relations
}: {
  criteria: Partial<Customer>
  select?: (keyof Customer)[]
  relations?: {
    pets?: boolean
    bookings?: boolean
  }
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('customers')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  if (criteria.accountId) {
    query = query.where('accountId', '=', criteria.accountId)
  }

  if (relations?.pets) query = query.select([withPets])
  if (relations?.bookings) query = query.select([withBookings])
  return query.select(select).select([withAccount]).executeTakeFirst()
}

export async function createCustomer(customer: NewCustomer) {
  return db
    .insertInto('customers')
    .values(customer)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateCustomer(
  criteria: Partial<Customer>,
  updateWith: CustomerUpdate
) {
  let query = db.updateTable('customers')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  if (criteria.accountId) {
    query = query.where('accountId', '=', criteria.accountId)
  }
  return query.set(updateWith).executeTakeFirstOrThrow()
}

export async function searchCustomers(searchPhrase: string) {
  const searchTerms = searchPhrase.split(' ')

  const query = sql<Customer[]>`
    with main as (
      select 
        c.id,
        c.account_id,
        c.rating,
        c.gender,
        c.first_name,
        c.last_name,
        c.address,
        c.city,
        c.postal_code,
        c.telephone_number,
        c.veterinarian,
        c.comments,
        p.name,
        p.breed,
        p.color
      from 
        customers c 
        inner join pets p on c.id = p.customer_id
      where 
        c.fulltext @@ to_tsquery(
          'english', ${sql.lit(
            searchTerms.map((term) => term + ':*').join(' | ')
          )}
          )
    ), relation as (
      select 
        c.id,
        c.account_id,
        c.rating,
        c.gender,
        c.first_name,
        c.last_name,
        c.address,
        c.city,
        c.postal_code,
        c.telephone_number,
        c.veterinarian,
        c.comments,
        p.name,
        p.breed,
        p.color
      from 
        customers c 
        inner join pets p on c.id = p.customer_id
      where 
        p.fulltext @@ to_tsquery(
          'english', ${sql.lit(
            searchTerms.map((term) => term + ':*').join(' | ')
          )}
        )
    )
    select distinct on (id) * from main union select * from relation;`

  const results = await query.execute(db)
  return results.rows
}

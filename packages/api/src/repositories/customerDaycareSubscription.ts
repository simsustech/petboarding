import { jsonObjectFrom } from 'kysely/helpers/postgres'
import { Database, db } from '../kysely/index.js'
import type { CustomerDaycareSubscriptions } from '../kysely/types.d.ts'

import type { Insertable, Selectable, Updateable } from 'kysely'
import { ExpressionBuilder } from 'kysely'
export type CustomerDaycareSubscription =
  Selectable<CustomerDaycareSubscriptions>
type NewCustomerDaycareSubscription = Insertable<CustomerDaycareSubscriptions>
type CustomerDaycareSubscriptionUpdate =
  Updateable<CustomerDaycareSubscriptions>

const defaultSelect = [
  'id',
  'status',
  'effectiveDate',
  'expirationDate',
  'invoiceUuid',
  'customerId',
  'daycareSubscriptionId'
] as (keyof CustomerDaycareSubscription)[]

function withDaycareSubscription(
  eb: ExpressionBuilder<Database, 'customerDaycareSubscriptions'>
) {
  return jsonObjectFrom(
    eb
      .selectFrom('daycareSubscriptions')
      .selectAll()
      .whereRef(
        'customerDaycareSubscriptions.daycareSubscriptionId',
        '=',
        'daycareSubscriptions.id'
      )
  ).as('daycareSubscription')
}

function find({
  criteria,
  select
}: {
  criteria: Partial<CustomerDaycareSubscription>
  select?: (keyof CustomerDaycareSubscription)[]
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('customerDaycareSubscriptions')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  if (criteria.status) {
    query = query.where('status', '=', criteria.status)
  }

  if (criteria.invoiceUuid) {
    query = query.where('invoiceUuid', '=', criteria.invoiceUuid)
  }

  if (criteria.customerId) {
    query = query.where('customerId', '=', criteria.customerId)
  }

  return query.select(select).select([withDaycareSubscription])
}

export async function findCustomerDaycareSubscription({
  criteria,
  select
}: {
  criteria: Partial<CustomerDaycareSubscription>
  select?: (keyof CustomerDaycareSubscription)[]
}) {
  const query = find({ criteria, select })

  return query.executeTakeFirst()
}

export async function findCustomerDaycareSubscriptions({
  criteria,
  select
}: {
  criteria: Partial<CustomerDaycareSubscription>
  select?: (keyof CustomerDaycareSubscription)[]
}) {
  const query = find({
    criteria,
    select
  })
  return query.execute()
}

export async function createCustomerDaycareSubscription(
  customerDaycareSubscription: NewCustomerDaycareSubscription
) {
  return db
    .insertInto('customerDaycareSubscriptions')
    .values(customerDaycareSubscription)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateCustomerDaycareSubscription(
  criteria: Partial<CustomerDaycareSubscription>,
  updateWith: CustomerDaycareSubscriptionUpdate
) {
  let query = db.updateTable('customerDaycareSubscriptions')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query.set(updateWith).executeTakeFirstOrThrow()
}

export async function deleteCustomerDaycareSubscription(id: number) {
  return db
    .deleteFrom('customerDaycareSubscriptions')
    .where('id', '=', id)
    .executeTakeFirst()
}

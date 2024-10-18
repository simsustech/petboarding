import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'
import { Database, db } from '../kysely/index.js'
import {
  CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS,
  DAYCARE_DATE_STATUS,
  type CustomerDaycareSubscriptions
} from '../kysely/types.js'

import type { Insertable, Selectable, Updateable } from 'kysely'
import { ExpressionBuilder, sql } from 'kysely'
import { FastifyInstance } from 'fastify'
import { Invoice, InvoiceStatus } from '@modular-api/fastify-checkout'
import { DaycareSubscription } from './daycareSubscription.js'
import { subDays, subMonths } from 'date-fns'
export type CustomerDaycareSubscription =
  Selectable<CustomerDaycareSubscriptions>
type NewCustomerDaycareSubscription = Insertable<CustomerDaycareSubscriptions>
type CustomerDaycareSubscriptionUpdate =
  Updateable<CustomerDaycareSubscriptions>

export type ParsedCustomerDaycareSubscription = CustomerDaycareSubscription & {
  daycareSubscription?: DaycareSubscription | null
  numberOfDaysUsed: number | null
  numberOfDaysRemaining: number | null
  invoice?: Invoice | null
}

async function getCustomerDaycareSubscriptionInvoice({
  customerDaycareSubscription,
  fastify
}: {
  customerDaycareSubscription: CustomerDaycareSubscription
  fastify?: FastifyInstance
}) {
  try {
    if (!customerDaycareSubscription.invoiceUuid || !fastify?.slimfact)
      throw new Error('Invoice UUID or fastify not defined')

    const invoice = await fastify.slimfact.admin.getInvoice.query({
      uuid: customerDaycareSubscription.invoiceUuid
    })
    return invoice
  } catch (e) {
    fastify?.log.debug(e)
    return null
  }
}

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

function withNumberOfDaysUsed(
  eb: ExpressionBuilder<Database, 'customerDaycareSubscriptions'>
) {
  return eb
    .selectFrom('daycareDates')
    .whereRef(
      'daycareDates.customerDaycareSubscriptionId',
      '=',
      'customerDaycareSubscriptions.id'
    )
    .innerJoin(
      'daycareDatePetKennel',
      'daycareDates.id',
      'daycareDatePetKennel.daycareDateId'
    )
    .where((web) =>
      web.or([
        web('daycareDates.status', '=', DAYCARE_DATE_STATUS.APPROVED),
        web('daycareDates.status', '=', DAYCARE_DATE_STATUS.STANDBY),
        web('daycareDates.status', '=', DAYCARE_DATE_STATUS.PENDING)
      ])
    )
    .select((seb) =>
      seb
        .cast<number>(seb.fn.count('daycareDates.id'), 'integer')
        .as('numberOfDaysUsed')
    )
    .as('numberOfDaysUsed')
}

// function withIsActive(
//   eb: ExpressionBuilder<Database, 'customerDaycareSubscriptions'>
// ) {
//   return eb
//     .case()
//     .when(
//       'customerDaycareSubscriptions.effectiveDate',
//       '<=',
//       sql<string>`CURRENT_DATE`
//     )
//     .then(
//       eb
//         .case()
//         .when(
//           'customerDaycareSubscriptions.expirationDate',
//           '>=',
//           sql<string>`CURRENT_DATE`
//         )
//         .then(true)
//         .else(false)
//         .end()
//     )
//     .else(false)
//     .end()
//     .as('isActive')
// }

function withIsActive(
  eb: ExpressionBuilder<Database, 'customerDaycareSubscriptions'>
) {
  return eb
    .case()
    .when(
      'customerDaycareSubscriptions.expirationDate',
      '>=',
      sql<string>`CURRENT_DATE`
    )
    .then(true)
    .else(false)
    .end()
    .as('isActive')
}

function withNumberOfDaysRemaining(
  eb: ExpressionBuilder<Database, 'customerDaycareSubscriptions'>
) {
  return eb
    .selectFrom('daycareDates')
    .whereRef(
      'daycareDates.customerDaycareSubscriptionId',
      '=',
      'customerDaycareSubscriptions.id'
    )
    .innerJoin(
      'daycareDatePetKennel',
      'daycareDates.id',
      'daycareDatePetKennel.daycareDateId'
    )
    .where((web) =>
      web.or([
        web('daycareDates.status', '=', DAYCARE_DATE_STATUS.APPROVED),
        web('daycareDates.status', '=', DAYCARE_DATE_STATUS.STANDBY),
        web('daycareDates.status', '=', DAYCARE_DATE_STATUS.PENDING)
      ])
    )
    .select((seb) =>
      seb(
        seb
          .selectFrom('daycareSubscriptions')
          .select('daycareSubscriptions.numberOfDays')
          .whereRef(
            'customerDaycareSubscriptions.daycareSubscriptionId',
            '=',
            'daycareSubscriptions.id'
          ),
        '-',
        seb.cast<number>(seb.fn.count('daycareDates.id'), 'integer')
      ).as('numberOfDaysRemaining')
    )
    .as('numberOfDaysRemaining')
}

function withDaycareDates(
  eb: ExpressionBuilder<Database, 'customerDaycareSubscriptions'>
) {
  return jsonArrayFrom(
    eb
      .selectFrom('daycareDates')
      .whereRef(
        'daycareDates.customerDaycareSubscriptionId',
        '=',
        'customerDaycareSubscriptions.id'
      )
      .where((web) =>
        web.or([
          web('daycareDates.status', '=', DAYCARE_DATE_STATUS.APPROVED),
          web('daycareDates.status', '=', DAYCARE_DATE_STATUS.STANDBY),
          web('daycareDates.status', '=', DAYCARE_DATE_STATUS.PENDING)
        ])
      )
      .orderBy('daycareDates.date asc')
      .select('daycareDates.date')
  ).as('daycareDates')
}

function find({
  criteria,
  select
}: {
  criteria: Partial<CustomerDaycareSubscription> & {
    statuses?: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS[]
    date?: string
    from?: string
    until?: string
  }
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

  if (criteria.statuses?.length) {
    query = query.where((web) =>
      web.or(
        criteria.statuses!.map((status) =>
          web('customerDaycareSubscriptions.status', '=', status)
        )
      )
    )
  }

  if (criteria.date) {
    query = query
      .where('customerDaycareSubscriptions.effectiveDate', '<=', criteria.date)
      .where('customerDaycareSubscriptions.expirationDate', '>=', criteria.date)
  }

  if (criteria.effectiveDate) {
    query = query.where(
      'customerDaycareSubscriptions.effectiveDate',
      '<=',
      criteria.effectiveDate
    )
  }

  if (criteria.expirationDate) {
    query = query.where(
      'customerDaycareSubscriptions.expirationDate',
      '>=',
      criteria.expirationDate
    )
  }

  if (criteria.from) {
    query = query.where(
      'customerDaycareSubscriptions.createdAt',
      '>=',
      criteria.from
    )
  }

  if (criteria.until) {
    query = query.where(
      'customerDaycareSubscriptions.createdAt',
      '<=',
      criteria.until
    )
  }

  if (criteria.invoiceUuid) {
    query = query.where('invoiceUuid', '=', criteria.invoiceUuid)
  }

  if (criteria.customerId) {
    query = query.where('customerId', '=', criteria.customerId)
  }

  return query
    .orderBy('customerDaycareSubscriptions.effectiveDate')
    .select(select)
    .select([
      withDaycareSubscription,
      withNumberOfDaysUsed,
      withNumberOfDaysRemaining,
      withIsActive,
      withDaycareDates
    ])
}

export async function findCustomerDaycareSubscription({
  criteria,
  select,
  fastify
}: {
  criteria: Partial<CustomerDaycareSubscription> & {
    statuses?: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS[]
    date?: string
  }
  select?: (keyof CustomerDaycareSubscription)[]
  fastify?: FastifyInstance
}): Promise<ParsedCustomerDaycareSubscription | undefined> {
  const query = find({ criteria, select })

  const result = await query.executeTakeFirst()
  if (result) {
    return {
      ...result,
      invoice: await getCustomerDaycareSubscriptionInvoice({
        customerDaycareSubscription: result,
        fastify
      })
    }
  } else {
    return result
  }
}

export async function findCustomerDaycareSubscriptions({
  criteria,
  select,
  fastify
}: {
  criteria: Partial<CustomerDaycareSubscription> & {
    statuses?: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS[]
    date?: string
    from?: string
    until?: string
  }
  select?: (keyof CustomerDaycareSubscription)[]
  fastify?: FastifyInstance
}): Promise<ParsedCustomerDaycareSubscription[]> {
  const query = find({
    criteria,
    select
  })
  const result = await query.execute()

  return Promise.all(
    result.map(async (customerDaycareSubscription) => ({
      ...customerDaycareSubscription,
      invoice: await getCustomerDaycareSubscriptionInvoice({
        customerDaycareSubscription,
        fastify
      })
    }))
  )
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

  return query.set(updateWith).returningAll().executeTakeFirstOrThrow()
}

export async function deleteCustomerDaycareSubscription(id: number) {
  return db
    .deleteFrom('customerDaycareSubscriptions')
    .where('id', '=', id)
    .executeTakeFirst()
}

export async function setCustomerDaycareSubscriptionStatus({
  id,
  status
}: {
  id: number
  status: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS
}) {
  await updateCustomerDaycareSubscription(
    {
      id
    },
    {
      status
    }
  )
  const customerDaycareSubscription = await findCustomerDaycareSubscription({
    criteria: {
      id
    }
  })
  if (
    customerDaycareSubscription &&
    status === CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID
  ) {
    // Add existing daycare dates without subscription
    const existingDaycareDateIds = await db
      .selectFrom('daycareDates')
      .where(
        'daycareDates.customerId',
        '=',
        customerDaycareSubscription.customerId
      )
      .where(
        'daycareDates.date',
        '>=',
        customerDaycareSubscription.effectiveDate
      )
      .where(
        'daycareDates.date',
        '<=',
        customerDaycareSubscription.expirationDate
      )
      .where('daycareDates.customerDaycareSubscriptionId', 'is', null)
      .where((web) =>
        web.or([
          web('daycareDates.status', '=', DAYCARE_DATE_STATUS.APPROVED),
          web('daycareDates.status', '=', DAYCARE_DATE_STATUS.PENDING),
          web('daycareDates.status', '=', DAYCARE_DATE_STATUS.STANDBY)
        ])
      )
      .orderBy('daycareDates.date asc')
      .limit(customerDaycareSubscription.daycareSubscription?.numberOfDays || 0)
      .select('id')
      .execute()
      .then((result) => result.map(({ id }) => id))

    if (existingDaycareDateIds.length) {
      await db
        .updateTable('daycareDates')
        .where('daycareDates.id', 'in', existingDaycareDateIds)
        .set({
          customerDaycareSubscriptionId: customerDaycareSubscription.id
        })
        .execute()
    }
  }
  return customerDaycareSubscription
}

export const createReceiptsForCustomerDaycareSubscriptions = async ({
  fastify
}: {
  fastify: FastifyInstance
}) => {
  const threeMonthsInThePast = subMonths(new Date(), 3)
  const oneWeekInThePast = subDays(new Date(), 7)

  const paidCustomerDaycareSubscriptions =
    await findCustomerDaycareSubscriptions({
      criteria: {
        status: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID,
        from: threeMonthsInThePast.toISOString().slice(0, 10),
        until: oneWeekInThePast.toISOString().slice(0, 10)
      },
      fastify
    })

  const notPaidCustomerDaycareSubscriptions =
    await findCustomerDaycareSubscriptions({
      criteria: {
        status: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.OPEN,
        from: threeMonthsInThePast.toISOString().slice(0, 10),
        until: oneWeekInThePast.toISOString().slice(0, 10)
      },
      fastify
    })

  const paidCustomerDaycareSubscriptionsWithBills =
    paidCustomerDaycareSubscriptions.filter(
      (customerDaycareSubscription) =>
        customerDaycareSubscription.invoice?.status === InvoiceStatus.BILL
    )

  for (const customerDaycareSubscription of paidCustomerDaycareSubscriptionsWithBills) {
    const invoiceId = customerDaycareSubscription.invoice?.id
    if (invoiceId) {
      await fastify.slimfact?.admin.setInvoiceStatus.mutate({
        id: invoiceId,
        status: InvoiceStatus.RECEIPT
      })
      console.log(
        `Created receipt for customer daycare subscription ${customerDaycareSubscription.id}`
      )
    }
  }

  for (const customerDaycareSubscription of notPaidCustomerDaycareSubscriptions) {
    await updateCustomerDaycareSubscription(
      {
        id: customerDaycareSubscription.id
      },
      {
        status: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.CANCELED
      }
    )
    const customerDaycareSubscriptionInvoiceId =
      customerDaycareSubscription.invoice?.id
    if (customerDaycareSubscriptionInvoiceId) {
      await fastify.slimfact?.admin.setInvoiceStatus.mutate({
        id: customerDaycareSubscriptionInvoiceId,
        status: InvoiceStatus.CANCELED
      })
    }
    console.log(
      `Canceled customer daycare subscription ${customerDaycareSubscription.id}`
    )
  }
}

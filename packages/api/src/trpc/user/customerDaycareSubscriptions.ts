import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import { customerDaycareSubscription } from '../../zod/customerDaycareSubscription.js'
import { db } from '../../kysely/index.js'
// import * as z from 'zod'
import type { FastifyInstance } from 'fastify'
import {
  createCustomerDaycareSubscription,
  findCustomerDaycareSubscription,
  findCustomerDaycareSubscriptions,
  ParsedCustomerDaycareSubscription,
  updateCustomerDaycareSubscription
} from '../../repositories/customerDaycareSubscription.js'
import { findCustomer } from '../../repositories/customer'
import { findDaycareSubscription } from '../../repositories/daycareSubscription.js'
import { add } from 'date-fns'
import { CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS } from '../../kysely/types.js'
import env from '@vitrify/tools/env'
import { Customer } from '../../zod/customer.js'
import {
  type Invoice,
  type PaymentMethod,
  type RawInvoiceDiscount,
  type RawInvoiceLine,
  type RawInvoiceSurcharge
} from '@modular-api/fastify-checkout'
import { InvoiceStatus } from '@modular-api/fastify-checkout/types'

const currency = env.read('CURRENCY') || env.read('VITE_CURRENCY') || 'EUR'
const host = env.read('API_HOST') || env.read('VITE_API_HOST')
// const slimfactHostname =
//   env.read('VITE_SLIMFACT_HOST') || env.read('SLIMFACT_HOST')
export const createOrUpdateSlimfactDaycareSubscription = async ({
  fastify,
  customerDaycareSubscription,
  customer,
  locale
}: {
  fastify: FastifyInstance
  customerDaycareSubscription: ParsedCustomerDaycareSubscription
  customer: Pick<
    Customer,
    'firstName' | 'lastName' | 'address' | 'postalCode' | 'city'
  > & { account: { email: string } | null }
  locale?: 'en-US' | 'nl'
}): Promise<
  | {
      success: true
      invoice: Invoice
    }
  | { success: false; errorMessage: string }
> => {
  if (!fastify.slimfact) throw new Error('SlimFact not configured')
  if (!customer.account) throw new Error('Customer is not linked to an account')

  if (!locale) locale = env.read('VITE_LANG') || 'en-US'

  let numberPrefixes, companyDetails
  try {
    numberPrefixes = await fastify.slimfact.admin.getNumberPrefixes.query()

    companyDetails = await fastify.slimfact.admin.getCompany.query({
      id: Number(
        env.read('SLIMFACT_COMPANY_ID') || env.read('VITE_SLIMFACT_COMPANY_ID')
      )
    })
  } catch (e) {
    return {
      success: false,
      errorMessage: 'SlimFact not authorized.'
    }
  }

  const clientDetails = {
    address: customer.address,
    postalCode: customer.postalCode,
    city: customer.city,
    email: customer.account.email,
    contactPersonName: [customer.firstName, customer.lastName].join(' ')
  }

  const lines: RawInvoiceLine[] = [
    {
      description: customerDaycareSubscription.daycareSubscription!.description,
      listPrice: customerDaycareSubscription.daycareSubscription!.listPrice,
      listPriceIncludesTax: true,
      quantity: 1,
      quantityPerMille: false,
      discount: 0,
      taxRate: 21
    }
  ]
  const discounts: RawInvoiceDiscount[] = []
  const surcharges: RawInvoiceSurcharge[] = []

  try {
    const invoice = await fastify.slimfact.admin.createInvoice.mutate({
      companyDetails: companyDetails,
      clientDetails,
      companyPrefix: companyDetails.prefix,
      numberPrefixTemplate:
        companyDetails.defaultNumberPrefixTemplate ||
        numberPrefixes.at(0)?.template,
      currency,
      lines,
      discounts,
      surcharges,
      paymentTermDays: 14,
      locale,
      companyId: companyDetails.id,
      status: InvoiceStatus.BILL,
      requiredDownPaymentAmount: 0,
      metadata: {
        webhookUrl: `https://${host}/webhook/slimfact`
      }
    })

    return {
      success: true,
      invoice
    }
  } catch (e) {
    return {
      success: false,
      errorMessage: 'Could not create or update daycare subscription invoice.'
    }
  }
}

export const userCustomerDaycareSubscriptionValidation =
  customerDaycareSubscription.omit({
    customerId: true,
    invoiceUuid: true,
    status: true
  })

export const userCustomerDaycareSubscriptionRoutes = ({
  fastify,
  procedure
}: {
  fastify: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getCustomerDaycareSubscriptions: procedure.query(async ({ ctx }) => {
    if (ctx.account?.id) {
      const customer = await findCustomer({
        criteria: {
          accountId: Number(ctx.account.id)
        }
      })
      if (customer?.id) {
        const customerDaycareSubscriptions =
          await findCustomerDaycareSubscriptions({
            criteria: {
              customerId: customer.id,
              expirationDate: new Date().toISOString().slice(0, 10),
              // date: new Date().toISOString().slice(0, 10),
              statuses: [
                CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID,
                CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.OPEN
              ]
            },
            fastify
          })
        return customerDaycareSubscriptions
      }
    }
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  createCustomerDaycareSubscription: procedure
    .input(userCustomerDaycareSubscriptionValidation)
    .mutation(async ({ input, ctx }) => {
      if (ctx.account?.id) {
        const customer = await findCustomer({
          criteria: {
            accountId: Number(ctx.account.id)
          }
        })
        const daycareSubscription = await findDaycareSubscription({
          criteria: {
            id: input.daycareSubscriptionId
          }
        })
        if (customer?.id && daycareSubscription) {
          if (input.effectiveDate < new Date().toISOString().slice(0, 10))
            throw new Error('Effective date cannot be in the past')

          let customerDaycareSubscription =
            await findCustomerDaycareSubscription({
              criteria: {
                status: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.OPEN,
                effectiveDate: input.effectiveDate,
                expirationDate: add(
                  new Date(
                    input.effectiveDate || new Date().toISOString().slice(0, 10)
                  ),
                  {
                    ...daycareSubscription.validityPeriod
                  }
                )
                  .toISOString()
                  .slice(0, 10),
                customerId: customer.id,
                daycareSubscriptionId: input.daycareSubscriptionId
              }
            })

          try {
            const trxResult = await db.transaction().execute(async (trx) => {
              if (!customerDaycareSubscription) {
                const newCustomerDaycareSubscription =
                  await createCustomerDaycareSubscription(
                    {
                      effectiveDate:
                        input.effectiveDate ||
                        new Date().toISOString().slice(0, 10),
                      expirationDate: add(
                        new Date(
                          input.effectiveDate ||
                            new Date().toISOString().slice(0, 10)
                        ),
                        {
                          ...daycareSubscription.validityPeriod
                        }
                      )
                        .toISOString()
                        .slice(0, 10),
                      status: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.OPEN,
                      daycareSubscriptionId: input.daycareSubscriptionId,
                      customerId: customer.id
                    },
                    trx
                  )
                customerDaycareSubscription =
                  await findCustomerDaycareSubscription({
                    criteria: {
                      id: newCustomerDaycareSubscription.id
                    }
                  })
              }
              let invoice: Invoice | null = null
              if (customerDaycareSubscription && fastify.slimfact) {
                if (!customerDaycareSubscription.invoiceUuid) {
                  const result =
                    await createOrUpdateSlimfactDaycareSubscription({
                      fastify,
                      customerDaycareSubscription,
                      customer
                    })
                  if (result.success) {
                    invoice = result.invoice
                    await updateCustomerDaycareSubscription(
                      { id: customerDaycareSubscription.id },
                      {
                        invoiceUuid: invoice.uuid
                      }
                    )
                  } else {
                    throw new Error(result.errorMessage)
                  }
                } else {
                  const result = await fastify.slimfact.admin.getInvoice.query({
                    uuid: customerDaycareSubscription.invoiceUuid
                  })
                  if (result) {
                    invoice = result
                  }
                }
              }
              if (invoice) {
                const payment =
                  await fastify.slimfact.admin.addPaymentToInvoice.mutate({
                    id: invoice.id,
                    payment: {
                      currency,
                      amount: invoice.totalIncludingTax,
                      method: PaymentMethod.ideal,
                      redirectUrl: `https://${host}/account/daycare`
                    }
                  })
                return {
                  customerDaycareSubscription,
                  checkoutUrl: payment.checkoutUrl
                }
              }
            })
            return trxResult
          } catch (e) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: e instanceof Error ? e.message : undefined
            })
          }
        }
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    })
})

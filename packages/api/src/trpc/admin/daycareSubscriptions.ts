import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import * as z from 'zod'
import type { FastifyInstance } from 'fastify'
// import type { DaycareSubscription } from '../../repositories/daycareSubscription.js'
// import type { Customer } from '../../repositories/customer.js'
// import {
//   InvoiceStatus,
//   RawInvoiceDiscount,
//   RawInvoiceLine,
//   RawInvoiceSurcharge,
//   type Invoice
// } from '@modular-api/fastify-checkout'
// import env from '@vitrify/tools/env'
import {
  createDaycareSubscription,
  deleteDaycareSubscription,
  findDaycareSubscriptions,
  updateDaycareSubscription
} from '../../repositories/daycareSubscription.js'
import { daycareSubscription as daycareSubscriptionValidation } from '../../zod/daycareSubscription.js'

// const slimfactHostname =
//   env.read('VITE_SLIMFACT_HOSTNAME') || env.read('SLIMFACT_HOSTNAME')
// export const createOrUpdateSlimfactDaycareSubscription = async ({
//   fastify,
//   daycareSubscription,
//   customer,
//   locale
// }: {
//   fastify: FastifyInstance
//   daycareSubscription: DaycareSubscription
//   customer: Pick<
//     Customer,
//     'firstName' | 'lastName' | 'address' | 'postalCode' | 'city'
//   > & { account: { email: string } | null }
//   locale?: 'en-US' | 'nl'
// }): Promise<
//   | {
//       success: true
//       invoice: Invoice
//     }
//   | { success: false; errorMessage: string }
// > => {
//   if (!fastify.slimfact) throw new Error('SlimFact not configured')
//   if (!customer.account) throw new Error('Customer is not linked to an account')

//   if (!locale) locale = env.read('VITE_LANG') || 'en-US'

//   let numberPrefixes, companyDetails
//   try {
//     numberPrefixes = await fastify.slimfact.admin.getNumberPrefixes.query()

//     companyDetails = await fastify.slimfact.admin.getCompany.query({
//       id: Number(
//         env.read('SLIMFACT_COMPANY_ID') || env.read('VITE_SLIMFACT_COMPANY_ID')
//       )
//     })
//   } catch (e) {
//     throw new Error('SlimFact not authorized.')
//   }

//   const clientDetails = {
//     address: customer.address,
//     postalCode: customer.postalCode,
//     city: customer.city,
//     email: customer.account.email,
//     contactPersonName: [customer.firstName, customer.lastName].join(' ')
//   }

//   const lines: RawInvoiceLine[] = [
//     {
//       description: daycareSubscription.description,
//       listPrice: daycareSubscription.listPrice,
//       listPriceIncludesTax: true,
//       quantity: 1,
//       quantityPerMille: false,
//       discount: 0,
//       taxRate: 21
//     }
//   ]
//   const discounts: RawInvoiceDiscount[] = []
//   const surcharges: RawInvoiceSurcharge[] = []

//   try {
//     const invoice = await fastify.slimfact.admin.createInvoice.mutate({
//       companyDetails: companyDetails,
//       clientDetails,
//       companyPrefix: companyDetails.prefix,
//       numberPrefixTemplate:
//         companyDetails.defaultNumberPrefixTemplate ||
//         numberPrefixes.at(0)?.template,
//       currency: env.read('CURRENCY') || env.read('VITE_CURRENCY') || 'EUR',
//       lines,
//       discounts,
//       surcharges,
//       paymentTermDays: 14,
//       locale,
//       companyId: companyDetails.id,
//       status: InvoiceStatus.BILL,
//       requiredDownPaymentAmount: 0
//     })

//     return {
//       success: true,
//       invoice
//     }
//   } catch (e) {
//     return {
//       success: false,
//       errorMessage: 'Could not create or update daycare subscription invoice.'
//     }
//   }
// }

export const adminDaycareSubscriptionRoutes = ({
  // fastify,
  procedure
}: {
  fastify: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getDaycareSubscriptions: procedure.query(async ({}) => {
    const daycareSubscriptions = await findDaycareSubscriptions({
      criteria: {}
    })
    return daycareSubscriptions
  }),
  createDaycareSubscription: procedure
    .input(daycareSubscriptionValidation)
    .mutation(async ({ input }) => {
      await createDaycareSubscription({
        ...input,
        validityPeriod: JSON.stringify(input.validityPeriod)
      })
      return true
    }),
  updateDaycareSubscription: procedure
    .input(daycareSubscriptionValidation)
    .mutation(async ({ input }) => {
      await updateDaycareSubscription(
        {
          id: input.id
        },
        {
          ...input,
          validityPeriod: JSON.stringify(input.validityPeriod)
        }
      )
    }),
  deleteDaycareSubscription: procedure
    .input(
      z.object({
        id: z.number()
      })
    )
    .mutation(async ({ input }) => {
      if (input.id) {
        await deleteDaycareSubscription(input.id)
        return true
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    })
})

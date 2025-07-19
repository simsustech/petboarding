import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import * as z from 'zod'
import { BOOKING_STATUS, bookingService } from '../../zod/booking.js'
import handlebars from 'handlebars'
import {
  format,
  parseISO,
  parse,
  isBefore,
  isAfter,
  isWithinInterval,
  subMonths,
  subDays,
  differenceInDays
} from 'date-fns'
import type { FastifyInstance } from 'fastify'
import {
  createBookingStatus,
  findBooking,
  findBookings,
  getBookingsCount,
  updateBookingService,
  cancelBooking,
  updateBooking,
  getLastApprovedForBooking
} from '../../repositories/booking.js'
import type { ParsedBooking } from '../../repositories/booking.js'
import { findCustomer } from '../../repositories/customer.js'
import env from '@vitrify/tools/env'
import { InvoiceStatus } from '@modular-api/fastify-checkout/types'
import type { Customer } from '../../zod/customer.js'
import {
  computeInvoiceCosts,
  type Invoice,
  type RawInvoiceDiscount,
  type RawInvoiceLine,
  type RawInvoiceSurcharge
} from '@modular-api/fastify-checkout'

import { bookingEmailTemplates } from 'src/templates/email/bookings/index.js'

const downPaymentPaymentTermDays =
  env.read('VITE_DOWN_PAYMENT_PAYMENT_TERM_DAYS') ||
  env.read('DOWN_PAYMENT_PAYMENT_TERM_DAYS') ||
  5

export const compileEmail = async ({
  booking,
  subjectTemplate,
  bodyTemplate,
  localeCode,
  variables
}: {
  booking: ParsedBooking
  subjectTemplate: string
  bodyTemplate: string
  localeCode?: string
  variables?: Record<string, string>
}) => {
  let locale
  try {
    locale = (await import(`date-fns/locale/${localeCode}`)).default
  } catch {
    locale = (
      await import(`date-fns/locale/${process.env.VITE_LANG || 'en-US'}`)
    ).default
  }

  const context = {
    customer: {
      firstName: booking.customer?.firstName,
      lastName: booking.customer?.lastName
    },
    pets: booking.pets.map((pet) => pet.name).join(', '),
    startDate: format(parseISO(booking.startDate), 'EEEE dd MMM yyyy', {
      locale
    }),
    endDate: format(parseISO(booking.endDate), 'EEEE dd MMM yyyy', {
      locale
    }),
    startTime: booking.startTime?.name,
    endTime: booking.endTime?.name,
    downPaymentPaymentTermDays,
    ...variables
  }
  const subject = handlebars.compile(subjectTemplate)(context)
  const body = handlebars.compile(bodyTemplate)(context)

  return {
    subject,
    body
  }
}

const slimfactHost = env.read('VITE_SLIMFACT_HOST') || env.read('SLIMFACT_HOST')
export const createOrUpdateSlimfactInvoice = async ({
  fastify,
  booking,
  customer,
  locale
}: {
  fastify: FastifyInstance
  booking: ParsedBooking
  customer: Pick<
    Customer,
    'firstName' | 'lastName' | 'address' | 'postalCode' | 'city'
  > & {
    account: { email: string } | null
  }
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

  const dateFormatter = (date: Date) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'full',
      timeZone: 'UTC'
    }).format(date)

  let numberPrefixes, companyDetails
  try {
    numberPrefixes = await fastify.slimfact.admin.getNumberPrefixes.query()

    companyDetails = await fastify.slimfact.admin.getCompany.query({
      id: Number(
        env.read('SLIMFACT_COMPANY_ID') || env.read('VITE_SLIMFACT_COMPANY_ID')
      )
    })
  } catch (e) {
    throw new Error('SlimFact not authorized.')
  }

  const clientDetails = {
    address: customer.address,
    postalCode: customer.postalCode,
    city: customer.city,
    email: customer.account.email,
    contactPersonName: [customer.firstName, customer.lastName].join(' ')
  }

  const lastApprovedBooking = await getLastApprovedForBooking(booking)
  let bookingCancelationHandler
  let cancelationCosts
  try {
    ;({ bookingCancelationHandler } = await import('../../api.config.js'))
    if (lastApprovedBooking.days) {
      ;({ cancelationCosts } = bookingCancelationHandler({
        period: {
          startDate: lastApprovedBooking.startDate,
          endDate: lastApprovedBooking.endDate,
          days: lastApprovedBooking.days
        },
        dateFns: {
          isBefore,
          isAfter,
          isWithinInterval,
          parse,
          parseISO,
          subMonths,
          differenceInDays,
          subDays
        },
        booking: lastApprovedBooking,
        BOOKING_STATUS
      }))
    }
  } catch (e) {
    fastify.log.debug(e)
    console.error('Unable to load API config')
  }

  let lines: RawInvoiceLine[] = booking.costs?.lines || []
  let discounts: RawInvoiceDiscount[] | undefined =
    booking.costs?.discounts || []
  let surcharges: RawInvoiceSurcharge[] | undefined =
    booking.costs?.surcharges || []
  let requiredDownPaymentAmount: number =
    booking.costs?.requiredDownPaymentAmount || 0

  if (
    booking.status?.status &&
    [BOOKING_STATUS.CANCELED, BOOKING_STATUS.CANCELED_OUTSIDE_PERIOD].includes(
      booking.status?.status
    ) &&
    cancelationCosts
  ) {
    ;({
      lines,
      surcharges,
      discounts,
      requiredDownPaymentAmount = 0
    } = cancelationCosts)
  }

  const notes = `${dateFormatter(new Date(booking.startDate))} ${booking.startTime?.name}
  →
  ${dateFormatter(new Date(booking.endDate))} ${booking.endTime?.name}`

  const host = env.read('API_HOST') || env.read('VITE_API_HOST')

  let computedCancelationCosts
  let cancelationSurcharge: RawInvoiceSurcharge
  if (cancelationCosts) {
    const computedInvoiceCosts = computeInvoiceCosts({
      lines,
      discounts,
      surcharges
    })
    computedCancelationCosts = computeInvoiceCosts(cancelationCosts)

    if (
      computedCancelationCosts.totalIncludingTax -
        computedInvoiceCosts.totalIncludingTax >
      0
    ) {
      cancelationSurcharge = {
        ...cancelationCosts.lines.at(0),
        listPriceIncludesTax: true,
        taxRate: 21,
        listPrice:
          computedCancelationCosts.totalIncludingTax -
          computedInvoiceCosts.totalIncludingTax
      }
      surcharges?.push(cancelationSurcharge)
    }
  }

  try {
    if (booking.invoiceUuid) {
      const invoice = await fastify.slimfact.admin.updateInvoice.mutate({
        uuid: booking.invoiceUuid ? booking.invoiceUuid : undefined,
        companyDetails: companyDetails,
        clientDetails,
        companyPrefix: companyDetails.prefix,
        numberPrefixTemplate:
          companyDetails.defaultNumberPrefixTemplate ||
          numberPrefixes.at(0)?.template,
        currency: env.read('CURRENCY') || env.read('VITE_CURRENCY') || 'EUR',
        lines,
        discounts,
        surcharges,
        paymentTermDays: 14,
        locale,
        notes,
        companyId: companyDetails.id,
        requiredDownPaymentAmount,
        metadata: {
          referenceId: 'petboarding',
          referenceUrl: `https://${host}/employee/bookings/${booking.id}`,
          webhookUrl: `https://${host}/webhook/slimfact`
        }
      })

      return {
        success: true,
        invoice
      }
    } else {
      const invoice = await fastify.slimfact.admin.createInvoice.mutate({
        companyDetails: companyDetails,
        clientDetails,
        companyPrefix: companyDetails.prefix,
        numberPrefixTemplate:
          companyDetails.defaultNumberPrefixTemplate ||
          numberPrefixes.at(0)?.template,
        currency: env.read('CURRENCY') || env.read('VITE_CURRENCY') || 'EUR',
        lines,
        discounts,
        surcharges,
        paymentTermDays: 14,
        locale,
        notes,
        companyId: companyDetails.id,
        status: InvoiceStatus.BILL,
        requiredDownPaymentAmount,
        metadata: {
          referenceId: 'petboarding',
          referenceUrl: `https://${host}/employee/bookings/${booking.id}`,
          webhookUrl: `https://${host}/webhook/slimfact`
        }
      })

      await updateBooking(
        {
          id: booking.id
        },
        {
          booking: {
            ...booking,
            invoiceUuid: invoice.uuid
          },
          petIds: booking.pets.map((pet) => pet.id),
          serviceIds: booking.services.map((service) => service.id)
        },
        {
          skipStatusUpdate: true
        }
      )

      return {
        success: true,
        invoice
      }
    }
  } catch (e) {
    return {
      success: false,
      errorMessage: 'Could not create or update booking invoice.'
    }
  }
}

export const adminBookingRoutes = ({
  fastify,
  procedure
}: {
  fastify: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getBookings: procedure
    .input(
      z.object({
        from: z.string().optional().nullable(),
        until: z.string().optional().nullable(),
        status: z.nativeEnum(BOOKING_STATUS).optional(),
        customerId: z.number().optional().nullable(),
        invoice: z
          .object({
            status: z.nativeEnum(InvoiceStatus).optional(),
            statuses: z.nativeEnum(InvoiceStatus).array().optional(),
            paid: z.boolean().optional()
          })
          .optional()
      })
    )
    .query(async ({ input }) => {
      const { from, until, status, customerId, invoice } = input
      const bookings = await findBookings({
        criteria: {
          from: from ? from : undefined,
          until: until ? until : undefined,
          status,
          customerId: customerId ? customerId : undefined
        },
        limit: 25,
        fastify
      })

      if (invoice && fastify.slimfact && bookings?.length) {
        const bookingBillUuids = bookings
          .map((booking) => booking.invoiceUuid)
          .filter((uuid): uuid is string => !!uuid)
        const bills = await fastify.slimfact.admin.getInvoices.query({
          uuids: bookingBillUuids,
          status: invoice.status ? invoice.status : null,
          statuses: invoice.statuses,
          paid: invoice.paid
        })

        const billUuids = bills?.map((bill) => bill.uuid)

        return bookings.filter(
          (booking) =>
            !!booking.invoiceUuid && billUuids?.includes(booking.invoiceUuid)
        )
        // return findBookings({
        //   criteria: {
        //     ids: bookings
        //       .filter(
        //         (booking) =>
        //           booking.invoiceUuid &&
        //           unpaidBillUuids?.includes(booking.invoiceUuid)
        //       )
        //       .map((booking) => booking.id)
        //   },
        //   fastify
        // })
      }
      return bookings
    }),
  getBookingEmail: procedure
    .input(
      z.object({
        id: z.number(),
        type: z.enum(['approve', 'reject', 'reply', 'standby']),
        localeCode: z.string().optional()
      })
    )
    .query(async ({ input }) => {
      const { id, type, localeCode = env.read('VITE_LANG') } = input
      const booking = await findBooking({
        criteria: {
          id
        }
      })
      if (booking) {
        let template: { subject: string; body: string }
        try {
          template = await bookingEmailTemplates[`./${type}/${localeCode}.ts`]()
        } catch (e) {
          template = await bookingEmailTemplates[`./${type}/en-US.ts`]()
        }

        if (template) {
          const { subject: subjectTemplate, body: bodyTemplate } = template

          if (subjectTemplate !== null && bodyTemplate !== null) {
            const { subject, body } = await compileEmail({
              booking,
              subjectTemplate,
              bodyTemplate,
              localeCode
            })

            return {
              subject,
              body
            }
          }
        }
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  approveBooking: procedure
    .input(
      z.object({
        id: z.number(),
        emailText: z.string(),
        emailSubject: z.string(),
        skipDownPayment: z.boolean().optional()
      })
    )
    .mutation(async ({ input }) => {
      let { emailText, emailSubject } = input
      const { id } = input
      const { skipDownPayment = false } = input
      const booking = await findBooking({
        criteria: {
          id
        },
        fastify
      })

      if (booking) {
        if (!booking.pets.every((pet) => pet.categoryId)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Not all pets have not been assigned to a cateogry'
          })
        }

        if (booking?.customerId) {
          const customer = await findCustomer({
            criteria: {
              id: booking.customerId
            }
          })

          let requiredDownPaymentAmount, invoiceUrl
          if (customer && fastify.slimfact && booking.costs) {
            const result = await createOrUpdateSlimfactInvoice({
              fastify,
              booking,
              customer
            })
            if (!result.success) {
              fastify.log.debug(result.errorMessage)
              await createBookingStatus({
                booking,
                status: BOOKING_STATUS.APPROVED,
                petIds: booking.pets.map((pet) => pet.id)
              })
            }
            if (result.success) {
              invoiceUrl = `https://${slimfactHost}/invoice/${result.invoice.uuid}`
              requiredDownPaymentAmount =
                (booking.costs?.requiredDownPaymentAmount || 0) -
                (booking.invoice?.amountPaid || 0)

              if (skipDownPayment) requiredDownPaymentAmount = 0

              await createBookingStatus({
                booking,
                status:
                  requiredDownPaymentAmount > 0
                    ? BOOKING_STATUS.AWAITING_DOWNPAYMENT
                    : BOOKING_STATUS.APPROVED,
                petIds: booking.pets.map((pet) => pet.id)
              })
            }
          }

          if (customer?.account?.email) {
            if (fastify?.mailer) {
              emailText = handlebars.compile(emailText)({
                invoiceUrl,
                requiredDownPaymentAmount
              })
              emailSubject = handlebars.compile(emailSubject)({
                invoiceUrl,
                requiredDownPaymentAmount
              })
              await fastify.mailer.sendMail({
                from: `Petboarding <noreply@petboarding.app>`,
                replyTo:
                  env.read('MAIL_REPLY_TO') || env.read('VITE_MAIL_REPLY_TO'),
                to: customer.account.email,
                subject: emailSubject,
                html: emailText
              })
            }
          }
        }
        return true
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  rejectBooking: procedure
    .input(
      z.object({
        id: z.number(),
        emailText: z.string(),
        emailSubject: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const { id, emailText, emailSubject } = input
      const booking = await findBooking({
        criteria: {
          id
        }
      })
      if (booking) {
        await createBookingStatus({
          booking,
          status: BOOKING_STATUS.REJECTED,
          petIds: booking.pets.map((pet) => pet.id)
        })
        if (booking?.customerId) {
          const customer = await findCustomer({
            criteria: {
              id: booking.customerId
            }
          })
          if (customer?.account?.email) {
            if (fastify?.mailer) {
              await fastify.mailer.sendMail({
                from: `Petboarding <noreply@petboarding.app>`,
                replyTo:
                  env.read('MAIL_REPLY_TO') || env.read('VITE_MAIL_REPLY_TO'),
                to: customer.account.email,
                subject: emailSubject,
                html: emailText
              })
            }
            return true
          }
        }

        return true
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  standbyBooking: procedure
    .input(
      z.object({
        id: z.number(),
        emailText: z.string(),
        emailSubject: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const { id, emailText, emailSubject } = input
      const booking = await findBooking({
        criteria: {
          id
        }
      })
      if (booking) {
        await createBookingStatus({
          booking,
          status: BOOKING_STATUS.STANDBY,
          petIds: booking.pets.map((pet) => pet.id)
        })
        if (booking?.customerId) {
          const customer = await findCustomer({
            criteria: {
              id: booking.customerId
            }
          })
          if (customer?.account?.email) {
            if (fastify?.mailer) {
              await fastify.mailer.sendMail({
                from: `Petboarding <noreply@petboarding.app>`,
                replyTo:
                  env.read('MAIL_REPLY_TO') || env.read('VITE_MAIL_REPLY_TO'),
                to: customer.account.email,
                subject: emailSubject,
                html: emailText
              })
            }
            return true
          }
        }

        return true
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  replyBooking: procedure
    .input(
      z.object({
        id: z.number(),
        emailText: z.string(),
        emailSubject: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const { id, emailText, emailSubject } = input
      const booking = await findBooking({
        criteria: {
          id
        }
      })
      if (booking) {
        if (booking?.customerId) {
          const customer = await findCustomer({
            criteria: {
              id: booking.customerId
            }
          })
          if (customer?.account?.email) {
            if (fastify?.mailer) {
              await fastify.mailer.sendMail({
                from: `Petboarding <noreply@petboarding.app>`,
                replyTo:
                  env.read('MAIL_REPLY_TO') || env.read('VITE_MAIL_REPLY_TO'),
                to: customer.account.email,
                subject: emailSubject,
                html: emailText
              })
            }
            return true
          }
        }
      }

      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  // getOccupancy: procedure
  //   .input(
  //     z.object({
  //       date: z.string(),
  //       status: z.nativeEnum(BOOKING_STATUS)
  //     })
  //   )
  //   .query(async ({ input }) => {
  //     const { date, status } = input
  //     const parsedDate = parseISO(date)
  //     const from = startOfMonth(parsedDate).toISOString().slice(0, 10)
  //     const until = endOfMonth(parsedDate).toISOString().slice(0, 10)

  //     const bookings = await findBookings({
  //       criteria: {
  //         from,
  //         until,
  //         status
  //       }
  //     })

  //     const occupancy: Record<string, number> =
  //       bookings?.reduce(
  //         (acc, cur) => {
  //           const dates = eachDayOfInterval({
  //             start: new Date(cur.startDate),
  //             end: new Date(cur.endDate)
  //           })
  //           for (const date of dates) {
  //             const dateString = date.toISOString().slice(0, 10)
  //             acc[dateString] = acc[dateString] ? acc[dateString] + 1 : 1
  //           }
  //           return acc
  //         },
  //         {} as Record<string, number>
  //       ) || {}
  //     return occupancy
  //   }),
  updateBookingService: procedure
    .input(bookingService)
    .mutation(async ({ input }) => {
      const { id } = input
      if (id) {
        const updatedBookingService = await updateBookingService(
          {
            id
          },
          {
            comments: input.comments || null,
            price: input.price || null
          }
        )

        const booking = await findBooking({
          criteria: {
            id: updatedBookingService.bookingId
          }
        })
        const customer = await findCustomer({
          criteria: {
            id: booking?.customerId
          }
        })

        if (fastify.slimfact && booking?.costs && customer) {
          const result = await createOrUpdateSlimfactInvoice({
            fastify,
            booking,
            customer
          })
          if (!result.success) fastify.log.debug(result.errorMessage)
        }

        if (updatedBookingService) return updatedBookingService
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  getBookingsCount: procedure
    .input(
      z.object({
        status: z.nativeEnum(BOOKING_STATUS)
      })
    )
    .query(async ({ input }) => {
      const { status } = input
      if (status) {
        const count = await getBookingsCount(status)
        return count
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  settleBookingCancelation: procedure
    .input(
      z.object({
        id: z.number()
      })
    )
    .mutation(async ({ input }) => {
      const { id } = input
      const success = await cancelBooking({ id }, '', true)
      if (success) return true
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  getUnpaidBookings: procedure
    .input(
      z.object({
        days: z.number()
      })
    )
    .query(async ({ input }) => {
      const { days } = input
      const bookings = await findBookings({
        criteria: {
          until: new Date().toISOString().slice(0, 10),
          from: subDays(new Date(), days).toISOString().slice(0, 10),
          statuses: [
            BOOKING_STATUS.APPROVED,
            BOOKING_STATUS.CANCELED,
            BOOKING_STATUS.CANCELED_OUTSIDE_PERIOD
          ]
        }
      })

      const unpaidBookingUuids = bookings
        .map((booking) => booking.invoiceUuid)
        .filter((uuid): uuid is string => !!uuid)
      if (fastify.slimfact && unpaidBookingUuids?.length) {
        const chunkSize = 10
        const unpaidBillUuids: string[] = []
        for (let i = 0; i < unpaidBookingUuids.length; i += chunkSize) {
          const chunk = unpaidBookingUuids.slice(i, i + chunkSize)

          const unpaidBills = await fastify.slimfact.admin.getInvoices.query({
            uuids: chunk,
            status: InvoiceStatus.BILL,
            paid: false
          })

          if (unpaidBills)
            unpaidBillUuids.push(...unpaidBills?.map((bill) => bill.uuid))
        }

        const ids = bookings
          .filter(
            (booking) =>
              booking.invoiceUuid &&
              unpaidBillUuids?.includes(booking.invoiceUuid)
          )
          .map((booking) => booking.id)

        if (ids.length) {
          return findBookings({
            criteria: {
              ids: bookings
                .filter(
                  (booking) =>
                    booking.invoiceUuid &&
                    unpaidBillUuids?.includes(booking.invoiceUuid)
                )
                .map((booking) => booking.id)
            },
            fastify
          })
        }
        return []
      }
    }),
  getBookingInvoices: procedure
    .input(
      z.object({
        days: z.number()
      })
    )
    .query(async ({ input }) => {
      const { days } = input
      const bookings = await findBookings({
        criteria: {
          until: new Date().toISOString().slice(0, 10),
          from: subDays(new Date(), days).toISOString().slice(0, 10),
          status: BOOKING_STATUS.APPROVED
        }
      })
      const unpaidBookingUuids = bookings
        .map((booking) => booking.invoiceUuid)
        .filter((uuid): uuid is string => !!uuid)
      if (fastify.slimfact && unpaidBookingUuids.length) {
        const unpaidBills = await fastify.slimfact.admin.getInvoices.query({
          uuids: unpaidBookingUuids,
          status: InvoiceStatus.BILL,
          paid: false
        })

        const unpaidBillUuids = unpaidBills?.map((bill) => bill.uuid)

        return findBookings({
          criteria: {
            ids: bookings
              .filter(
                (booking) =>
                  booking.invoiceUuid &&
                  unpaidBillUuids?.includes(booking.invoiceUuid)
              )
              .map((booking) => booking.id)
          },
          fastify
        })
      }
    })
})

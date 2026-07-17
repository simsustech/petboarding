import type { FastifyInstance } from 'fastify'
import {
  updateBooking,
  getLastApprovedForBooking
} from '../../repositories/booking.js'
import type { ParsedBooking } from '../../repositories/booking.js'
import { config } from '../../env.js'
import { getLang } from '../../lang/index.js'
import { InvoiceStatus } from '@modular-api/fastify-checkout/types'
import type { Customer } from '../../zod/customer.js'
import {
  computeInvoiceCosts,
  type Invoice
} from '@modular-api/fastify-checkout'
import {
  isBefore,
  isAfter,
  isWithinInterval,
  parse,
  parseISO,
  subMonths,
  subDays,
  differenceInDays
} from 'date-fns'

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

  if (!locale) locale = config.lang
  const lang = await getLang(locale)

  const dateFormatter = (date: Date) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'full',
      timeZone: 'UTC'
    }).format(date)

  let numberPrefixes, companyDetails
  try {
    numberPrefixes = await fastify.slimfact.admin.getNumberPrefixes.query()
    companyDetails = await fastify.slimfact.admin.getCompany.query({
      id: Number(config.slimfactCompanyId)
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

  // ── Compute costs via bookingCostsHandler (includes cancellation/modification branches) ──
  let bookingCostsHandler: import('../../petboarding.d.ts').BookingCostsHandler
  try {
    ;({ bookingCostsHandler } = await import('../../api.config.js'))
  } catch (e) {
    fastify.log.debug(e)
    console.error('Unable to load API config')
    throw new Error('Unable to load API config')
  }

  const lastApprovedBooking = await getLastApprovedForBooking(booking)
  const pets = booking.pets.map((pet) => ({
    ...pet,
    // calculateBookingCosts stores categoryId on the pet in the costs context
    categoryId: pet.categoryId
  }))
  const categories: import('../../zod/category.js').ParsedCategory[] =
    booking.pets
      .map((pet) => pet.category)
      .filter((c): c is NonNullable<typeof c> => !!c)

  const costsResult = bookingCostsHandler({
    period: {
      startDate: booking.startDate,
      endDate: booking.endDate,
      days: booking.days
    },
    pets,
    categories,
    services: booking.services || [],
    withServices: true,
    dateFns: {
      getOverlappingDaysInIntervals: (await import('date-fns'))
        .getOverlappingDaysInIntervals,
      parse,
      isWithinInterval,
      isBefore,
      isAfter,
      parseISO,
      subMonths,
      subDays,
      differenceInDays
    },
    // dateHolidays and surchargeHolidays not available in this path — costs are already pre-computed
    computeInvoiceCosts,
    vacations: [],
    bookingStatus: booking.status?.status,
    lastApprovedBooking: lastApprovedBooking.days
      ? {
          costs: lastApprovedBooking.costs,
          startDate: lastApprovedBooking.startDate,
          endDate: lastApprovedBooking.endDate,
          days: lastApprovedBooking.days
        }
      : undefined,
    ctx: {
      BOOKING_STATUS: (await import('../../zod/booking.js')).BOOKING_STATUS,
      lang
    }
  })

  const { lines, surcharges, discounts, requiredDownPaymentAmount } =
    costsResult

  const notes = `${dateFormatter(new Date(booking.startDate))} ${booking.startTime?.name}
  →
  ${dateFormatter(new Date(booking.endDate))} ${booking.endTime?.name}`

  const host = config.apiHost

  try {
    if (booking.invoiceUuid) {
      const invoice = await fastify.slimfact.admin.updateInvoice.mutate({
        uuid: booking.invoiceUuid,
        companyDetails,
        clientDetails,
        companyPrefix: companyDetails.prefix,
        numberPrefixTemplate:
          companyDetails.defaultNumberPrefixTemplate ||
          numberPrefixes.at(0)?.template,
        currency: config.currency || 'EUR',
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
        },
        replaceExistingLinesOfSameType: true
      })

      return { success: true, invoice }
    } else {
      const invoice = await fastify.slimfact.admin.createInvoice.mutate({
        companyDetails,
        clientDetails,
        companyPrefix: companyDetails.prefix,
        numberPrefixTemplate:
          companyDetails.defaultNumberPrefixTemplate ||
          numberPrefixes.at(0)?.template,
        currency: config.currency || 'EUR',
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
        { id: booking.id },
        {
          booking: { ...booking, invoiceUuid: invoice.uuid },
          petIds: booking.pets.map((pet) => pet.id),
          serviceIds: booking.services.map((service) => service.id)
        },
        { skipStatusUpdate: true }
      )

      return { success: true, invoice }
    }
  } catch (e) {
    return {
      success: false,
      errorMessage: 'Could not create or update booking invoice.'
    }
  }
}

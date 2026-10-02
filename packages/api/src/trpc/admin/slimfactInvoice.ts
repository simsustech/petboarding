import type { FastifyInstance } from 'fastify'
import { updateBooking, findBooking } from '../../repositories/booking.js'
import type { ParsedBooking } from '../../repositories/booking.js'
import { findCustomer } from '../../repositories/customer.js'
import { config } from '../../env.js'
import { BOOKING_STATUS } from '../../zod/booking.js'
import { InvoiceStatus } from '@modular-api/fastify-checkout/types'
import type { Customer } from '../../zod/customer.js'
import { type Invoice } from '@modular-api/fastify-checkout'

/**
 * Abandon the bill this request created after losing the invoice-link race, and
 * hand back the winner's invoice instead.
 *
 * `updateBooking`/`updateCustomerDaycareSubscription` link conditionally
 * (`WHERE invoiceUuid IS NULL`), so a `null` result means another caller linked
 * this row first — nothing references the bill we just created. Cancel it
 * (best-effort: a refused cancel must not turn a successful purchase into an
 * error) and follow the uuid that won.
 *
 * Resolves to `null` when the row has no winning uuid or its invoice cannot be
 * read; callers treat that as an inconsistent state and throw.
 */
export const cancelOrphanAndFollowWinner = async ({
  fastify,
  orphan,
  winnerInvoiceUuid,
  logLabel
}: {
  fastify: FastifyInstance
  orphan: Pick<Invoice, 'id' | 'uuid'>
  winnerInvoiceUuid?: string | null
  logLabel: string
}): Promise<Invoice | null> => {
  if (!fastify.slimfact) return null

  try {
    await fastify.slimfact.admin.setInvoiceStatus.mutate({
      id: orphan.id,
      status: InvoiceStatus.CANCELED
    })
  } catch (cancelError) {
    fastify.log.warn(
      cancelError,
      `${logLabel}: failed to cancel orphan bill ${orphan.uuid}`
    )
  }

  if (!winnerInvoiceUuid) return null

  return fastify.slimfact.admin.getInvoice.query({ uuid: winnerInvoiceUuid })
}

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

  // Bill exactly what the booking view shows. `booking.costs` is the same
  // computation the UI renders — including a modification's cancelation costs
  // — so the invoice can never drift from the displayed costs.
  const costs = booking.costs
  const lines = costs?.lines ?? []
  const discounts = costs?.discounts ?? []
  const surcharges = costs?.surcharges ?? []
  const requiredDownPaymentAmount = costs?.requiredDownPaymentAmount ?? 0

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

      const linkedBooking = await updateBooking(
        { id: booking.id },
        {
          booking: { ...booking, invoiceUuid: invoice.uuid },
          petIds: booking.pets.map((pet) => pet.id),
          serviceIds: booking.services.map((service) => service.id)
        },
        { skipStatusUpdate: true, onlyIfInvoiceUuidNull: true }
      )

      if (!linkedBooking) {
        // Lost a concurrent invoice-creation race: our bill is an orphan, the
        // winner's invoice is linked, so continue on that one.
        const winner = await findBooking({ criteria: { id: booking.id } })
        const winnerInvoice = await cancelOrphanAndFollowWinner({
          fastify,
          orphan: invoice,
          winnerInvoiceUuid: winner?.invoiceUuid,
          logLabel: `slimfactInvoice: booking ${booking.id}`
        })
        if (!winnerInvoice) {
          throw new Error(
            `Booking ${booking.id} invoice was linked concurrently but no invoice found`
          )
        }
        return { success: true, invoice: winnerInvoice }
      }

      return { success: true, invoice }
    }
  } catch (e) {
    fastify.log.error(e)
    fastify.log.error('Failed to create or update SlimFact invoice')
    return {
      success: false,
      errorMessage: 'Could not create or update booking invoice.'
    }
  }
}

/**
 * Keep a booking's SlimFact invoice in step with its own costs after a status
 * change (approve / reject / cancel / standby). Only bookings that were approved
 * — and therefore billed, or awaiting their deposit — have an invoice worth
 * syncing; a booking that is still pending is never invoiced. Guarding on the
 * booking's own status keeps every status transition consistent: the invoice
 * always mirrors the costs the booking view shows.
 *
 * Returns the synced invoice, or null when there was nothing to sync or the
 * sync failed (the failure is logged, never thrown).
 */
export const syncBookingInvoice = async ({
  fastify,
  bookingId
}: {
  fastify: FastifyInstance
  bookingId: number
}): Promise<Invoice | null> => {
  if (!fastify.slimfact) return null

  const booking = await findBooking({ criteria: { id: bookingId }, fastify })
  if (!booking?.costs) return null

  const wasApproved = booking.statuses?.some(
    (status) =>
      status.status === BOOKING_STATUS.APPROVED ||
      status.status === BOOKING_STATUS.AWAITING_DOWNPAYMENT
  )
  if (!booking.invoiceUuid && !wasApproved) return null

  const customer = await findCustomer({ criteria: { id: booking.customerId } })
  if (!customer?.account) return null

  const result = await createOrUpdateSlimfactInvoice({
    fastify,
    booking,
    customer
  })
  if (!result.success) {
    fastify.log.debug(result.errorMessage)
    return null
  }
  return result.invoice
}

import * as z from 'zod'
import { pet } from './pet.js'
import { customer } from './customer.js'
import { openingTime } from './openingtime.js'
import { service } from './service.js'
import { BOOKING_STATUS } from '../kysely/types.js'

export { BOOKING_STATUS }
export const bookingServiceValidation = {
  id: z.number().optional(),
  bookingId: z.number(),
  serviceId: z.number(),
  comments: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
  service: service.optional(),
  listPrice: z.number().nullable().optional()
}
export const bookingService = z.object(bookingServiceValidation).omit({})

// export enum BOOKING_STATUS {
//   PENDING = 'pending',
//   APPROVED = 'approved',
//   REJECTED = 'rejected',
//   STANDBY = 'standby',
//   CANCELED = 'canceled',
//   CANCELED_OUTSIDE_PERIOD = 'canceledoutsideperiod'
// }

export const bookingStatusValidation = {
  bookingId: z.number(),
  status: z.enum(BOOKING_STATUS),
  startDate: z.string(),
  endDate: z.string(),
  startTimeId: z.number(),
  startTime: openingTime.optional(),
  endTimeId: z.number(),
  endTime: openingTime.optional(),
  pets: z.string().array().optional(),
  days: z.number().optional(),
  comments: z.string().optional().nullable(),
  modifiedAt: z.string()
}
export const bookingStatus = z.object(bookingStatusValidation)

export const bookingValidation = {
  id: z.number().optional(),
  startDate: z.string(),
  endDate: z.string(),
  startTimeId: z.number(),
  startTime: openingTime.optional(),
  endTimeId: z.number(),
  endTime: openingTime.optional(),
  petIds: z.number().array(),
  pets: pet.array().optional(),
  days: z.number().optional(),
  comments: z.string().optional().nullable(),
  orderId: z.string().optional(),
  customerId: z.number().optional(),
  customer: customer.optional(),
  status: bookingStatus.optional(),
  statuses: bookingStatus.array().optional(),
  services: bookingService.array().optional(),
  serviceIds: z.number().array().optional(),
  isDoubleBooked: z.boolean().optional(),
  invoiceUuid: z.string().optional().nullable(),
  invoice: z
    .object({
      uuid: z.string(),
      totalIncludingTax: z.number().optional(),
      amountDue: z.number().optional().nullable(),
      amountPaid: z.number().optional().nullable(),
      requiredDownPaymentAmount: z.number().optional().nullable(),
      currency: z.union([z.literal('EUR'), z.literal('USD')])
    })
    .nullable()
    .optional(),
  overlapsWithUnavailablePeriod: z.boolean().optional()
}

export const booking = z.object(bookingValidation)

export type Booking = z.infer<typeof booking>
export type BookingStatus = z.infer<typeof bookingStatus>
export type BookingService = z.infer<typeof bookingService>

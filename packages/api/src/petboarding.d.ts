import type { Category } from './zod/category.js'
import type { BookingPets, BookingService } from './repositories/booking.js'
import type { BOOKING_STATUS } from './zod/booking.js'
import type {
  eachDayOfInterval,
  getOverlappingDaysInIntervals,
  parse,
  isBefore,
  isAfter,
  isWithinInterval,
  parseISO,
  subMonths,
  subDays,
  differenceInDays
} from 'date-fns'
import type Holidays from 'date-holidays'
import {
  type RawInvoiceDiscount,
  type RawInvoiceLine,
  type RawInvoiceSurcharge,
  computeInvoiceCosts
} from '@modular-api/fastify-checkout'

export type BookingCostsHandler = (params: {
  period: {
    startDate: string
    endDate: string
    days: number
  }
  pets: BookingPets
  categories: Category[]
  services: BookingService[]
  withServices?: boolean
  dateFns: {
    eachDayOfInterval?: typeof eachDayOfInterval
    getOverlappingDaysInIntervals: typeof getOverlappingDaysInIntervals
    parse: typeof parse
    isBefore?: typeof isBefore
    isWithinInterval?: typeof isWithinInterval
    parseISO?: typeof parseISO
    subMonths?: typeof subMonths
  }
  dateHolidays?: typeof Holidays
  computeInvoiceCosts?: typeof computeInvoiceCosts
}) => {
  lines: RawInvoiceLine[]
  discounts: RawInvoiceDiscount[]
  surcharges: RawInvoiceSurcharge[]
  requiredDownPaymentAmount?: number
}

export type BookingCancelationHandler = (params: {
  period: {
    startDate: string
    endDate: string
    days: number
  }
  dateFns: {
    getOverlappingDaysInIntervals?: getOverlappingDaysInIntervals
    parse: parse
    isBefore: isBefore
    isAfter: isAfter
    isWithinInterval: isWithinInterval
    parseISO: parseISO
    subMonths: subMonths
    subDays: subDays
    differenceInDays: differenceInDays
  }
  booking: Booking
}) => {
  status: BOOKING_STATUS
  cancelationCosts?: {
    lines: RawInvoiceLine[]
    discounts?: RawInvoiceDiscount[]
    surcharges?: RawInvoiceSurcharge[]
    requiredDownPaymentAmount?: number
  }
}

export interface Configuration {
  bookingCostsHandler?: bookingCostsHandler
}

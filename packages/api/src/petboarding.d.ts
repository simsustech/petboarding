import type { ParsedCategory } from './zod/category.js'
import type { BookingPets, BookingService } from './repositories/booking.js'
import type { BOOKING_STATUS } from './zod/booking.js'
import type {
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
  type computeInvoiceCosts
} from '@modular-api/fastify-checkout'
import { eachDayOfInterval } from './tools.js'

export type BookingCostsHandler = (params: {
  period: {
    startDate: string
    endDate: string
    days: number
    startDayCounted?: number
    endDayCounted?: number
  }
  pets: BookingPets
  categories: ParsedCategory[]
  services: BookingService[]
  withServices?: boolean
  dateFns: {
    eachDayOfInterval?: typeof eachDayOfInterval
    getOverlappingDaysInIntervals: typeof getOverlappingDaysInIntervals
    parse: typeof parse
    isBefore?: typeof isBefore
    isAfter?: typeof isAfter
    isWithinInterval?: typeof isWithinInterval
    parseISO?: typeof parseISO
    subMonths?: typeof subMonths
    subDays?: typeof subDays
    differenceInDays?: typeof differenceInDays
  }
  dateHolidays?: typeof Holidays
  computeInvoiceCosts?: typeof computeInvoiceCosts
  surchargeHolidays?: { rule: string; listPrice?: number }[]
  locale?: string
  country?: string
  requiredDownPaymentAmountFractionOfTotal?: number
  minimumRequiredDownPaymentAmount?: number
  vacations: {
    name: string
    startDate: string
    endDate: string
    surchargePerDay: number
  }[]
  bookingStatus?: string
  lastApprovedBooking?: {
    costs: { totalIncludingTax: number; requiredDownPaymentAmount?: number }
    startDate: string
    endDate: string
    days: number
  }
  ctx?: {
    BOOKING_STATUS: typeof BOOKING_STATUS
    lang?: { booking: { cancelationCosts?: string } }
  }
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
  BOOKING_STATUS: typeof BOOKING_STATUS
  vacations: { name: string; startDate: string; endDate: string }[]
  lang?: {
    cancelationCosts: string
    downPayment: string
  }
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

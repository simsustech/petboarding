import type { Category } from './zod/category.js'
import type { BookingPets, BookingService } from './repositories/booking.js'
import type { BOOKING_STATUS } from './zod/booking.js'
import type {
  eachDayOfInterval,
  getOverlappingDaysInIntervals,
  parse,
  isBefore,
  isWithinInterval,
  parseISO,
  subMonths
} from 'date-fns'
import type Holidays from 'date-holidays'
import type {
  RawInvoiceDiscount,
  RawInvoiceLine,
  RawInvoiceSurcharge
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
}) => {
  lines: RawInvoiceLine[]
  discounts: RawInvoiceDiscount[]
  surcharges: RawInvoiceSurcharge[]
}

export type BookingCancellationHandler = (params: {
  period: {
    startDate: string
    endDate: string
    days: number
  }
  dateFns: {
    getOverlappingDaysInIntervals?: getOverlappingDaysInIntervals
    parse: parse
    isBefore: isBefore
    isWithinInterval: isWithinInterval
    parseISO: parseISO
    subMonths: subMonths
  }
}) => {
  status: BOOKING_STATUS
  cancellationCosts: number
}

export interface Configuration {
  bookingCostsHandler?: bookingCostsHandler
}

import type { Category } from './zod/category.js'
import type { BookingPets, BookingService } from './repositories/booking.js'
import type { BookingCostsItem } from './models/Booking.js'
import type { BOOKING_STATUS } from './zod/booking.js'
import type {
  getOverlappingDaysInIntervals,
  parse,
  isBefore,
  isWithinInterval,
  parseISO,
  subMonths
} from 'date-fns'
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
    getOverlappingDaysInIntervals: getOverlappingDaysInIntervals
    parse: parse
    isBefore?: isBefore
    isWithinInterval?: isWithinInterval
    parseISO?: parseISO
    subMonths?: subMonths
  }
}) => {
  items: BookingCostsItem[]
  total: number
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

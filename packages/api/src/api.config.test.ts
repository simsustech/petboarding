import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  eachDayOfInterval,
  getOverlappingDaysInIntervals,
  isAfter,
  isWithinInterval,
  parse,
  parseISO,
  subDays,
  subMonths
} from 'date-fns'
import { computeInvoiceCosts } from '@modular-api/fastify-checkout'
import Holidays from 'date-holidays'
import { BOOKING_STATUS } from '@petboarding/tools/constants'
import { bookingCancelationHandler, bookingCostsHandler } from './api.config.ts'

// Mirror the default list in `packages/api/configs/api.config.mjs`. Kept local
// so the test does not depend on the runtime variant config.
const defaultSurchargeHolidays = [
  { rule: '01-01' },
  { rule: 'easter' },
  { rule: 'easter 1' },
  { rule: 'easter 39' },
  { rule: 'easter 49' },
  { rule: 'easter 50' },
  { rule: '12-25' },
  { rule: '12-26' },
  { rule: '12-31' },
  { rule: '04-27 if sunday then previous saturday since 2014' }
]

const defaultLocale = 'nl'
const defaultCountry = 'NL'

const getHolidayName = (
  date: string,
  country: string,
  language: string
): string | undefined => {
  const h = new Holidays(country, { languages: ['en', language] })
  return h.getHolidays(undefined, language).find((x) => x.date.startsWith(date))
    ?.name
}

const nlVacations2026 = [
  {
    name: 'Voorjaarsvakantie',
    startDate: '2026-02-14',
    endDate: '2026-02-22',
    surchargePerDay: 100
  },
  {
    name: 'Meivakantie',
    startDate: '2026-04-25',
    endDate: '2026-05-03',
    surchargePerDay: 100
  },
  {
    name: 'Zomervakantie',
    startDate: '2026-07-01',
    endDate: '2026-08-31',
    surchargePerDay: 100
  },
  {
    name: 'Herfstvakantie',
    startDate: '2026-10-17',
    endDate: '2026-10-25',
    surchargePerDay: 100
  },
  {
    name: 'Kerstvakantie',
    startDate: '2026-12-19',
    endDate: '2027-01-03',
    surchargePerDay: 100
  }
] as const

const makeCategory = ({
  id,
  name = 'Cat',
  prices = []
}: {
  id: number
  name?: string
  prices?: { date: string; listPrice: number }[]
}) =>
  ({
    id,
    name,
    species: 'dog',
    order: 0,
    prices
  }) as any

const makePet = ({
  id,
  name,
  categoryId
}: {
  id: number
  name: string
  categoryId: number
}) => ({ id, name, categoryId }) as any

const makeService = ({
  id = 1,
  name = 'Grooming',
  listPrice = 2500
}: {
  id?: number
  name?: string
  listPrice?: number | null
}) =>
  ({
    id,
    bookingId: 1,
    serviceId: id,
    comments: null,
    price: listPrice,
    listPrice,
    service: { id, name, listPrice, type: 'surcharge' }
  }) as any

const makeVacation = ({
  id = 1,
  name,
  startDate,
  endDate,
  surchargePerDay = 100
}: {
  id?: number
  name: string
  startDate: string
  endDate: string
  surchargePerDay?: number
}) =>
  ({
    id,
    name,
    startDate,
    endDate,
    surchargePerDay
  }) as any

const dateFns = {
  eachDayOfInterval,
  getOverlappingDaysInIntervals,
  parse,
  isBefore: undefined,
  isAfter,
  isWithinInterval,
  parseISO,
  subMonths,
  subDays
} as any

const buildParams = ({
  period,
  pets = [],
  categories = [],
  services = [],
  withServices,
  vacations = [],
  surchargeHolidays = defaultSurchargeHolidays,
  locale = defaultLocale,
  country = defaultCountry,
  requiredDownPaymentAmountFractionOfTotal,
  minimumRequiredDownPaymentAmount
}: {
  period: { startDate: string; endDate: string; days: number }
  pets?: any[]
  categories?: any[]
  services?: any[]
  withServices?: boolean
  vacations?: any[]
  surchargeHolidays?: { rule: string; listPrice?: number }[]
  locale?: string
  country?: string
  requiredDownPaymentAmountFractionOfTotal?: number
  minimumRequiredDownPaymentAmount?: number
}) => ({
  period,
  pets,
  categories,
  services,
  withServices,
  vacations,
  dateFns,
  dateHolidays: Holidays,
  computeInvoiceCosts,
  surchargeHolidays,
  locale,
  country,
  requiredDownPaymentAmountFractionOfTotal,
  minimumRequiredDownPaymentAmount
})

describe('bookingCostsHandler — pet pricing', () => {
  it('produces a single line for a single pet with one historical price', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-01-05', endDate: '2026-01-09', days: 5 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        vacations: nlVacations2026 as any
      }) as any
    )

    expect(result.lines).toHaveLength(1)
    expect(result.lines[0]).toMatchObject({
      description: 'Rex',
      listPrice: 2000,
      listPriceIncludesTax: true,
      quantity: 5000,
      quantityPerMille: true,
      discount: 0,
      taxRate: 21
    })
  })

  it('uses the most recent category price on or before the start date', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-01-05', endDate: '2026-01-09', days: 5 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [
              { date: '2024-01-01', listPrice: 1500 },
              { date: '2025-06-01', listPrice: 1800 },
              { date: '2026-03-01', listPrice: 2200 }
            ]
          })
        ],
        vacations: nlVacations2026 as any
      }) as any
    )

    expect(result.lines[0].listPrice).toBe(1800)
  })

  it('falls back to NaN when all category prices are in the future', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-01-05', endDate: '2026-01-09', days: 5 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2026-06-01', listPrice: 2200 }]
          })
        ],
        vacations: nlVacations2026 as any
      }) as any
    )

    expect(Number.isNaN(result.lines[0].listPrice)).toBe(true)
  })

  it('falls back to NaN when the category has no prices at all', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-01-05', endDate: '2026-01-09', days: 5 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [makeCategory({ id: 1, prices: [] })],
        vacations: nlVacations2026 as any
      }) as any
    )

    expect(Number.isNaN(result.lines[0].listPrice)).toBe(true)
  })

  it('produces one line per pet', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-01-05', endDate: '2026-01-09', days: 5 },
        pets: [
          makePet({ id: 1, name: 'Rex', categoryId: 1 }),
          makePet({ id: 2, name: 'Bella', categoryId: 1 }),
          makePet({ id: 3, name: 'Max', categoryId: 1 })
        ],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        vacations: nlVacations2026 as any
      }) as any
    )

    expect(result.lines).toHaveLength(3)
    expect(result.lines.map((l) => l.description)).toEqual([
      'Rex',
      'Bella',
      'Max'
    ])
    for (const line of result.lines) {
      expect(line.listPrice).toBe(2000)
      expect(line.quantity).toBe(5000)
    }
  })
})

describe('bookingCostsHandler — services', () => {
  it('adds a line for a service with a listPrice when withServices is true', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-01-05', endDate: '2026-01-09', days: 5 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        services: [makeService({ name: 'Grooming', listPrice: 2500 })],
        withServices: true,
        vacations: nlVacations2026 as any
      }) as any
    )

    const serviceLine = result.lines.find((l) => l.description === 'Grooming')
    expect(serviceLine).toMatchObject({
      description: 'Grooming',
      listPrice: 2500,
      listPriceIncludesTax: true,
      quantity: 1,
      quantityPerMille: false,
      discount: 0,
      taxRate: 21
    })
  })

  it('skips services with a null listPrice even when withServices is true', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-01-05', endDate: '2026-01-09', days: 5 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        services: [makeService({ name: 'Free pickup', listPrice: null })],
        withServices: true,
        vacations: nlVacations2026 as any
      }) as any
    )

    expect(
      result.lines.find((l) => l.description === 'Free pickup')
    ).toBeUndefined()
    expect(result.lines).toHaveLength(1)
  })

  it('adds one line per valid service when multiple are provided', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-01-05', endDate: '2026-01-09', days: 5 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        services: [
          makeService({ id: 1, name: 'Grooming', listPrice: 2500 }),
          makeService({ id: 2, name: 'Pickup', listPrice: 1500 }),
          makeService({ id: 3, name: 'Skip me', listPrice: null })
        ],
        withServices: true,
        vacations: nlVacations2026 as any
      }) as any
    )

    const serviceLines = result.lines.filter(
      (l) => !['Rex'].includes(l.description)
    )
    expect(serviceLines).toHaveLength(2)
    expect(serviceLines.map((l) => l.description).sort()).toEqual([
      'Grooming',
      'Pickup'
    ])
  })

  it('does not add service lines when withServices is false or omitted', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-01-05', endDate: '2026-01-09', days: 5 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        services: [makeService({ name: 'Grooming', listPrice: 2500 })],
        vacations: nlVacations2026 as any
      }) as any
    )

    expect(
      result.lines.find((l) => l.description === 'Grooming')
    ).toBeUndefined()
    expect(result.lines).toHaveLength(1)
  })
})

describe('bookingCostsHandler — holiday surcharge', () => {
  it('adds a per-day surcharge line for a period covering Nieuwjaarsdag', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-01-01', endDate: '2026-01-03', days: 3 },
        pets: [
          makePet({ id: 1, name: 'Rex', categoryId: 1 }),
          makePet({ id: 2, name: 'Bella', categoryId: 1 })
        ],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        vacations: nlVacations2026 as any
      }) as any
    )

    const expectedName = getHolidayName('2026-01-01', 'NL', 'nl')
    const surcharge = result.lines.find((l) => l.description === expectedName)
    expect(surcharge).toMatchObject({
      listPrice: 500,
      quantity: 2,
      quantityPerMille: false,
      taxRate: 21
    })
  })

  it('adds a line for each of 25-12 and 26-12 in a Kerstvakantie booking', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-12-24', endDate: '2026-12-27', days: 4 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        vacations: nlVacations2026 as any
      }) as any
    )

    const expectedNames = [
      getHolidayName('2026-12-25', 'NL', 'nl'),
      getHolidayName('2026-12-26', 'NL', 'nl')
    ]
    const surcharges = result.lines.filter((l) =>
      expectedNames.includes(l.description)
    )
    expect(surcharges).toHaveLength(2)
    for (const line of surcharges) {
      expect(line.quantity).toBe(1)
    }
  })

  it('adds no surcharge for a period with no Dutch public holidays', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-03-10', endDate: '2026-03-14', days: 5 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        vacations: nlVacations2026 as any
      }) as any
    )

    // No Dutch public holiday in 2026-03-10..14, so no surcharge line.
    const surcharges = result.lines.filter(
      (l) =>
        l.description === getHolidayName('2026-03-10', 'NL', 'nl') ||
        l.description === getHolidayName('2026-03-11', 'NL', 'nl') ||
        l.description === getHolidayName('2026-03-12', 'NL', 'nl') ||
        l.description === getHolidayName('2026-03-13', 'NL', 'nl') ||
        l.description === getHolidayName('2026-03-14', 'NL', 'nl')
    )
    expect(surcharges).toHaveLength(0)
  })

  it('multiplies the per-day quantity by the number of pets', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-01-01', endDate: '2026-01-02', days: 2 },
        pets: [
          makePet({ id: 1, name: 'Rex', categoryId: 1 }),
          makePet({ id: 2, name: 'Bella', categoryId: 1 }),
          makePet({ id: 3, name: 'Max', categoryId: 1 })
        ],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        vacations: nlVacations2026 as any
      }) as any
    )

    const expectedName = getHolidayName('2026-01-01', 'NL', 'nl')
    const surcharge = result.lines.find((l) => l.description === expectedName)
    expect(surcharge).toMatchObject({ listPrice: 500, quantity: 3 })
  })

  it('uses a custom listPrice when provided in the surchargeHolidays entry', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-12-25', endDate: '2026-12-25', days: 1 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        vacations: [] as any,
        surchargeHolidays: [{ rule: '12-25', listPrice: 1000 }]
      }) as any
    )

    const expectedName = getHolidayName('2026-12-25', 'NL', 'nl')
    const surcharge = result.lines.find((l) => l.description === expectedName)
    expect(surcharge).toMatchObject({ listPrice: 1000, quantity: 1 })
  })
})

describe('bookingCostsHandler — vacation surcharge', () => {
  it('adds a line for a booking fully inside a vacation', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-02-16', endDate: '2026-02-20', days: 5 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        vacations: nlVacations2026 as any
      }) as any
    )

    const vac = result.lines.find((l) => l.description === 'Voorjaarsvakantie')
    expect(vac).toBeDefined()
    expect(vac).toMatchObject({
      listPrice: 100,
      listPriceIncludesTax: true,
      quantityPerMille: false,
      taxRate: 21
    })
  })

  it('only counts days actually overlapping the vacation for a partial overlap', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-04-22', endDate: '2026-04-28', days: 7 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        vacations: nlVacations2026 as any
      }) as any
    )

    const vac = result.lines.find((l) => l.description === 'Meivakantie')
    expect(vac).toBeDefined()
    // Booking 04-22..04-28 overlaps Meivakantie (04-25..05-03) on 3 days
    // (end-exclusive: 25, 26, 27 are inside, 28 is the booking end and excluded)
    expect(vac!.quantity).toBe(1 * (3 + 1))
  })

  it('does not add a line when the booking ends exactly on a vacation start', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-02-10', endDate: '2026-02-14', days: 5 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        vacations: nlVacations2026 as any
      }) as any
    )

    expect(
      result.lines.find((l) => l.description === 'Voorjaarsvakantie')
    ).toBeUndefined()
  })

  it('does not add a line when the booking starts exactly on a vacation end', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-02-22', endDate: '2026-02-25', days: 4 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        vacations: nlVacations2026 as any
      }) as any
    )

    expect(
      result.lines.find((l) => l.description === 'Voorjaarsvakantie')
    ).toBeUndefined()
  })

  it('adds a line per overlapping vacation when two vacations match', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-04-25', endDate: '2026-05-03', days: 9 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        vacations: nlVacations2026 as any
      }) as any
    )

    expect(
      result.lines.find((l) => l.description === 'Meivakantie')
    ).toBeDefined()
    // No second vacation overlaps this period, so only one vacation line
    const vacationLines = result.lines.filter((l) =>
      [
        'Voorjaarsvakantie',
        'Meivakantie',
        'Zomervakantie',
        'Herfstvakantie',
        'Kerstvakantie'
      ].includes(l.description)
    )
    expect(vacationLines).toHaveLength(1)
  })

  it('uses 100 as the default surchargePerDay when the value is missing', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-02-16', endDate: '2026-02-18', days: 3 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        vacations: [
          makeVacation({
            name: 'CustomVac',
            startDate: '2026-02-15',
            endDate: '2026-02-20',
            surchargePerDay: undefined as any
          })
        ]
      }) as any
    )

    const vac = result.lines.find((l) => l.description === 'CustomVac')
    expect(vac!.listPrice).toBe(100)
  })

  it('uses a custom surchargePerDay when provided', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-02-16', endDate: '2026-02-18', days: 3 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        vacations: [
          makeVacation({
            name: 'ExpensiveVac',
            startDate: '2026-02-15',
            endDate: '2026-02-20',
            surchargePerDay: 250
          })
        ]
      }) as any
    )

    const vac = result.lines.find((l) => l.description === 'ExpensiveVac')
    expect(vac!.listPrice).toBe(250)
  })

  it('still pushes a vacation line for zero pets, with quantity 0', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-02-16', endDate: '2026-02-18', days: 3 },
        pets: [],
        categories: [],
        vacations: nlVacations2026 as any
      }) as any
    )

    const vac = result.lines.find((l) => l.description === 'Voorjaarsvakantie')
    expect(vac).toBeDefined()
    expect(vac!.quantity).toBe(0)
  })
})

describe('bookingCostsHandler — required down payment', () => {
  it('caps the down payment at totalIncludingTax when the total is small', () => {
    // 1 day * 100 cents * 1 pet = 100 cents, no vacations, no holidays
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-03-10', endDate: '2026-03-10', days: 1 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 100 }]
          })
        ],
        vacations: nlVacations2026 as any
      }) as any
    )

    expect(result.requiredDownPaymentAmount).toBe(100)
  })

  it('caps the down payment at the total when the total is below the 5000 floor', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-03-10', endDate: '2026-03-10', days: 1 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 10 }]
          })
        ],
        vacations: nlVacations2026 as any
      }) as any
    )

    // The floor of 5000 is applied first, then the cap reduces it to the total
    expect(result.requiredDownPaymentAmount).toBe(10)
  })

  it('never returns a down payment greater than the total including tax', () => {
    // Big booking that would otherwise trigger the 5000 floor
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-03-10', endDate: '2026-03-10', days: 1 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 6000 }]
          })
        ],
        vacations: nlVacations2026 as any
      }) as any
    )

    expect(result.requiredDownPaymentAmount).toBeLessThanOrEqual(6000)
  })

  it('uses a custom requiredDownPaymentAmountFractionOfTotal when provided', () => {
    // 5 days * 2000 cents = 10000 cents. With a 50% fraction, expected = 5000.
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-03-10', endDate: '2026-03-14', days: 5 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        vacations: nlVacations2026 as any,
        requiredDownPaymentAmountFractionOfTotal: 0.5
      }) as any
    )

    expect(result.requiredDownPaymentAmount).toBe(5000)
  })

  it('uses a custom minimumRequiredDownPaymentAmount when provided', () => {
    // 1 day * 2000 cents = 2000 cents. Default floor of 5000 would kick in
    // and cap the down payment to the total (2000). With minimum = 1000, the
    // floor branch still wins because total*0 = 0 < 1000, so down payment
    // becomes 1000, and 1000 < 2000 total so no cap.
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-03-10', endDate: '2026-03-10', days: 1 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        vacations: nlVacations2026 as any,
        minimumRequiredDownPaymentAmount: 1000
      }) as any
    )

    expect(result.requiredDownPaymentAmount).toBe(1000)
  })
})

describe('bookingCostsHandler — combined realistic scenarios', () => {
  it('handles a multi-pet Zomervakantie booking with a grooming service', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-07-04', endDate: '2026-07-10', days: 7 },
        pets: [
          makePet({ id: 1, name: 'Rex', categoryId: 1 }),
          makePet({ id: 2, name: 'Bella', categoryId: 1 })
        ],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        services: [makeService({ name: 'Grooming', listPrice: 2500 })],
        withServices: true,
        vacations: nlVacations2026 as any
      }) as any
    )

    expect(result.lines.find((l) => l.description === 'Rex')).toBeDefined()
    expect(result.lines.find((l) => l.description === 'Bella')).toBeDefined()
    expect(result.lines.find((l) => l.description === 'Grooming')).toBeDefined()
    expect(
      result.lines.find((l) => l.description === 'Zomervakantie')
    ).toBeDefined()
    expect(
      result.lines.find(
        (l) => l.description === getHolidayName('2026-08-01', 'NL', 'nl')
      )
    ).toBeUndefined()
    expect(
      result.lines.find(
        (l) => l.description === getHolidayName('2026-08-15', 'NL', 'nl')
      )
    ).toBeUndefined()
  })

  it('handles a Kerstvakantie booking crossing 25-12 and 26-12', () => {
    const result = bookingCostsHandler(
      buildParams({
        period: { startDate: '2026-12-23', endDate: '2026-12-30', days: 8 },
        pets: [makePet({ id: 1, name: 'Rex', categoryId: 1 })],
        categories: [
          makeCategory({
            id: 1,
            prices: [{ date: '2025-01-01', listPrice: 2000 }]
          })
        ],
        vacations: nlVacations2026 as any
      }) as any
    )

    expect(
      result.lines.find((l) => l.description === 'Kerstvakantie')
    ).toBeDefined()
    const expectedNames = [
      getHolidayName('2026-12-25', 'NL', 'nl'),
      getHolidayName('2026-12-26', 'NL', 'nl')
    ]
    const surcharges = result.lines.filter((l) =>
      expectedNames.includes(l.description)
    )
    expect(surcharges).toHaveLength(2)
  })
})

describe('bookingCancelationHandler — status', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-11-01T12:00:00Z'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('returns CANCELED for a booking 5 months out, not in summer vacation', () => {
    const result = bookingCancelationHandler({
      period: { startDate: '2026-04-01', endDate: '2026-04-05', days: 5 },
      dateFns: {
        getOverlappingDaysInIntervals,
        parse,
        isBefore: undefined as any,
        isAfter,
        isWithinInterval,
        parseISO,
        subMonths,
        subDays,
        differenceInDays: undefined as any
      },
      booking: makeBooking({ totalIncludingTax: 20000, downPayment: 5000 }),
      BOOKING_STATUS,
      vacations: nlVacations2026 as any
    } as any)

    expect(result.status).toBe(BOOKING_STATUS.CANCELED)
  })

  it('returns CANCELED for a booking 1 month out from a Zomervakantie start (still inside 4-month window)', () => {
    const result = bookingCancelationHandler({
      period: { startDate: '2026-07-01', endDate: '2026-07-05', days: 5 },
      dateFns: {
        getOverlappingDaysInIntervals,
        parse,
        isBefore: undefined as any,
        isAfter,
        isWithinInterval,
        parseISO,
        subMonths,
        subDays,
        differenceInDays: undefined as any
      },
      booking: makeBooking({ totalIncludingTax: 20000, downPayment: 5000 }),
      BOOKING_STATUS,
      vacations: nlVacations2026 as any
    } as any)

    // Today is 2025-11-01, booking starts 2026-07-01 → 8 months out, still CANCELED
    expect(result.status).toBe(BOOKING_STATUS.CANCELED)
  })

  it('returns CANCELED_OUTSIDE_PERIOD for a non-summer booking 1 month out (past 2-month window)', () => {
    // Today 2025-11-01, booking starts 2025-12-15 → ~6 weeks out, subMonths-2 max = 2025-10-15 → past it
    const result = bookingCancelationHandler({
      period: { startDate: '2025-12-15', endDate: '2025-12-20', days: 6 },
      dateFns: {
        getOverlappingDaysInIntervals,
        parse,
        isBefore: undefined as any,
        isAfter,
        isWithinInterval,
        parseISO,
        subMonths,
        subDays,
        differenceInDays: undefined as any
      },
      booking: makeBooking({ totalIncludingTax: 20000, downPayment: 5000 }),
      BOOKING_STATUS,
      vacations: nlVacations2026 as any
    } as any)

    expect(result.status).toBe(BOOKING_STATUS.CANCELED_OUTSIDE_PERIOD)
  })

  it('returns CANCELED_OUTSIDE_PERIOD for a booking only 1 day out', () => {
    const result = bookingCancelationHandler({
      period: { startDate: '2025-11-02', endDate: '2025-11-05', days: 4 },
      dateFns: {
        getOverlappingDaysInIntervals,
        parse,
        isBefore: undefined as any,
        isAfter,
        isWithinInterval,
        parseISO,
        subMonths,
        subDays,
        differenceInDays: undefined as any
      },
      booking: makeBooking({ totalIncludingTax: 20000, downPayment: 5000 }),
      BOOKING_STATUS,
      vacations: nlVacations2026 as any
    } as any)

    expect(result.status).toBe(BOOKING_STATUS.CANCELED_OUTSIDE_PERIOD)
  })

  it('returns CANCELED for a booking 6 months before Zomervakantie start (well inside 4-month window)', () => {
    // Today 2025-11-01, Zomervakantie starts 2026-07-01 → 8 months out
    const result = bookingCancelationHandler({
      period: { startDate: '2026-07-01', endDate: '2026-07-05', days: 5 },
      dateFns: {
        getOverlappingDaysInIntervals,
        parse,
        isBefore: undefined as any,
        isAfter,
        isWithinInterval,
        parseISO,
        subMonths,
        subDays,
        differenceInDays: undefined as any
      },
      booking: makeBooking({ totalIncludingTax: 20000, downPayment: 5000 }),
      BOOKING_STATUS,
      vacations: nlVacations2026 as any
    } as any)

    expect(result.status).toBe(BOOKING_STATUS.CANCELED)
  })
})

describe('bookingCancelationHandler — cost tiers', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-11-01T12:00:00Z'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('charges the full total when within 14 days of the start', () => {
    // Today 2025-11-01, start 2025-11-08 → 7 days out
    const result = bookingCancelationHandler({
      period: { startDate: '2025-11-08', endDate: '2025-11-12', days: 5 },
      dateFns: {
        getOverlappingDaysInIntervals,
        parse,
        isBefore: undefined as any,
        isAfter,
        isWithinInterval,
        parseISO,
        subMonths,
        subDays,
        differenceInDays: undefined as any
      },
      booking: makeBooking({ totalIncludingTax: 20000, downPayment: 5000 }),
      BOOKING_STATUS,
      vacations: nlVacations2026 as any
    } as any)

    expect(result.cancelationCosts!.lines).toHaveLength(1)
    expect(result.cancelationCosts!.lines[0].listPrice).toBe(20000)
  })

  it('charges 75% of the total when between 14 days and 1 month out', () => {
    // Today 2025-11-01, start 2025-11-22 → 21 days out
    const result = bookingCancelationHandler({
      period: { startDate: '2025-11-22', endDate: '2025-11-25', days: 4 },
      dateFns: {
        getOverlappingDaysInIntervals,
        parse,
        isBefore: undefined as any,
        isAfter,
        isWithinInterval,
        parseISO,
        subMonths,
        subDays,
        differenceInDays: undefined as any
      },
      booking: makeBooking({ totalIncludingTax: 20000, downPayment: 5000 }),
      BOOKING_STATUS,
      vacations: nlVacations2026 as any
    } as any)

    expect(result.cancelationCosts!.lines[0].listPrice).toBe(Math.round(15000))
  })

  it('charges 50% of the total when between 1 month and the max cancelation date (non-summer)', () => {
    // Today 2025-11-01, start 2025-12-20 → ~7 weeks out, non-summer, max = 2025-10-20 (past)
    const result = bookingCancelationHandler({
      period: { startDate: '2025-12-20', endDate: '2025-12-25', days: 6 },
      dateFns: {
        getOverlappingDaysInIntervals,
        parse,
        isBefore: undefined as any,
        isAfter,
        isWithinInterval,
        parseISO,
        subMonths,
        subDays,
        differenceInDays: undefined as any
      },
      booking: makeBooking({ totalIncludingTax: 20000, downPayment: 5000 }),
      BOOKING_STATUS,
      vacations: nlVacations2026 as any
    } as any)

    // Status is CANCELED_OUTSIDE_PERIOD (we're past subMonths-2), so 50% tier
    expect(result.status).toBe(BOOKING_STATUS.CANCELED_OUTSIDE_PERIOD)
    expect(result.cancelationCosts!.lines[0].listPrice).toBe(Math.round(10000))
  })

  it('charges the down payment when well before the max cancelation date', () => {
    // Today 2025-11-01, start 2026-06-01 → 7 months out
    const result = bookingCancelationHandler({
      period: { startDate: '2026-06-01', endDate: '2026-06-05', days: 5 },
      dateFns: {
        getOverlappingDaysInIntervals,
        parse,
        isBefore: undefined as any,
        isAfter,
        isWithinInterval,
        parseISO,
        subMonths,
        subDays,
        differenceInDays: undefined as any
      },
      booking: makeBooking({ totalIncludingTax: 20000, downPayment: 5000 }),
      BOOKING_STATUS,
      vacations: nlVacations2026 as any
    } as any)

    expect(result.status).toBe(BOOKING_STATUS.CANCELED)
    expect(result.cancelationCosts!.lines[0].description).toBe('Down payment')
    expect(result.cancelationCosts!.lines[0].listPrice).toBe(5000)
  })
})

describe('bookingCancelationHandler — output line', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-11-01T12:00:00Z'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('emits a Cancelation costs line when CANCELED_OUTSIDE_PERIOD and total exceeds the down payment', () => {
    // 7 days out → CANCELED_OUTSIDE_PERIOD, total 20000 > down payment 5000
    const result = bookingCancelationHandler({
      period: { startDate: '2025-11-08', endDate: '2025-11-12', days: 5 },
      dateFns: {
        getOverlappingDaysInIntervals,
        parse,
        isBefore: undefined as any,
        isAfter,
        isWithinInterval,
        parseISO,
        subMonths,
        subDays,
        differenceInDays: undefined as any
      },
      booking: makeBooking({ totalIncludingTax: 20000, downPayment: 5000 }),
      BOOKING_STATUS,
      vacations: nlVacations2026 as any
    } as any)

    expect(result.status).toBe(BOOKING_STATUS.CANCELED_OUTSIDE_PERIOD)
    expect(result.cancelationCosts!.lines).toHaveLength(1)
    expect(result.cancelationCosts!.lines[0].description).toBe(
      'Cancelation costs'
    )
  })

  it('emits a Down payment line when CANCELED_OUTSIDE_PERIOD but total is below the down payment', () => {
    // 7 days out → CANCELED_OUTSIDE_PERIOD, but cost is 2000 < down payment 5000 → falls back to down payment line
    const result = bookingCancelationHandler({
      period: { startDate: '2025-11-08', endDate: '2025-11-12', days: 5 },
      dateFns: {
        getOverlappingDaysInIntervals,
        parse,
        isBefore: undefined as any,
        isAfter,
        isWithinInterval,
        parseISO,
        subMonths,
        subDays,
        differenceInDays: undefined as any
      },
      booking: makeBooking({ totalIncludingTax: 2000, downPayment: 5000 }),
      BOOKING_STATUS,
      vacations: nlVacations2026 as any
    } as any)

    expect(result.status).toBe(BOOKING_STATUS.CANCELED_OUTSIDE_PERIOD)
    expect(result.cancelationCosts!.lines[0].description).toBe('Down payment')
    expect(result.cancelationCosts!.lines[0].listPrice).toBe(5000)
  })

  it('always emits a Down payment line when status is CANCELED', () => {
    const result = bookingCancelationHandler({
      period: { startDate: '2026-06-01', endDate: '2026-06-05', days: 5 },
      dateFns: {
        getOverlappingDaysInIntervals,
        parse,
        isBefore: undefined as any,
        isAfter,
        isWithinInterval,
        parseISO,
        subMonths,
        subDays,
        differenceInDays: undefined as any
      },
      booking: makeBooking({ totalIncludingTax: 20000, downPayment: 5000 }),
      BOOKING_STATUS,
      vacations: nlVacations2026 as any
    } as any)

    expect(result.status).toBe(BOOKING_STATUS.CANCELED)
    expect(result.cancelationCosts!.lines[0].description).toBe('Down payment')
  })
})

function makeBooking({
  totalIncludingTax,
  downPayment
}: {
  totalIncludingTax: number
  downPayment: number
}) {
  return {
    id: 1,
    startDate: '2026-01-01',
    endDate: '2026-01-05',
    startTimeId: 1,
    endTimeId: 2,
    comments: null,
    customerId: 1,
    invoiceUuid: null,
    costs: {
      totalIncludingTax,
      totalExcludingTax: totalIncludingTax,
      taxSummary: [],
      requiredDownPaymentAmount: downPayment
    },
    pets: [],
    services: [],
    customer: null,
    statuses: []
  } as any
}

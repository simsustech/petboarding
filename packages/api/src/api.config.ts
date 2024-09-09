import {
  RawInvoiceDiscount,
  RawInvoiceLine,
  RawInvoiceSurcharge
} from '@modular-api/fastify-checkout'
import type {
  BookingCancelationHandler,
  BookingCostsHandler
} from './petboarding.d.ts'
import { BOOKING_STATUS } from './zod/booking.js'
const vacations = [
  {
    name: 'Herfstvakantie',
    startDate: '2019-10-12',
    endDate: '2019-10-20'
  },
  {
    name: 'Kerstvakantie',
    startDate: '2019-12-21',
    endDate: '2020-01-05'
  },
  {
    name: 'Voorjaarsvakantie',
    startDate: '2020-02-22',
    endDate: '2020-03-01'
  },
  {
    name: 'Meivakantie',
    startDate: '2020-04-25',
    endDate: '2020-05-03'
  },
  {
    name: 'Zomervakantie',
    startDate: '2020-07-01',
    endDate: '2020-08-31'
  },
  {
    name: 'Herfstvakantie',
    startDate: '2020-10-17',
    endDate: '2020-10-25'
  },
  {
    name: 'Kerstvakantie',
    startDate: '2020-12-19',
    endDate: '2021-01-03'
  },
  {
    name: 'Voorjaarsvakantie',
    startDate: '2021-02-13',
    endDate: '2021-02-21'
  },
  {
    name: 'Meivakantie',
    startDate: '2021-05-01',
    endDate: '2021-05-09'
  },
  {
    name: 'Zomervakantie',
    startDate: '2021-07-01',
    endDate: '2021-08-31'
  },
  {
    name: 'Herfstvakantie',
    startDate: '2021-10-23',
    endDate: '2021-10-31'
  },
  {
    name: 'Kerstvakantie',
    startDate: '2021-12-25',
    endDate: '2022-01-09'
  },
  {
    name: 'Voorjaarsvakantie',
    startDate: '2022-02-26',
    endDate: '2022-03-06'
  },
  {
    name: 'Meivakantie',
    startDate: '2022-04-30',
    endDate: '2022-05-08'
  },
  {
    name: 'Zomervakantie',
    startDate: '2022-07-01',
    endDate: '2022-08-31'
  },
  {
    name: 'Herfstvakantie',
    startDate: '2022-10-22',
    endDate: '2022-10-30'
  },
  {
    name: 'Kerstvakantie',
    startDate: '2022-12-24',
    endDate: '2023-01-08'
  },
  {
    name: 'Voorjaarsvakantie',
    startDate: '2023-02-18',
    endDate: '2023-02-26'
  },
  {
    name: 'Meivakantie',
    startDate: '2023-04-29',
    endDate: '2023-05-07'
  },
  {
    name: 'Zomervakantie',
    startDate: '2023-07-01',
    endDate: '2023-08-31'
  },
  {
    name: 'Herfstvakantie',
    startDate: '2023-10-14',
    endDate: '2023-10-22'
  },
  {
    name: 'Kerstvakantie',
    startDate: '2023-12-23',
    endDate: '2024-01-07'
  },
  {
    name: 'Voorjaarsvakantie',
    startDate: '2024-02-10',
    endDate: '2024-02-18'
  },
  {
    name: 'Meivakantie',
    startDate: '2024-04-27',
    endDate: '2024-05-05'
  },
  {
    name: 'Zomervakantie',
    startDate: '2024-07-01',
    endDate: '2024-08-31'
  },
  {
    name: 'Herfstvakantie',
    startDate: '2024-10-19',
    endDate: '2024-10-27'
  },
  {
    name: 'Kerstvakantie',
    startDate: '2024-12-21',
    endDate: '2025-01-05'
  },
  {
    name: 'Voorjaarsvakantie',
    startDate: '2025-02-22',
    endDate: '2025-03-02'
  },
  {
    name: 'Meivakantie',
    startDate: '2025-04-26',
    endDate: '2025-05-04'
  },
  {
    name: 'Zomervakantie',
    startDate: '2025-07-01',
    endDate: '2025-08-31'
  },
  {
    name: 'Herfstvakantie',
    startDate: '2025-10-11',
    endDate: '2025-10-19'
  },
  {
    name: 'Kerstvakantie',
    startDate: '2025-12-20',
    endDate: '2026-01-04'
  },
  {
    name: 'Voorjaarsvakantie',
    startDate: '2026-02-14',
    endDate: '2026-02-22'
  },
  {
    name: 'Meivakantie',
    startDate: '2026-04-25',
    endDate: '2026-05-03'
  },
  {
    name: 'Zomervakantie',
    startDate: '2026-07-01',
    endDate: '2026-08-31'
  }
]

const bookingCostsHandler: BookingCostsHandler = ({
  period: { startDate, endDate, days },
  pets,
  categories,
  services,
  withServices,
  dateFns: { eachDayOfInterval, getOverlappingDaysInIntervals, parse },
  dateHolidays,
  computeInvoiceCosts
}) => {
  let lines: RawInvoiceLine[] = []
  const discounts: RawInvoiceDiscount[] = []
  const surcharges: RawInvoiceSurcharge[] = []

  lines = pets.map((pet) => ({
    description: pet.name,
    listPrice:
      categories?.find((category) => category.id === pet.categoryId)?.price ||
      NaN,
    listPriceIncludesTax: true,
    quantity: days * 1000,
    quantityPerMille: true,
    discount: 0,
    taxRate: 21
  }))

  if (withServices) {
    for (const service of services) {
      if (service.service && service.listPrice) {
        lines.push({
          description: service.service?.name,
          listPrice: service.listPrice,
          listPriceIncludesTax: true,
          quantity: 1,
          quantityPerMille: false,
          discount: 0,
          taxRate: 21
        })
      }
    }
  }
  for (const vacationDays of vacations.map((vacation) =>
    getOverlappingDaysInIntervals(
      {
        start: parse(startDate, 'yyyy-MM-dd', new Date()),
        end: parse(endDate, 'yyyy-MM-dd', new Date())
      },
      {
        start: parse(vacation.startDate, 'yyyy-MM-dd', new Date()),
        end: parse(vacation.endDate, 'yyyy-MM-dd', new Date())
      }
    )
  )) {
    if (vacationDays > 0) {
      lines.push({
        description: 'Vacation surcharge',
        listPrice: 100,
        listPriceIncludesTax: true,
        quantity: pets.length * (vacationDays + 1),
        quantityPerMille: false,
        discount: 0,
        taxRate: 21
      })
    }
  }
  if (dateHolidays && eachDayOfInterval) {
    let holidayDays = 0
    const holidays = new dateHolidays()
    const surchargeHolidays: string[] = []
    surchargeHolidays.forEach((holiday) => holidays.setHoliday(holiday, 'en'))
    for (const date of eachDayOfInterval({
      start: parse(startDate, 'yyyy-MM-dd', new Date()),
      end: parse(endDate, 'yyyy-MM-dd', new Date())
    })) {
      if (holidays.isHoliday(date)) {
        holidayDays++
      }
    }
    if (holidayDays) {
      lines.push({
        description: 'Holidays surcharge',
        listPrice: 500,
        listPriceIncludesTax: true,
        quantity: pets.length * holidayDays,
        quantityPerMille: false,
        discount: 0,
        taxRate: 21
      })
    }
  }

  let computedInvoiceCosts
  if (computeInvoiceCosts) {
    computedInvoiceCosts = computeInvoiceCosts({
      lines,
      discounts,
      surcharges
    })
  }

  const requiredDownPaymentAmountFractionOfTotal = 0
  const minimumRequiredDownPaymentAmount = 5000
  let requiredDownPaymentAmount =
    computedInvoiceCosts &&
    computedInvoiceCosts.totalIncludingTax *
      requiredDownPaymentAmountFractionOfTotal >
      minimumRequiredDownPaymentAmount
      ? Math.round(
          computedInvoiceCosts.totalIncludingTax *
            requiredDownPaymentAmountFractionOfTotal
        )
      : minimumRequiredDownPaymentAmount
  if (
    computedInvoiceCosts?.totalIncludingTax &&
    requiredDownPaymentAmount > computedInvoiceCosts?.totalIncludingTax
  ) {
    requiredDownPaymentAmount = computedInvoiceCosts.totalIncludingTax
  }

  return {
    lines,
    discounts,
    surcharges,
    requiredDownPaymentAmount
  }
}

const bookingCancelationHandler: BookingCancelationHandler = ({
  period: { startDate, endDate },
  dateFns: { parse, isAfter, isWithinInterval, parseISO, subMonths, subDays },
  booking
}) => {
  const start = parse(startDate, 'yyyy-MM-dd', new Date())
  const end = parse(endDate, 'yyyy-MM-dd', new Date())

  const summerVacations = vacations.filter(
    (vacation) => vacation.name === 'Zomervakantie'
  )
  let isInSummerVacation = false
  for (const vacation of summerVacations) {
    if (
      isWithinInterval(start, {
        start: parse(vacation.startDate, 'yyyy-MM-dd', new Date()),
        end: parse(vacation.endDate, 'yyyy-MM-dd', new Date())
      }) ||
      isWithinInterval(end, {
        start: parse(vacation.startDate, 'yyyy-MM-dd', new Date()),
        end: parse(vacation.endDate, 'yyyy-MM-dd', new Date())
      })
    ) {
      isInSummerVacation = true
      break
    }
  }

  const maxCancelationDate = subMonths(
    parseISO(startDate),
    isInSummerVacation ? 4 : 2
  )

  const status = isAfter(new Date(), maxCancelationDate)
    ? BOOKING_STATUS.CANCELED_OUTSIDE_PERIOD
    : BOOKING_STATUS.CANCELED

  let bookingCancelationCosts = 0
  if (isAfter(new Date(), subDays(parseISO(startDate), 14))) {
    bookingCancelationCosts = booking.costs.totalIncludingTax
  } else if (isAfter(new Date(), subMonths(parseISO(startDate), 1))) {
    bookingCancelationCosts = booking.costs.totalIncludingTax * 0.75
  } else if (isAfter(new Date(), maxCancelationDate)) {
    bookingCancelationCosts = booking.costs.totalIncludingTax * 0.5
  } else {
    bookingCancelationCosts = booking.costs.requiredDownPaymentAmount || 0
  }

  return {
    status,
    cancelationCosts: {
      lines:
        status === BOOKING_STATUS.CANCELED_OUTSIDE_PERIOD &&
        bookingCancelationCosts > (booking.costs.requiredDownPaymentAmount || 0)
          ? [
              {
                description: 'Cancelation costs',
                listPrice: Math.round(bookingCancelationCosts),
                taxRate: 21,
                listPriceIncludesTax: true,
                discount: 0,
                quantity: 1,
                quantityPerMille: false
              }
            ]
          : [
              {
                description: 'Down payment',
                listPrice: booking.costs.requiredDownPaymentAmount || 0,
                taxRate: 21,
                listPriceIncludesTax: true,
                discount: 0,
                quantity: 1,
                quantityPerMille: false
              }
            ]
    }
  }
}

export { bookingCostsHandler, bookingCancelationHandler }

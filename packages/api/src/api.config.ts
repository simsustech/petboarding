import type {
  RawInvoiceDiscount,
  RawInvoiceLine,
  RawInvoiceSurcharge
} from '@modular-api/fastify-checkout'
import type {
  BookingCancelationHandler,
  BookingCostsHandler
} from './petboarding.d.ts'

const vacations = [
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
  },
  {
    name: 'Herfstvakantie',
    startDate: '2026-10-17',
    endDate: '2026-10-25'
  },
  {
    name: 'Kerstvakantie',
    startDate: '2026-12-19',
    endDate: '2027-01-03'
  },
  {
    name: 'Voorjaarsvakantie',
    startDate: '2027-02-13',
    endDate: '2027-02-21'
  },
  {
    name: 'Meivakantie',
    startDate: '2027-04-24',
    endDate: '2027-05-02'
  },
  {
    name: 'Zomervakantie',
    startDate: '2027-07-01',
    endDate: '2027-08-31'
  },
  {
    name: 'Herfstvakantie',
    startDate: '2027-10-23',
    endDate: '2027-10-31'
  },
  {
    name: 'Kerstvakantie',
    startDate: '2027-12-25',
    endDate: '2028-01-09'
  },
  {
    name: 'Voorjaarsvakantie',
    startDate: '2028-02-26',
    endDate: '2028-03-05'
  },
  {
    name: 'Meivakantie',
    startDate: '2028-04-29',
    endDate: '2028-05-07'
  },
  {
    name: 'Zomervakantie',
    startDate: '2028-07-01',
    endDate: '2028-08-31'
  },
  {
    name: 'Herfstvakantie',
    startDate: '2028-10-21',
    endDate: '2028-10-29'
  },
  {
    name: 'Kerstvakantie',
    startDate: '2028-12-23',
    endDate: '2029-01-07'
  },
  {
    name: 'Voorjaarsvakantie',
    startDate: '2029-02-10',
    endDate: '2029-02-18'
  },
  {
    name: 'Meivakantie',
    startDate: '2029-04-28',
    endDate: '2029-05-06'
  },
  {
    name: 'Zomervakantie',
    startDate: '2029-07-01',
    endDate: '2029-08-31'
  },
  {
    name: 'Herfstvakantie',
    startDate: '2029-10-13',
    endDate: '2029-10-21'
  },
  {
    name: 'Kerstvakantie',
    startDate: '2029-12-22',
    endDate: '2030-01-06'
  },
  {
    name: 'Voorjaarsvakantie',
    startDate: '2030-02-23',
    endDate: '2030-03-03'
  },
  {
    name: 'Meivakantie',
    startDate: '2030-04-27',
    endDate: '2030-05-05'
  },
  {
    name: 'Zomervakantie',
    startDate: '2030-07-01',
    endDate: '2030-08-31'
  }
]

const findActualPrice = ({
  prices,
  date
}: {
  prices?: { date: string; listPrice: number }[]
  date: string
}) => {
  const sortedAndFiltered = prices
    ?.filter((price) => price.date <= date)
    .sort((a, b) => {
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0
    })

  return sortedAndFiltered?.at(0)?.listPrice || NaN
}

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
    listPrice: findActualPrice({
      prices: categories?.find((category) => category.id === pet.categoryId)
        ?.prices,
      date: startDate
    }),
    listPriceIncludesTax: true,
    quantity: days * 1000,
    quantityPerMille: true,
    discount: 0,
    taxRate: 21
  }))

  // // Multiple pets discount
  // lines = lines
  //   .sort((a, b) => b.listPrice - a.listPrice)
  //   .map((item, index) => ({
  //     ...item,
  //     discount:
  //       index > 0
  //         ? Math.round(0.15 *
  //           ((item.listPrice * item.quantity) /
  //             (item.quantityPerMille ? 1000 : 1)))
  //         : 0
  //   }))

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

  let holidayDays = 0
  if (dateHolidays && eachDayOfInterval) {
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

  const vacationDays = vacations
    .map((vacation) =>
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
    )
    .reduce((acc, cur) => {
      if (cur > 0) acc += cur + 1
      return acc
    }, 0)

  if (vacationDays - holidayDays > 0) {
    lines.push({
      description: 'Vacation surcharge',
      listPrice: 100,
      listPriceIncludesTax: true,
      quantity: pets.length * (vacationDays - holidayDays),
      quantityPerMille: false,
      discount: 0,
      taxRate: 21
    })
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
  booking,
  BOOKING_STATUS
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

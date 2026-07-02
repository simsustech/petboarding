import type {
  RawInvoiceDiscount,
  RawInvoiceLine,
  RawInvoiceSurcharge
} from '@modular-api/fastify-checkout/types'
import type {
  BookingCancelationHandler,
  BookingCostsHandler
} from './petboarding.d.ts'

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
  computeInvoiceCosts,
  surchargeHolidays = [],
  locale = 'en-US',
  country = 'NL',
  requiredDownPaymentAmountFractionOfTotal = 0,
  minimumRequiredDownPaymentAmount = 5000,
  vacations
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
    taxRate: 21,
    type: 'petboarding_booking'
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
          taxRate: 21,
          type: 'petboarding_service'
        })
      }
    }
  }

  // Collect the date keys of surcharge holidays so we can subtract them
  // from vacation overlap days (avoiding double-charging).
  const surchargeHolidayDateKeys: string[] = []

  if (dateHolidays && eachDayOfInterval && surchargeHolidays.length > 0) {
    const holidays = new dateHolidays(country, { languages: [locale, 'en'] })
    const localHolidays = holidays.getHolidays(undefined, locale)
    for (const date of eachDayOfInterval({
      start: parse(startDate, 'yyyy-MM-dd', new Date()),
      end: parse(endDate, 'yyyy-MM-dd', new Date())
    })) {
      if (!holidays.isHoliday(date)) continue
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const holiday = localHolidays.find((h) => h.date.startsWith(dateKey))
      if (!holiday) continue
      const matched = surchargeHolidays.find(
        ({ rule }) => rule === holiday.rule
      )
      if (!matched) continue
      surchargeHolidayDateKeys.push(dateKey)
      lines.push({
        description: holiday.name,
        listPrice: matched.listPrice ?? 500,
        listPriceIncludesTax: true,
        quantity: pets.length,
        quantityPerMille: false,
        discount: 0,
        taxRate: 21,
        type: 'petboarding_holiday'
      })
    }
  }

  for (const vacation of vacations) {
    const vacationStart = parse(vacation.startDate, 'yyyy-MM-dd', new Date())
    const vacationEnd = parse(vacation.endDate, 'yyyy-MM-dd', new Date())
    const overlapDays = getOverlappingDaysInIntervals(
      {
        start: parse(startDate, 'yyyy-MM-dd', new Date()),
        end: parse(endDate, 'yyyy-MM-dd', new Date())
      },
      {
        start: vacationStart,
        end: vacationEnd
      }
    )

    // Subtract surcharge holidays that fall within this vacation period
    // to avoid charging both a holiday surcharge and a vacation surcharge
    // for the same day.
    const holidaysInVacation = surchargeHolidayDateKeys.filter((dateKey) => {
      const d = parse(dateKey, 'yyyy-MM-dd', new Date())
      return d >= vacationStart && d <= vacationEnd
    }).length

    const adjustedOverlapDays = overlapDays - holidaysInVacation

    if (adjustedOverlapDays > 0) {
      lines.push({
        description: vacation.name,
        listPrice: vacation.surchargePerDay ?? 100,
        listPriceIncludesTax: true,
        quantity: pets.length * (adjustedOverlapDays + 1),
        quantityPerMille: false,
        discount: 0,
        taxRate: 21,
        type: 'petboarding_vacation'
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
  BOOKING_STATUS,
  vacations
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
                quantityPerMille: false,
                type: 'petboarding_cancelation'
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
                quantityPerMille: false,
                type: 'petboarding_downpayment'
              }
            ]
    }
  }
}

export { bookingCostsHandler, bookingCancelationHandler }

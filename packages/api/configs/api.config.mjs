const findActualPrice = ({ prices, date }) => {
  const sortedAndFiltered = prices
    ?.filter((price) => price.date <= date)
    .sort((a, b) => {
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0
    })
  return sortedAndFiltered?.at(0)?.listPrice || NaN
}

const bookingCostsHandler = ({
  period: { startDate, endDate, days },
  pets,
  categories,
  services,
  withServices,
  dateFns: { eachDayOfInterval, getOverlappingDaysInIntervals, parse },
  dateHolidays,
  computeInvoiceCosts,
  vacations
}) => {
  let lines = []
  const discounts = []
  const surcharges = []

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

  // Multiple pets discount
  lines = lines
    .sort((a, b) => b.listPrice - a.listPrice)
    .map((item, index) => ({
      ...item,
      discount:
        index > 0
          ? Math.round(
              0.15 *
                ((item.listPrice * item.quantity) /
                  (item.quantityPerMille ? 1000 : 1))
            )
          : 0
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

  let holidayDays = 0
  if (dateHolidays && eachDayOfInterval) {
    const holidays = new dateHolidays()
    const surchargeHolidays = [
      '01-01',
      'easter',
      'easter 1',
      'easter 39',
      'easter 49',
      'easter 50',
      'easter -50',
      'easter -49',
      'easter -48',
      'easter -47',
      '12-25',
      '12-26',
      '12-31',
      '04-27 if sunday then previous saturday since 2014'
    ]
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
        description: 'Feestdagen toeslag',
        listPrice: 500,
        listPriceIncludesTax: true,
        quantity: pets.length * holidayDays,
        quantityPerMille: false,
        discount: 0,
        taxRate: 21
      })
    }
  }

  for (const vacation of vacations) {
    const overlapDays = getOverlappingDaysInIntervals(
      {
        start: parse(startDate, 'yyyy-MM-dd', new Date()),
        end: parse(endDate, 'yyyy-MM-dd', new Date())
      },
      {
        start: parse(vacation.startDate, 'yyyy-MM-dd', new Date()),
        end: parse(vacation.endDate, 'yyyy-MM-dd', new Date())
      }
    )

    if (overlapDays > 0) {
      lines.push({
        description: vacation.name,
        listPrice: vacation.surchargePerDay ?? 100,
        listPriceIncludesTax: true,
        quantity: pets.length * (overlapDays + 1),
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

const bookingCancelationHandler = ({
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
                description: 'Annuleringskosten',
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
                description: 'Aanbetaling',
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

export { bookingCancelationHandler, bookingCostsHandler }

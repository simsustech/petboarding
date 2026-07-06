const findActualPrice = ({ prices, date }) => {
  const sortedAndFiltered = prices
    ?.filter((price) => price.date <= date)
    .sort((a, b) => {
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0
    })
  return sortedAndFiltered?.at(0)?.listPrice || NaN
}

const bookingCostsHandler = ({
  period: { startDate, endDate, days, startDayCounted = 1, endDayCounted = 1 },
  pets,
  categories,
  services,
  withServices,
  dateFns: { getOverlappingDaysInIntervals, parse, isWithinInterval },
  dateHolidays,
  computeInvoiceCosts,
  surchargeHolidays = [
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
  ],
  locale = 'en-US',
  country = 'NL',
  requiredDownPaymentAmountFractionOfTotal = 0,
  minimumRequiredDownPaymentAmount = 5000,
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
    taxRate: 21,
    type: 'petboarding_booking'
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
          taxRate: 21,
          type: 'petboarding_service'
        })
      }
    }
  }

  // Collect the date keys of surcharge holidays so we can subtract them
  // from vacation overlap days (avoiding double-charging).
  const surchargeHolidayDateKeys = []
  const bookingStart = parse(startDate, 'yyyy-MM-dd', new Date())
  const bookingEnd = parse(endDate, 'yyyy-MM-dd', new Date())

  if (dateHolidays && surchargeHolidays.length > 0) {
    const holidays = new dateHolidays(country, {
      languages: [locale.slice(0, 2), 'en']
    })

    // Fetch holidays for all years covered by the interval
    const startYear = bookingStart.getFullYear()
    const endYear = bookingEnd.getFullYear()
    const localHolidays = []
    for (let year = startYear; year <= endYear; year++) {
      localHolidays.push(...holidays.getHolidays(year, locale))
    }

    // Check each holiday in the fetched list using isWithinInterval
    for (const holiday of localHolidays) {
      const holidayDate = parse(
        holiday.date.slice(0, 10),
        'yyyy-MM-dd',
        new Date()
      )
      if (
        !isWithinInterval(holidayDate, {
          start: bookingStart,
          end: bookingEnd
        })
      ) {
        continue
      }
      const matched = surchargeHolidays.find(
        ({ rule }) => rule === holiday.rule
      )
      if (!matched) continue
      const dateKey = holiday.date.slice(0, 10)
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
      { start: bookingStart, end: bookingEnd },
      { start: vacationStart, end: vacationEnd }
    )

    // Subtract surcharge holidays that fall within this vacation period
    const holidaysInVacation = surchargeHolidayDateKeys.filter((dateKey) => {
      const d = parse(dateKey, 'yyyy-MM-dd', new Date())
      return isWithinInterval(d, {
        start: vacationStart,
        end: vacationEnd
      })
    }).length

    // Check if start/end day overlap even when no full midnights do
    const startInVacation = isWithinInterval(bookingStart, {
      start: vacationStart,
      end: vacationEnd
    })
    const endInVacation =
      startDate !== endDate &&
      isWithinInterval(bookingEnd, {
        start: vacationStart,
        end: vacationEnd
      })

    const adjustedOverlapDays = overlapDays - holidaysInVacation

    if (adjustedOverlapDays > 0 || startInVacation || endInVacation) {
      let effectiveDays = adjustedOverlapDays + 1
      if (startInVacation) {
        effectiveDays = effectiveDays - 1 + startDayCounted
      }
      if (endInVacation) {
        effectiveDays = effectiveDays - 1 + endDayCounted
      }

      if (effectiveDays > 0) {
        lines.push({
          description: vacation.name,
          listPrice: vacation.surchargePerDay ?? 100,
          listPriceIncludesTax: true,
          quantity: pets.length * effectiveDays,
          quantityPerMille: false,
          discount: 0,
          taxRate: 21,
          type: 'petboarding_vacation'
        })
      }
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
                quantityPerMille: false,
                type: 'petboarding_cancelation'
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
                quantityPerMille: false,
                type: 'petboarding_downpayment'
              }
            ]
    }
  }
}

export { bookingCancelationHandler, bookingCostsHandler }

import type {
  RawInvoiceDiscount,
  RawInvoiceLine,
  RawInvoiceSurcharge
} from '@modular-api/fastify-checkout/types'
import type {
  BookingCancelationHandler,
  BookingCostsHandler
} from './petboarding.d.ts'
import { differenceInDays } from 'date-fns'

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

const bookingCostsHandler: BookingCostsHandler = ({
  period: { startDate, endDate, days, startDayCounted = 1, endDayCounted = 1 },
  pets,
  categories,
  services,
  withServices,
  dateFns: {
    getOverlappingDaysInIntervals,
    parse,
    isWithinInterval,
    isAfter,
    isBefore,
    parseISO,
    subMonths,
    subDays,
    differenceInDays
  },
  dateHolidays,
  computeInvoiceCosts: computeInvoiceCostsFn,
  surchargeHolidays = [],
  locale = 'en-US',
  country = 'NL',
  requiredDownPaymentAmountFractionOfTotal = 0,
  minimumRequiredDownPaymentAmount = 5000,
  vacations,
  bookingStatus,
  lastApprovedBooking,
  ctx
}) => {
  let lines: RawInvoiceLine[] = []
  const discounts: RawInvoiceDiscount[] = []
  const surcharges: RawInvoiceSurcharge[] = []
  let requiredDownPaymentAmount = 0

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

  const surchargeHolidayDateKeys: string[] = []
  const bookingStart = parse(startDate, 'yyyy-MM-dd', new Date())
  const bookingEnd = parse(endDate, 'yyyy-MM-dd', new Date())

  if (dateHolidays && surchargeHolidays.length > 0) {
    const holidays = new dateHolidays(country, {
      languages: [locale.slice(0, 2), 'en']
    })

    const startYear = bookingStart.getFullYear()
    const endYear = bookingEnd.getFullYear()
    const localHolidays: any[] = []
    for (let year = startYear; year <= endYear; year++) {
      localHolidays.push(...holidays.getHolidays(year, locale))
    }

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

    const holidaysInVacation = surchargeHolidayDateKeys.filter((dateKey) => {
      const d = parse(dateKey, 'yyyy-MM-dd', new Date())
      return isWithinInterval(d, {
        start: vacationStart,
        end: vacationEnd
      })
    }).length

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

  // ── Branch on booking status ──────────────────────────────────────────
  if (
    bookingStatus &&
    ctx &&
    (bookingStatus === ctx.BOOKING_STATUS.CANCELED ||
      bookingStatus === ctx.BOOKING_STATUS.CANCELED_OUTSIDE_PERIOD)
  ) {
    // Full cancellation — replace with cancelation costs.
    const ref = lastApprovedBooking ?? {
      costs: {
        totalIncludingTax:
          computeInvoiceCostsFn?.({
            lines,
            discounts,
            surcharges
          }).totalIncludingTax ?? 0,
        requiredDownPaymentAmount: 0
      },
      startDate,
      endDate,
      days
    }

    const { cancelationCosts } = bookingCancelationHandler({
      period: {
        startDate: ref.startDate,
        endDate: ref.endDate,
        days: ref.days
      },
      dateFns: {
        isBefore,
        isAfter,
        isWithinInterval,
        parse,
        parseISO,
        subMonths,
        subDays,
        differenceInDays
      },
      booking: ref,
      BOOKING_STATUS: ctx.BOOKING_STATUS,
      vacations
    })

    if (cancelationCosts) {
      lines = cancelationCosts.lines
      if (cancelationCosts.discounts) discounts.length = 0
      if (cancelationCosts.surcharges) surcharges.length = 0
      if (cancelationCosts.requiredDownPaymentAmount !== undefined) {
        requiredDownPaymentAmount = cancelationCosts.requiredDownPaymentAmount
      }
    }
    return { lines, discounts, surcharges, requiredDownPaymentAmount }
  }

  if (
    bookingStatus === ctx?.BOOKING_STATUS.APPROVED &&
    lastApprovedBooking &&
    computeInvoiceCostsFn &&
    ctx
  ) {
    // Modification surcharge — check if last approved booking is inside the cancellation period.
    const { status, cancelationCosts: refCancelation } =
      bookingCancelationHandler({
        period: {
          startDate: lastApprovedBooking.startDate,
          endDate: lastApprovedBooking.endDate,
          days: lastApprovedBooking.days
        },
        dateFns: {
          isBefore,
          isAfter,
          isWithinInterval,
          parse,
          parseISO,
          subMonths,
          subDays,
          differenceInDays
        },
        booking: lastApprovedBooking,
        BOOKING_STATUS: ctx.BOOKING_STATUS,
        vacations
      })

    if (status === ctx.BOOKING_STATUS.CANCELED_OUTSIDE_PERIOD) {
      const invoiceTotal = computeInvoiceCostsFn({
        lines,
        discounts,
        surcharges
      }).totalIncludingTax
      const cancelationTotal = refCancelation
        ? computeInvoiceCostsFn(refCancelation).totalIncludingTax
        : 0
      const lastApprovedTotal = lastApprovedBooking.costs.totalIncludingTax
      const percentage = cancelationTotal / lastApprovedTotal
      const removedCost = lastApprovedTotal - invoiceTotal
      const cancelationDelta = Math.round(removedCost * percentage)

      if (cancelationDelta > 0 && refCancelation?.lines.at(0)) {
        surcharges.push({
          ...refCancelation.lines.at(0)!,
          description:
            ctx.lang?.booking?.cancelationCosts ?? 'Cancelation costs',
          listPriceIncludesTax: true,
          taxRate: 21,
          listPrice: cancelationDelta
        })
      }
    }
  }

  // ── Compute down payment & return ────────────────────────────────────
  let computedInvoiceCosts
  if (computeInvoiceCostsFn) {
    computedInvoiceCosts = computeInvoiceCostsFn({
      lines,
      discounts,
      surcharges
    })
  }

  requiredDownPaymentAmount =
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

export { bookingCostsHandler, bookingCancelationHandler }

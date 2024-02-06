import {
  OrderDiscount,
  OrderLine,
  OrderSurcharge
} from '@modular-api/fastify-cart'
import type {
  BookingCancellationHandler,
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
  dateHolidays
}) => {
  const discounts: OrderDiscount[] = []
  const surcharges: OrderSurcharge[] = []
  const orderLines: OrderLine[] = pets
    .map((pet) => {
      const price =
        categories?.find((category) => category.id === pet.categoryId)?.price ||
        NaN

      return {
        description: pet.name,
        listPrice: price,
        listPriceIncludesTax: true,
        quantity: days * 1000,
        quantityPerMille: true,
        taxRate: 21,
        discount: 0
      }
    })
    .sort((a, b) => b.listPrice - a.listPrice)
    .map((item) => ({
      ...item,
      discount: 0
    }))
  if (withServices) {
    for (const service of services) {
      if (service.service && service.listPrice) {
        orderLines.push({
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
      orderLines.push({
        description: 'Vacation surcharge',
        listPrice: 100,
        listPriceIncludesTax: true,
        quantity: pets.length * (vacationDays + 1) * 1000,
        quantityPerMille: true,
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
      orderLines.push({
        description: 'Holidays surcharge',
        listPrice: 500,
        listPriceIncludesTax: true,
        quantity: pets.length * holidayDays * 1000,
        quantityPerMille: true,
        discount: 0,
        taxRate: 21
      })
    }
  }

  return {
    orderLines,
    discounts,
    surcharges
  }
}

const bookingCancellationHandler: BookingCancellationHandler = ({
  period: { startDate, endDate },
  dateFns: { parse, isBefore, isWithinInterval, parseISO, subMonths }
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

  const maxCancellationDate = subMonths(
    parseISO(startDate),
    isInSummerVacation ? 4 : 2
  )

  const status = isBefore(new Date(), maxCancellationDate)
    ? BOOKING_STATUS.CANCELLED
    : BOOKING_STATUS.CANCELLED_OUTSIDE_PERIOD

  return {
    status,
    cancellationCosts: 0
  }
}

export { bookingCostsHandler, bookingCancellationHandler }

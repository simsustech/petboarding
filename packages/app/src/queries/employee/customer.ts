import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref } from 'vue'
import { date as dateUtil } from 'quasar'
import {
  CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS,
  DAYCARE_DATE_STATUS
} from '@petboarding/api/zod'

export const useEmployeeGetCustomerQuery = defineQuery(() => {
  const customerId = ref(NaN)
  const daycareDatesFrom = ref('')
  const daycareDatesUntil = ref('')
  const daycareDatesStatus = ref(DAYCARE_DATE_STATUS.APPROVED)

  const { data: customer, ...restCustomer } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['employeeGetCustomer', customerId.value],
    query: () =>
      trpc.employee.getCustomer.query({
        id: customerId.value
      })
  })

  const { data: contactPeople, ...restContactPeople } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['employeeGetContactPeople', customerId.value],
    query: () =>
      trpc.employee.getContactPeopleByCustomerId.query({
        customerId: customerId.value
      })
  })

  const { data: pets, ...restPets } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['employeeGetPets', customerId.value],
    query: () =>
      trpc.employee.getPetsByCustomerId.query({
        customerId: customerId.value
      })
  })

  const { data: bookings, ...restBookings } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['employeeGetBookings', customerId.value],
    query: () =>
      trpc.employee.getBookings.query({
        customerId: customerId.value,
        from: dateUtil
          .subtractFromDate(new Date(), { years: 2 })
          .toISOString()
          .slice(0, 10),
        until: dateUtil
          .addToDate(new Date(), { years: 1 })
          .toISOString()
          .slice(0, 10)
      })
  })

  const {
    data: customerDaycareSubscriptions,
    ...restCustomerDaycareSubscriptions
  } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['employeeGetCustomerDaycareSubscriptions', customerId.value],
    query: () =>
      trpc.employee.getCustomerDaycareSubscriptions.query({
        customerId: customerId.value,
        from: dateUtil
          .subtractFromDate(new Date(), { years: 2 })
          .toISOString()
          .slice(0, 10),
        until: dateUtil
          .addToDate(new Date(), { years: 1 })
          .toISOString()
          .slice(0, 10),
        statuses: [
          CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID,
          CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.OPEN
        ]
      })
  })

  const { data: daycareDates, ...restDaycareDates } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => [
      'employeeGetDaycareDates',
      customerId.value,
      daycareDatesStatus.value,
      daycareDatesFrom.value,
      daycareDatesUntil.value
    ],
    query: () =>
      trpc.employee.getDaycareDates.query({
        customerId: customerId.value,
        from: daycareDatesFrom.value,
        until: daycareDatesUntil.value,
        status: daycareDatesStatus.value
      })
  })

  const rest = {
    refetch: async () => {
      restCustomer.refetch()
      restContactPeople.refetch()
      restPets.refetch()
      restBookings.refetch()
      restCustomerDaycareSubscriptions.refetch()
      restDaycareDates.refetch()
    }
  }

  return {
    customer,
    contactPeople,
    pets,
    bookings,
    customerDaycareSubscriptions,
    daycareDates,
    customerId,
    daycareDatesFrom,
    daycareDatesUntil,
    daycareDatesStatus,
    refetchDaycareDates: restDaycareDates.refetch,
    ...rest
  }
})

export const useEmployeeSearchCustomersQuery = defineQuery(() => {
  const searchPhrase = ref('')
  const customerIds = ref<number[]>([])

  const { data: customers, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => [
      'employeeSearchCustomers',
      searchPhrase.value,
      customerIds.value
    ],
    query: () =>
      trpc.employee.searchCustomers.query({
        ids: customerIds.value,
        searchPhrase: searchPhrase.value
      }),
    placeholderData: () => []
  })

  return {
    customers,
    searchPhrase,
    customerIds,
    ...rest
  }
})

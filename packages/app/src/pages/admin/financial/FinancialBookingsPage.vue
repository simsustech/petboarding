<template>
  <q-page padding>
    <q-toolbar class="q-mb-lg">
      <q-space />

      <q-btn icon="i-mdi-search">
        <q-menu class="q-pa-sm">
          <customer-select
            v-if="filteredCustomers"
            v-model="customerId"
            clearable
            :label="lang.customer.customer"
            :filtered-options="filteredCustomers"
            @filter="onFilterCustomers"
          >
          </customer-select>
          <date-input
            v-model="from"
            :label="capitalizeFirstLetter(lang.booking.from)"
            format="DD-MM-YYYY"
            clearable
            :date="{
              noUnset: true,
              firstDayOfWeek: '1'
            }"
            :icons="{
              event: 'i-mdi-event',
              clear: 'i-mdi-clear'
            }"
          />
          <date-input
            v-model="until"
            :label="capitalizeFirstLetter(lang.booking.until)"
            format="DD-MM-YYYY"
            clearable
            :date="{
              noUnset: true,
              firstDayOfWeek: '1'
            }"
            :icons="{
              event: 'i-mdi-event',
              clear: 'i-mdi-clear'
            }"
          />
        </q-menu>
      </q-btn>
    </q-toolbar>
    <q-table
      :title="lang.bookings.title"
      :rows="data"
      :columns="columns"
      row-key="name"
    >
      <template #bottom-row>
        <q-tr>
          <q-td colspan="3" class="text-right">
            {{ lang.financial.total }}:
          </q-td>
          <q-td class="text-right"
            >{{
              formatPrice({
                currency: 'EUR',
                value: totalAmountPaid['EUR'],
                locale: $q.lang.isoName
              })
            }}
          </q-td>
          <q-td class="text-right"
            >{{
              formatPrice({
                currency: 'EUR',
                value: totalAmountRefunded['EUR'],
                locale: $q.lang.isoName
              })
            }}
          </q-td>
          <q-td class="text-right"
            >{{
              formatPrice({
                currency: 'EUR',
                value: totalAmountDue['EUR'],
                locale: $q.lang.isoName
              })
            }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script lang="ts">
export default {
  name: 'AdminBookingsPage'
}
</script>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useLang } from '../../../lang/index.js'
import { Booking } from '@petboarding/api/zod'
import { DateInput } from '@simsustech/quasar-components/form'
import CustomerSelect from '../../../components/employee/CustomerSelect.vue'
import { type QTableColumn, useQuasar } from 'quasar'
import { computed } from 'vue'
import { useAdminFinancialGetBookingsQuery } from 'src/queries/admin/financial.js'
import { useEmployeeSearchCustomersQuery } from 'src/queries/employee/customer.js'

const $q = useQuasar()
const lang = useLang()

// const customerId = ref<number>()
// const from = ref<string | null>(
//   dateUtil.subtractFromDate(new Date(), { years: 2 }).toISOString().slice(0, 10)
// )

// const until = ref<string | null>(
//   dateUtil.addToDate(new Date(), { years: 1 }).toISOString().slice(0, 10)
// )

const {
  bookings: data,
  refetch: executeBookings,
  customerId,
  from,
  until
} = useAdminFinancialGetBookingsQuery()
// const { data, execute: executeBookings } = useQuery('admin.getBookings', {
//   args: reactive({
//     customerId,
//     from,
//     until,
//     invoice: {
//       status: InvoiceStatus.BILL
//     }
//   }),
//   reactive: {
//     args: true
//   },
//   initialData: []
// })

// const filteredCustomers = ref<Customer[]>([])

const {
  customers: filteredCustomers,
  searchPhrase: customerSearchPhrase,
  customerIds
} = useEmployeeSearchCustomersQuery()

const onFilterCustomers: InstanceType<
  typeof CustomerSelect
>['$props']['onFilter'] = async ({ searchPhrase, ids, done }) => {
  customerSearchPhrase.value = searchPhrase
  customerIds.value = ids
  // const result = useQuery('employee.searchCustomers', {
  //   args: { searchPhrase, ids },
  //   immediate: true
  // })

  // await result.immediatePromise

  // if (result.data.value) filteredCustomers.value = result.data.value

  if (done) done()
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const columns: QTableColumn[] = [
  {
    name: 'customer',
    label: lang.value.customer.customer,
    field: (row) => row.customer,
    format: (val) => [val.firstName, val.lastName].join(' ')
  },
  {
    name: 'startDate',
    label: lang.value.booking.fields.startDate,
    field: (row) => row.startDate,
    format: (val) => `${val}`,
    sortable: true
  },
  {
    name: 'endDate',
    label: lang.value.booking.fields.endDate,
    field: (row) => row.endDate,
    format: (val) => `${val}`,
    sortable: true
  },
  {
    name: 'amountPaid',
    label: lang.value.financial.payment.amountPaid,
    field: (row) => row.invoice,
    format: (val) =>
      formatPrice({
        currency: val.currency,
        value: val.amountPaid,
        locale: $q.lang.isoName
      })
  },
  {
    name: 'amountRefunded',
    label: lang.value.financial.payment.amountRefunded,
    field: (row) => row.invoice,
    format: (val) =>
      formatPrice({
        currency: val.currency,
        value: val.amountRefunded,
        locale: $q.lang.isoName
      })
  },
  {
    name: 'amountDue',
    label: lang.value.financial.payment.amountDue,
    field: (row) => row.invoice,
    format: (val) =>
      formatPrice({
        currency: val.currency,
        value: val.amountDue,
        locale: $q.lang.isoName
      })
  }
]

const currencies = ['EUR']

const totalAmountPaid = computed(() =>
  currencies.reduce(
    (currenciesObj, currency) => {
      currenciesObj[currency] =
        data.value?.reduce((acc, cur: Booking) => {
          if (cur.invoice?.currency === currency)
            acc += cur.invoice.amountPaid || 0
          return acc
        }, 0) || 0
      return currenciesObj
    },
    {} as Record<string, number>
  )
)

const totalAmountRefunded = computed(() =>
  currencies.reduce(
    (currenciesObj, currency) => {
      currenciesObj[currency] =
        data.value?.reduce((acc, cur: Booking) => {
          if (cur.invoice?.currency === currency)
            acc += cur.invoice.amountRefunded || 0
          return acc
        }, 0) || 0
      return currenciesObj
    },
    {} as Record<string, number>
  )
)

const totalAmountDue = computed(() =>
  currencies.reduce(
    (currenciesObj, currency) => {
      currenciesObj[currency] =
        data.value?.reduce((acc, cur: Booking) => {
          if (cur.invoice?.currency === currency)
            acc += cur.invoice.amountDue || 0
          return acc
        }, 0) || 0
      return currenciesObj
    },
    {} as Record<string, number>
  )
)

const formatPrice = ({
  currency,
  value,
  locale
}: {
  currency: string
  value: number
  locale: string
}) =>
  Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    style: 'currency',
    currency: currency
  }).format(value / 100)

onMounted(async () => {
  await executeBookings()
})
</script>

<template>
  <resource-page padding :icons="{ add: 'i-mdi-add', edit: 'i-mdi-edit' }">
    <template #header>
      {{ lang.booking.title }}
    </template>
    <template #header-side>
      <q-btn icon="i-mdi-search">
        <q-menu class="q-pa-sm">
          <customer-select
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
          />
        </q-menu>
      </q-btn>
    </template>
    <q-table
      :title="lang.bookings.title"
      :rows="data"
      :columns="columns"
      row-key="name"
    >
      <template v-slot:bottom-row>
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
  </resource-page>
</template>

<script lang="ts">
export default {
  name: 'AdminBookingsPage'
}
</script>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useLang } from '../../../lang/index.js'
import { Booking, Customer } from '@petboarding/api/zod'
import { createUseTrpc } from '../../../trpc.js'
import { ResourcePage } from '@simsustech/quasar-components'
import { DateInput } from '@simsustech/quasar-components/form'
import CustomerSelect from '../../../components/employee/CustomerSelect.vue'
import { InvoiceStatus } from '@modular-api/fastify-checkout/types'
import { type QTableColumn, useQuasar, date as dateUtil } from 'quasar'
import { computed } from 'vue'

const $q = useQuasar()
const lang = useLang()

const { useQuery } = await createUseTrpc()

const customerId = ref<number>()
const from = ref<string | null>(
  dateUtil.subtractFromDate(new Date(), { years: 2 }).toISOString().slice(0, 10)
)

const until = ref<string | null>(
  dateUtil.addToDate(new Date(), { years: 1 }).toISOString().slice(0, 10)
)

const { data, execute: executeBookings } = useQuery('admin.getBookings', {
  args: reactive({
    customerId,
    from,
    until,
    invoice: {
      status: InvoiceStatus.BILL
    }
  }),
  reactive: {
    args: true
  },
  initialData: []
})

const filteredCustomers = ref<Customer[]>([])

const onFilterCustomers: InstanceType<
  typeof CustomerSelect
>['$props']['onFilter'] = async ({ searchPhrase, ids, done }) => {
  const result = useQuery('employee.searchCustomers', {
    args: { searchPhrase, ids },
    immediate: true
  })

  await result.immediatePromise

  if (result.data.value) filteredCustomers.value = result.data.value

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

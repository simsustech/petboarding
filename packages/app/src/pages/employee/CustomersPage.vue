<template>
  <resource-page>
    <template #header>
      <customer-select
        :model-value="id"
        @update:model-value="setParam"
        :label="lang.search"
        :filtered-options="filteredCustomers"
        @filter="onFilterCustomers"
      >
        <template #before> <q-icon name="search" /> </template>
      </customer-select>
    </template>
    <template #fab>
      <q-btn
        :style="{ visibility: id ? 'visible' : 'hidden' }"
        flat
        style="margin-bottom: -50px; z-index: 5"
        round
        size="lg"
        dense
        icon="add"
        class="q-mr-sm bg-primary text-white"
      >
        <q-menu>
          <q-list>
            <q-item clickable @click="openCreateBookingDialog">
              <q-item-section>
                <q-item-label>
                  {{ lang.booking.booking }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable @click="openCreateDaycareDialog">
              <q-item-section>
                <q-item-label>
                  {{ lang.daycare.daycare }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </template>

    <div style="margin-top: 80px">
      <div class="row q-gutter-md">
        <customer-card
          v-if="data"
          :model-value="data"
          :categories="categories"
          show-edit-button
          use-rating
          @update="openUpdateDialog"
        />

        <q-list v-if="contactPeople">
          <q-item>
            <q-item-section>
              <q-item-label header>
                {{ lang.contactPerson.title }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <contact-person-item
            v-for="contactPerson in contactPeople"
            :key="contactPerson.id"
            :model-value="contactPerson"
          />
        </q-list>

        <q-list v-if="pets">
          <q-item>
            <q-item-section>
              <q-item-label header>{{ lang.pet.title }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat icon="open_in_new" @click="openPets" />
            </q-item-section>
          </q-item>
          <pet-item v-for="pet in pets" :key="pet.id" :model-value="pet" />
        </q-list>
      </div>
      <div class="row">
        <q-list v-if="upcomingBookings" class="col-12 col-md-6">
          <q-item>
            <q-item-section>
              <q-item-label header>{{
                `${lang.booking.title} ${todayFormatted} -> ${untilFormatted}`
              }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat icon="open_in_new" @click="openBookings" />
            </q-item-section>
          </q-item>
          <booking-item
            v-for="booking in upcomingBookings"
            :key="booking.id"
            show-icon
            :model-value="booking"
          />
        </q-list>
        <q-expansion-item v-if="otherBookings" class="col-12 col-md-6">
          <template #header>
            <q-item-label header>
              {{
                `${lang.booking.title} ${fromFormatted} -> ${todayFormatted}`
              }}
            </q-item-label>
          </template>
          <q-list v-if="otherBookings">
            <booking-item
              v-for="booking in otherBookings"
              :key="booking.id"
              show-icon
              :model-value="booking"
            />
          </q-list>
        </q-expansion-item>
      </div>
      <div class="row">
        <customer-daycare-subscriptions-list
          v-if="customerDaycareSubscriptions"
          :model-value="customerDaycareSubscriptions"
        />
      </div>
      <div v-show="id">
        <daycare-calendar-month :events="events" @change-date="onChangeDate">
        </daycare-calendar-month>
        <daycare-status-select v-model="daycareDatesStatus" />
      </div>
    </div>
  </resource-page>

  <responsive-dialog ref="updateDialogRef" persistent @submit="update">
    <customer-form
      ref="updateCustomerFormRef"
      :categories="categories"
      use-comments
      use-food
      use-rating
      use-category
      @submit="updateCustomer"
    ></customer-form>
  </responsive-dialog>

  <responsive-dialog
    ref="createBookingDialogRef"
    persistent
    @submit="submitBooking"
  >
    <booking-form
      ref="createBookingFormRef"
      :pets="pets"
      :services="services"
      allow-hidden-services
      ignore-terms-and-conditions
      hide-approved-after-down-payment
      allow-past-dates
      @submit="createBooking"
    ></booking-form>
  </responsive-dialog>

  <responsive-dialog
    ref="createDaycareDialogRef"
    persistent
    @submit="submitDaycare"
  >
    <daycare-form
      ref="createDaycareFormRef"
      :pets="pets"
      @submit="createDaycare"
      ignore-terms-and-conditions
    ></daycare-form>
  </responsive-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed, watch } from 'vue'
import { createUseTrpc } from '../../trpc.js'
import CustomerSelect from '../../components/employee/CustomerSelect.vue'
import CustomerCard from '../../components/customer/CustomerCard.vue'
import CustomerForm from '../../components/customer/CustomerForm.vue'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { date as dateUtil, extend } from 'quasar'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import BookingItem from '../../components/booking/BookingItem.vue'
import PetItem from '../../components/pet/PetItem.vue'
import ContactPersonItem from '../../components/contactperson/ContactPersonItem.vue'
import { useLang } from '../../lang/index.js'
import DaycareCalendarMonth from '../../components/daycare/DaycareCalendarMonth.vue'
import {
  BOOKING_STATUS,
  Customer,
  CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS,
  DAYCARE_DATE_STATUS
} from '@petboarding/api/zod'
import { DAYCARE_DATE_COLORS, DAYCARE_DATE_ICONS } from '../../configuration.js'
import DaycareStatusSelect from '../../components/daycare/DaycareStatusSelect.vue'
import BookingForm from '../../components/booking/BookingForm.vue'
import DaycareForm from '../../components/daycare/DaycareForm.vue'
import { ResourcePage } from '@simsustech/quasar-components'
import CustomerDaycareSubscriptionsList from '../../components/daycareSubscription/CustomerDaycareSubscriptionsList.vue'
import { useQuasar } from 'quasar'
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

const route = useRoute()
const router = useRouter()
const lang = useLang()
const $q = useQuasar()
const { useQuery, useMutation } = await createUseTrpc()

const id = ref(Number(route.params.id))
onBeforeRouteUpdate((to) => {
  if (to.params.id) {
    id.value = Number(to.params.id)
  }
})

const setParam = (id: number) => router.push({ params: { id } })
const { data, execute } = useQuery('employee.getCustomer', {
  args: reactive({ id }),
  reactive: {
    args: true
  }
})

const dateFormatter = (date: Date) =>
  new Intl.DateTimeFormat($q.lang.isoName, {
    dateStyle: 'full',
    timeZone: 'UTC'
  }).format(date)

const from = dateUtil.subtractFromDate(new Date(), { years: 2 })

const until = dateUtil.addToDate(new Date(), { years: 1 })

const todayFormatted = computed(() => dateFormatter(new Date()))
const fromFormatted = computed(() => dateFormatter(from))
const untilFormatted = computed(() => dateFormatter(until))
const { data: bookings, execute: executeBookings } = useQuery(
  'employee.getBookings',
  {
    args: reactive({
      from: from.toISOString().slice(0, 10),
      until: until.toISOString().slice(0, 10),
      customerId: id
    }),
    reactive: {
      args: true
    }
  }
)

const { data: pets, execute: executePets } = useQuery(
  'employee.getPetsByCustomerId',
  {
    args: reactive({ customerId: id }),
    reactive: {
      args: true
    }
  }
)

const { data: contactPeople, execute: executeContactPeople } = useQuery(
  'employee.getContactPeopleByCustomerId',
  {
    args: reactive({ customerId: id }),
    reactive: {
      args: true
    }
  }
)

const {
  data: customerDaycareSubscriptions,
  execute: executeCustomerDaycareSubscriptions
} = useQuery('employee.getCustomerDaycareSubscriptions', {
  args: reactive({
    from: from.toISOString().slice(0, 10),
    until: until.toISOString().slice(0, 10),
    customerId: id,
    statuses: [
      CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID,
      CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.OPEN
    ]
  }),
  reactive: {
    args: true
  }
})

const { data: categories, execute: executeCategories } = useQuery(
  'public.getCategories',
  {
    // immediate: true
  }
)

const { data: services, execute: executeServices } =
  useQuery('public.getServices')

const upcomingBookings = computed(() =>
  bookings.value?.filter(
    (booking) =>
      (booking.status?.status === BOOKING_STATUS.APPROVED ||
        booking.status?.status === BOOKING_STATUS.PENDING ||
        booking.status?.status === BOOKING_STATUS.AWAITING_DOWNPAYMENT) &&
      booking.endDate >= new Date().toISOString().slice(0, 10)
  )
)
const otherBookings = computed(() =>
  bookings.value?.filter(
    (booking) =>
      !upcomingBookings.value
        ?.map((upcomingBooking) => upcomingBooking.id)
        .includes(booking.id)
  )
)

const daycareDatesFrom = ref('')
const daycareDatesUntil = ref('')
const daycareDatesStatus = ref(DAYCARE_DATE_STATUS.APPROVED)
const onChangeDate: InstanceType<
  typeof DaycareCalendarMonth
>['$props']['onChangeDate'] = (data) => {
  daycareDatesFrom.value = data.start
  daycareDatesUntil.value = data.end
}
const { data: daycareDates, execute: executeDaycareDates } = useQuery(
  'employee.getDaycareDates',
  {
    args: reactive({
      customerId: id,
      from: daycareDatesFrom,
      until: daycareDatesUntil,
      status: daycareDatesStatus
    }),
    reactive: false
  }
)
watch(
  [id, daycareDatesFrom, daycareDatesUntil, daycareDatesStatus],
  ([
    newId,
    newDaycareDatesFrom,
    newDaycareDatesUntil,
    newDaycareDatesStatus
  ]) => {
    if (
      newId &&
      newDaycareDatesFrom &&
      newDaycareDatesUntil &&
      newDaycareDatesStatus
    )
      executeDaycareDates()
  }
)
const events = computed(() =>
  daycareDates.value?.map((daycareDate) => ({
    id: daycareDate.id,
    bgcolor: DAYCARE_DATE_COLORS[daycareDate.status],
    title: daycareDate.pets.map((pet) => pet.name).join(', '),
    petNames: daycareDate.pets.map((pet) => pet.name),
    petIds: daycareDate.pets.map((pet) => pet.id),
    date: daycareDate.date,
    details: daycareDate.customer?.lastName,
    // details: lang.value.daycare.status[daycareDate.status],
    icon: DAYCARE_DATE_ICONS[daycareDate.status]
  }))
)

const updateDialogRef = ref<typeof ResponsiveDialog>()
const updateCustomerFormRef = ref<typeof CustomerForm>()
const openUpdateDialog: InstanceType<
  typeof CustomerCard
>['$props']['onUpdate'] = ({ data }) => {
  updateDialogRef.value?.functions.open()
  nextTick(() => {
    updateCustomerFormRef.value?.functions.setValue(data)
  })
}

const update: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterUpdate = (success?: boolean) => {
    done(success)
    execute()
  }
  updateCustomerFormRef.value?.functions.submit({ done: afterUpdate })
}

const updateCustomer: InstanceType<
  typeof CustomerForm
>['$props']['onSubmit'] = async ({ customer, done }) => {
  customer = extend(true, {}, customer)
  delete customer.customerId

  const result = useMutation('employee.updateCustomer', {
    args: customer as WithRequired<typeof customer, 'id'>,
    immediate: true
  })

  await result.immediatePromise

  done(!result.error.value)
}

const openBookings = () =>
  router.push({
    path: `/employee/bookings/${bookings.value
      ?.map((booking) => booking.id)
      .join('/')}`
  })

const openPets = () =>
  router.push({
    path: `/employee/pets/${pets.value?.map((pet) => pet.id).join('/')}`
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

const createBookingFormRef = ref<typeof BookingForm>()
const createBookingDialogRef = ref<typeof ResponsiveDialog>()
const openCreateBookingDialog = () => {
  createBookingDialogRef.value?.functions.open()
}

const createBooking: InstanceType<
  typeof BookingForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  delete data.customerId

  const result = useMutation('employee.createBooking', {
    args: { ...data, customerId: id.value } as WithRequired<typeof data, 'id'>,
    immediate: true
  })

  await result.immediatePromise

  done(!result.error.value)
  if (!result.error.value) {
    await executeBookings()
  }
}

const submitBooking: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterCreate = (success?: boolean) => {
    done(success)
    execute()
  }
  createBookingFormRef.value?.functions.submit({ done: afterCreate })
}

const createDaycareFormRef = ref<typeof DaycareForm>()
const createDaycareDialogRef = ref<typeof ResponsiveDialog>()

const openCreateDaycareDialog = () => {
  createDaycareDialogRef.value?.functions.open()
}

const submitDaycare: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterCreate = (success?: boolean) => {
    done(success)
    execute()
  }
  createDaycareFormRef.value?.functions.submit({ done: afterCreate })
}

const createDaycare: InstanceType<
  typeof DaycareForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  const result = useMutation('employee.createDaycareDates', {
    args: data.map((daycareDate) => ({
      ...daycareDate,
      customerId: id.value
    })),
    immediate: true
  })

  await result.immediatePromise

  if (!result.error.value) {
    await executeDaycareDates()
  }
  done(!result.error.value)
}

onMounted(async () => {
  await executeCategories()
  if (route.params.id) {
    await Promise.all([
      execute(),
      executeContactPeople(),
      executePets(),
      executeBookings(),
      executeServices(),
      executeCustomerDaycareSubscriptions()
    ])
  }
})
</script>

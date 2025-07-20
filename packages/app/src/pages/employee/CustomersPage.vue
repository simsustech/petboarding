<template>
  <q-page padding>
    <q-toolbar class="q-mb-lg">
      <customer-select
        v-if="filteredCustomers"
        :model-value="id"
        standout
        rounded
        :filled="false"
        :label="lang.search"
        :filtered-options="filteredCustomers"
        @update:model-value="setParam"
        @filter="onFilterCustomers"
      >
        <template #prepend> <q-icon name="i-mdi-search" /> </template>
      </customer-select>
    </q-toolbar>

    <div class="grid grid-cols-12 gap-3">
      <customer-card
        v-if="data"
        class="col-span-12 md:col-span-4"
        :model-value="data"
        show-edit-button
        use-rating
        @update="openUpdateDialog"
      />

      <q-card v-if="contactPeople" class="col-span-12 md:col-span-4">
        <q-list>
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
      </q-card>

      <q-card v-if="pets" class="col-span-12 md:col-span-4">
        <q-card-section class="row justify-between">
          {{ lang.pet.title }}
          <q-btn outline icon="i-mdi-open-in-new" @click="openPets" />
        </q-card-section>
        <q-card-section>
          <q-list>
            <!-- <q-item>
              <q-item-section>
              <q-item-label header>{{ lang.pet.title }}</q-item-label>
            </q-item-section>
              <q-item-section side>
              <q-btn flat icon="i-mdi-open-in-new" @click="openPets" />
            </q-item-section>
            </q-item> -->
            <pet-item v-for="pet in pets" :key="pet.id" :model-value="pet" />
          </q-list>
        </q-card-section>
      </q-card>

      <q-card v-if="id" class="col-span-12">
        <q-card-section class="text-right q-gutter-x-md">
          <q-btn
            :label="lang.booking.labels.addBooking"
            icon="i-mdi-add"
            outline
            color="primary"
            @click="openCreateBookingDialog"
          />
          <q-btn outline icon="i-mdi-open-in-new" @click="openBookings" />
        </q-card-section>
        <q-card-section>
          <q-list v-if="upcomingBookings" class="col-12 col-md-6">
            <q-item>
              <q-item-section>
                <q-item-label header>{{
                  `${lang.booking.title} ${todayFormatted} -> ${untilFormatted}`
                }}</q-item-label>
              </q-item-section>
              <!-- <q-item-section side>
              <q-btn
                :label="lang.open"
                flat
                icon="i-mdi-open-in-new"
                @click="openBookings"
              />
            </q-item-section> -->
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
        </q-card-section>

        <!-- <q-card-actions align="right" class="q-my-md q-px-md">
        <q-btn
          :label="lang.booking.labels.addBooking"
          icon="i-mdi-add"
          color="primary"
          @click="openCreateBookingDialog"
        />
      </q-card-actions> -->
      </q-card>

      <q-card v-if="id" class="col-span-12 q-pa-md">
        <q-card-section class="text-right">
          <q-btn
            :label="lang.daycare.labels.addDaycare"
            icon="i-mdi-add"
            outline
            color="primary"
            @click="openCreateDaycareDialog"
          />
        </q-card-section>
        <q-card-section>
          <customer-daycare-subscriptions-list
            v-if="customerDaycareSubscriptions"
            :model-value="customerDaycareSubscriptions"
            :opened="true"
          />
        </q-card-section>
        <q-card-section>
          <daycare-calendar-month
            :events="events"
            :disabled-weekdays="configuration.DAYCARE_DISABLED_WEEKDAYS"
            @change-date="onChangeDate"
          >
            <template #navigation>
              <daycare-status-select v-model="daycareDatesStatus" />
            </template>
          </daycare-calendar-month>
        </q-card-section>

        <!-- <q-card-actions align="right" class="q-px-md">
        <q-btn
          :label="lang.daycare.labels.addDaycare"
          icon="i-mdi-add"
          color="primary"
          @click="openCreateDaycareDialog"
        />
      </q-card-actions> -->
      </q-card>
    </div>
  </q-page>

  <responsive-dialog
    ref="updateDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="update"
  >
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
    padding
    :icons="{ close: 'i-mdi-close' }"
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
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="submitDaycare"
  >
    <daycare-form
      ref="createDaycareFormRef"
      :pets="pets"
      ignore-terms-and-conditions
      allow-past-dates
      @submit="createDaycare"
    ></daycare-form>
  </responsive-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
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
import { BOOKING_STATUS } from '@petboarding/api/zod'
import { DAYCARE_DATE_COLORS, DAYCARE_DATE_ICONS } from '../../configuration.js'
import DaycareStatusSelect from '../../components/daycare/DaycareStatusSelect.vue'
import BookingForm from '../../components/booking/BookingForm.vue'
import DaycareForm from '../../components/daycare/DaycareForm.vue'
import CustomerDaycareSubscriptionsList from '../../components/daycareSubscription/CustomerDaycareSubscriptionsList.vue'
import { useQuasar } from 'quasar'
import { useConfiguration } from '../../configuration.js'
import {
  useEmployeeGetCustomerQuery,
  useEmployeeSearchCustomersQuery
} from 'src/queries/employee/customer.js'
import {
  usePublicGetCategories,
  usePublicGetServicesQuery
} from 'src/queries/public.js'
import { useEmployeeCreateBookingMutation } from 'src/mutations/employee/booking.js'
import { useEmployeeCreateDaycareDatesMutation } from 'src/mutations/employee/daycareDate.js'
import { useEmployeeUpdateCustomerMutation } from 'src/mutations/employee/customer.js'

const configuration = useConfiguration()
const route = useRoute()
const router = useRouter()
const lang = useLang()
const $q = useQuasar()

// const id = ref(Number(route.params.id))
onBeforeRouteUpdate((to) => {
  if (to.params.id) {
    id.value = Number(to.params.id)
    execute()
  }
})

const setParam = (id: number) => router.push({ params: { id } })

// const { data, execute } = useQuery('employee.getCustomer', {
//   args: reactive({ id }),
//   reactive: {
//     args: true
//   }
// })

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

const {
  customer: data,
  contactPeople,
  pets,
  bookings,
  customerDaycareSubscriptions,
  daycareDates,
  daycareDatesFrom,
  daycareDatesUntil,
  daycareDatesStatus,
  customerId: id,
  refetch: execute
} = useEmployeeGetCustomerQuery()

const { services, refetch: executeServices } = usePublicGetServicesQuery()
const { categories, refetch: executeCategories } = usePublicGetCategories()

const { mutateAsync: updateCustomerMutation } =
  useEmployeeUpdateCustomerMutation()

if (route.params.id) id.value = Number(route.params.id)
// const { data: bookings, execute: executeBookings } = useQuery(
//   'employee.getBookings',
//   {
//     args: reactive({
//       from: from.toISOString().slice(0, 10),
//       until: until.toISOString().slice(0, 10),
//       customerId: id
//     }),
//     reactive: {
//       args: true
//     }
//   }
// )

// const { data: pets, execute: executePets } = useQuery(
//   'employee.getPetsByCustomerId',
//   {
//     args: reactive({ customerId: id }),
//     reactive: {
//       args: true
//     }
//   }
// )

// const { data: contactPeople, execute: executeContactPeople } = useQuery(
//   'employee.getContactPeopleByCustomerId',
//   {
//     args: reactive({ customerId: id }),
//     reactive: {
//       args: true
//     }
//   }
// )

// const {
//   data: customerDaycareSubscriptions,
//   execute: executeCustomerDaycareSubscriptions
// } = useQuery('employee.getCustomerDaycareSubscriptions', {
//   args: reactive({
//     from: from.toISOString().slice(0, 10),
//     until: until.toISOString().slice(0, 10),
//     customerId: id,
//     statuses: [
//       CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID,
//       CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.OPEN
//     ]
//   }),
//   reactive: {
//     args: true
//   }
// })

// const { data: categories, execute: executeCategories } = useQuery(
//   'public.getCategories',
//   {
//     // immediate: true
//   }
// )

// const { data: services, execute: executeServices } =
//   useQuery('public.getServices')

const upcomingBookings = computed(() =>
  bookings.value
    ?.filter(
      (booking) =>
        (booking.status?.status === BOOKING_STATUS.APPROVED ||
          booking.status?.status === BOOKING_STATUS.PENDING ||
          booking.status?.status === BOOKING_STATUS.AWAITING_DOWNPAYMENT) &&
        booking.endDate >= new Date().toISOString().slice(0, 10)
    )
    .sort((a, b) => (a.startDate > b.startDate ? -1 : 1))
)
const otherBookings = computed(() =>
  bookings.value
    ?.filter(
      (booking) =>
        !upcomingBookings.value
          ?.map((upcomingBooking) => upcomingBooking.id)
          .includes(booking.id)
    )
    .sort((a, b) => (a.startDate > b.startDate ? -1 : 1))
)

// const daycareDatesFrom = ref('')
// const daycareDatesUntil = ref('')
// const daycareDatesStatus = ref(DAYCARE_DATE_STATUS.APPROVED)
const onChangeDate: InstanceType<
  typeof DaycareCalendarMonth
>['$props']['onChangeDate'] = (data) => {
  daycareDatesFrom.value = data.start
  daycareDatesUntil.value = data.end
}
// const { data: daycareDates, execute: executeDaycareDates } = useQuery(
//   'employee.getDaycareDates',
//   {
//     args: reactive({
//       customerId: id,
//       from: daycareDatesFrom,
//       until: daycareDatesUntil,
//       status: daycareDatesStatus
//     }),
//     reactive: false
//   }
// )
// watch(
//   [id, daycareDatesFrom, daycareDatesUntil, daycareDatesStatus],
//   ([
//     newId,
//     newDaycareDatesFrom,
//     newDaycareDatesUntil,
//     newDaycareDatesStatus
//   ]) => {
//     if (
//       newId &&
//       newDaycareDatesFrom &&
//       newDaycareDatesUntil &&
//       newDaycareDatesStatus
//     )
//       executeDaycareDates()
//   }
// )
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

  try {
    await updateCustomerMutation(customer)

    done()
    await execute()
  } catch (e) {
    console.error(e)
  }

  // const result = useMutation('employee.updateCustomer', {
  //   args: customer as WithRequired<typeof customer, 'id'>,
  //   immediate: true
  // })

  // await result.immediatePromise

  // done(!result.error.value)
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

const {
  customers: filteredCustomers,
  searchPhrase: customerSearchPhrase,
  customerIds,
  refetch: refetchSearchCustomers
} = useEmployeeSearchCustomersQuery()

const { mutateAsync: createBookingMutation } =
  useEmployeeCreateBookingMutation()
const { mutateAsync: createDaycareDatesMutation } =
  useEmployeeCreateDaycareDatesMutation()

// const filteredCustomers = ref<Customer[]>([])

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

const createBookingFormRef = ref<typeof BookingForm>()
const createBookingDialogRef = ref<typeof ResponsiveDialog>()
const openCreateBookingDialog = () => {
  createBookingDialogRef.value?.functions.open()
}

const createBooking: InstanceType<
  typeof BookingForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  delete data.customerId

  try {
    await createBookingMutation({
      ...data,
      customerId: id.value
    })

    done()
    await execute()
  } catch (e) {
    console.error(e)
  }

  // const result = useMutation('employee.createBooking', {
  //   args: { ...data, customerId: id.value } as WithRequired<typeof data, 'id'>,
  //   immediate: true
  // })

  // await result.immediatePromise

  // done(!result.error.value)
  // if (!result.error.value) {
  //   await executeBookings()
  // }
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
  try {
    await createDaycareDatesMutation(
      data.map((daycareDate) => ({
        ...daycareDate,
        customerId: id.value
      }))
    )

    done()
    await execute()
  } catch (e) {
    console.error(e)
  }

  // const result = useMutation('employee.createDaycareDates', {
  //   args: data.map((daycareDate) => ({
  //     ...daycareDate,
  //     customerId: id.value
  //   })),
  //   immediate: true
  // })

  // await result.immediatePromise

  // if (!result.error.value) {
  //   await executeDaycareDates()
  // }
  // done(!result.error.value)
}

onMounted(async () => {
  await executeCategories()
  if (id.value) {
    await Promise.all([
      execute(),
      // executeContactPeople(),
      // executePets(),
      // executeBookings(),
      executeCategories(),
      executeServices()
      // executeCustomerDaycareSubscriptions()
    ])
  }
  await refetchSearchCustomers()
})
</script>

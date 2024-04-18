<template>
  <customer-select :model-value="id" @update:model-value="setParam">
    <template #before> <q-icon name="search" /> </template>
  </customer-select>
  <q-page padding>
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
      <q-list v-if="bookings">
        <q-item>
          <q-item-section>
            <q-item-label header>{{
              `${lang.booking.title} ${fromFormatted} -> ${untilFormatted}`
            }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat icon="open_in_new" @click="openBookings" />
          </q-item-section>
        </q-item>
        <booking-item
          v-for="booking in bookings"
          :key="booking.id"
          show-icon
          :model-value="booking"
        />
      </q-list>
    </div>
    <div v-show="id">
      <daycare-calendar-month :events="events" @change-date="onChangeDate">
      </daycare-calendar-month>
      <daycare-status-select v-model="daycareDatesStatus" />
    </div>
  </q-page>
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
</template>

<script lang="ts">
export default {
  name: 'EmployeeCustomersPage'
}
</script>

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
import { DAYCARE_DATE_STATUS } from '@petboarding/api/zod'
import { DAYCARE_DATE_COLORS, DAYCARE_DATE_ICONS } from '../../configuration.js'
import DaycareStatusSelect from '../../components/daycare/DaycareStatusSelect.vue'
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

const route = useRoute()
const router = useRouter()
const lang = useLang()
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

const from = dateUtil.formatDate(
  dateUtil.subtractFromDate(new Date(), { years: 2 }),
  'YYYY-MM-DD'
)
const until = dateUtil.formatDate(
  dateUtil.addToDate(new Date(), { years: 1 }),
  'YYYY-MM-DD'
)
const fromFormatted = computed(() => dateUtil.formatDate(from, 'DD-MM-YYYY'))
const untilFormatted = computed(() => dateUtil.formatDate(until, 'DD-MM-YYYY'))
const { data: bookings, execute: executeBookings } = useQuery(
  'employee.getBookings',
  {
    args: reactive({ from, until, customerId: id }),
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
const { data: categories, execute: executeCategories } = useQuery(
  'public.getCategories',
  {
    // immediate: true
  }
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
    console.log(newDaycareDatesFrom)
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
    details: daycareDate.customer.lastName,
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

onMounted(async () => {
  await executeCategories()
  if (route.params.id) {
    execute()
    executeContactPeople()
    executePets()
    executeBookings()
  }
})
</script>

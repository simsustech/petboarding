<template>
  <resource-page
    type="create"
    :disabled="!petsData?.length"
    @create="openCreateDialog"
    @update="openUpdateDialog"
  >
    <template #header>
      {{ lang.daycare.title }}
    </template>
    <div v-if="ready">
      <div v-if="petsData?.length">
        <daycare-legend />
        <daycare-calendar-month
          :events="events"
          :selected-events="selectedEvents"
          :disabled-weekdays="configuration.DAYCARE_DISABLED_WEEKDAYS"
          :focusable="false"
          :hoverable="false"
          @click:event="onClickEvent"
          @change-date="onChangeDate"
        />
        <div class="row justify-center">
          <q-btn
            v-if="selectedEvents.length"
            :label="lang.daycare.messages.cancelSelected"
            color="red"
            @click="cancelDaycareDates"
          />
        </div>
      </div>
      <div v-else>
        <router-link to="/account/pets">{{
          lang.daycare.messages.addPets
        }}</router-link>
      </div>
    </div>
    <!-- <q-btn @click="createCustomer" /> -->
    <responsive-dialog ref="updateDialogRef" persistent @submit="update">
      <daycare-form
        ref="updateDaycareFormRef"
        :pets="petsData"
        :terms-and-conditions-url="termsAndConditionsUrl"
        @submit="updateDaycare"
      ></daycare-form>
    </responsive-dialog>
    <responsive-dialog ref="createDialogRef" persistent @submit="create">
      <daycare-form
        ref="createDaycareFormRef"
        :pets="petsData"
        :terms-and-conditions-url="termsAndConditionsUrl"
        @submit="createDaycare"
      ></daycare-form>
    </responsive-dialog>
  </resource-page>
</template>

<script lang="ts">
export default {
  name: 'AccountDaycarePage'
}
</script>

<script setup lang="ts">
import { ref, nextTick, onMounted, computed, reactive } from 'vue'
import { createUseTrpc } from '../../trpc.js'
import { ResourcePage, ResponsiveDialog } from '@simsustech/quasar-components'
import DaycareForm from '../../components/daycare/DaycareForm.vue'
import DaycareCalendarMonth, {
  QCalendarEvent
} from '../../components/daycare/DaycareCalendarMonth.vue'
import { useLang } from '../../lang/index.js'
import { useQuasar, date as dateUtil } from 'quasar'
import DaycareLegend from '../../components/daycare/DaycareLegend.vue'
import {
  DAYCARE_DATE_COLORS,
  DAYCARE_DATE_ICONS,
  useConfiguration
} from '../../configuration.js'

const $q = useQuasar()
const { useQuery, useMutation } = await createUseTrpc()

const lang = useLang()
const configuration = useConfiguration()

const startDate = ref('')
const endDate = ref('')

const { data: petsData, execute: executeCustomer } = useQuery('user.getPets', {
  // immediate: true
})

const { data, execute } = useQuery('user.getDaycareDates', {
  args: reactive({ from: startDate, until: endDate }),
  reactive: {
    args: true
  }
  // immediate: true
})

const updateDaycareFormRef = ref<typeof DaycareForm>()
const createDaycareFormRef = ref<typeof DaycareForm>()
const updateDialogRef = ref<typeof ResponsiveDialog>()
const createDialogRef = ref<typeof ResponsiveDialog>()
const openUpdateDialog: InstanceType<
  typeof ResourcePage
>['$props']['onUpdate'] = ({ data }) => {
  updateDialogRef.value?.functions.open()
  nextTick(() => {
    updateDaycareFormRef.value?.functions.setValue(data)
  })
}

const openCreateDialog: InstanceType<
  typeof ResourcePage
>['$props']['onCreate'] = () => {
  createDialogRef.value?.functions.open()
}

const update: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterUpdate = (success?: boolean) => {
    done(success)
    execute()
  }
  updateDaycareFormRef.value?.functions.submit({ done: afterUpdate })
}

const create: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterCreate = (success?: boolean) => {
    done(success)
    execute()
  }
  createDaycareFormRef.value?.functions.submit({ done: afterCreate })
}

const updateDaycare: InstanceType<
  typeof DaycareForm
>['$props']['onSubmit'] = async () => {}

const createDaycare: InstanceType<
  typeof DaycareForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  const result = useMutation('user.createDaycareDates', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (!result.error.value) {
    $q.dialog({
      message: lang.value.daycare.messages.submitted
    })
  }
  done(!result.error.value)
}

const cancelDaycareDates = async () => {
  $q.dialog({
    html: true,
    cancel: true,
    message: `${
      lang.value.daycare.messages.verifyCancellation
    } <br /> <b>${events.value
      ?.filter((ev) => selectedEvents.value.includes(ev.id))
      .map((event) => {
        return dateUtil.formatDate(new Date(event.date), 'D MMM YYYY')
      })
      .join('<br />')}</b>`
  }).onOk(async () => {
    const result = useMutation('user.cancelDaycareDates', {
      args: selectedEvents.value,
      immediate: true
    })
    await result.immediatePromise

    if (!result.error.value) {
      selectedEvents.value = []
      execute()
    }
  })
}

const events = computed(() => {
  if (data?.value) {
    return data.value.map((daycareDate) => ({
      id: daycareDate.id,
      bgcolor: DAYCARE_DATE_COLORS[daycareDate.status],
      title: daycareDate.pets.map((pet) => pet.name).join(', '),
      petNames: daycareDate.pets.map((pet) => pet.name),
      date: daycareDate.date,
      // details: lang.value.daycare.status[daycareDate.status],
      icon: DAYCARE_DATE_ICONS[daycareDate.status]
    }))
  }
  return []
})
const selectedEvents = ref<number[]>([])
const onClickEvent = (event: QCalendarEvent) => {
  if (selectedEvents.value.includes(event.id)) {
    const index = selectedEvents.value.findIndex((id) => id === event.id)
    if (index !== -1) selectedEvents.value.splice(index, 1)
  } else {
    selectedEvents.value.push(event.id)
  }
}

const termsAndConditionsUrl = computed(
  () =>
    configuration.value.TERMS_AND_CONDITIONS_URL || '/termsandconditions.pdf'
)

const onChangeDate: InstanceType<
  typeof DaycareCalendarMonth
>['$props']['onChangeDate'] = (data) => {
  startDate.value = data.start
  endDate.value = data.end
}

const ready = ref<boolean>(false)
onMounted(async () => {
  await executeCustomer()
  // await execute()
  ready.value = true
})
</script>

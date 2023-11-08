<template>
  <q-form ref="formRef">
    <div class="row q-col-gutter-sm">
      <q-input
        v-bind="input"
        id="name"
        v-model="modelValue.name"
        class="col-12"
        name="name"
        :label="lang.openingTime.fields.name"
        bottom-slots
      />

      <q-input
        v-model="modelValue.startTime"
        class="col-12 col-md-6"
        :label="lang.openingTime.fields.startTime"
        filled
        mask="time"
        :rules="['time']"
      >
        <template #append>
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-time v-model="modelValue.startTime" format24h>
                <div class="row q-col-gutter-sm items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input
        v-model="modelValue.endTime"
        class="col-12 col-md-6"
        :label="lang.openingTime.fields.endTime"
        filled
        mask="time"
        :rules="['time']"
      >
        <template #append>
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-time v-model="modelValue.endTime" format24h>
                <div class="row q-col-gutter-sm items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
    <div class="row q-col-gutter-sm">
      {{ lang.openingTime.helpers.daysCountedMessage }}
      <q-input
        v-model="modelValue.startDayCounted"
        class="col-12 col-md-6"
        :label="lang.openingTime.fields.startDayCounted"
        type="number"
        step="0.1"
        :hint="lang.openingTime.helpers.dayCountedHint"
      />

      <q-input
        v-model="modelValue.endDayCounted"
        class="col-12 col-md-6"
        :label="lang.openingTime.fields.endDayCounted"
        type="number"
        step="0.1"
        :hint="lang.openingTime.helpers.dayCountedHint"
      />
    </div>
    <div class="row q-col-gutter-sm">
      <q-select
        v-model="modelValue.daysOfWeek"
        class="col-12 col-12 col-md-6"
        :options="daysOfWeekOptions"
        multiple
        emit-value
        map-options
        :label="lang.openingTime.fields.daysOfWeek"
        bottom-slots
      />
      <q-select
        v-model="modelValue.unavailableHolidays"
        class="col-12 col-md-6"
        :options="unavailableHolidaysOptions"
        multiple
        emit-value
        map-options
        :label="lang.openingTime.fields.unavailableHolidays"
        bottom-slots
      />
    </div>
    <div class="row">
      <boolean-select
        v-model="modelValue.disabled"
        class="col-12 col-md-6"
        :label="lang.openingTime.fields.disabled"
      />
    </div>
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'OpeningTimeForm'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar, extend, QForm } from 'quasar'
import { useLang } from '../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { OpeningTime } from '@petboarding/api/zod'
import { BooleanSelect } from '@simsustech/quasar-components/form'
import type { QFormProps, QInputProps } from 'quasar'

export interface Props {
  form?: QFormProps & Partial<HTMLFormElement> & Partial<HTMLDivElement>
  input?: Omit<
    QInputProps,
    | 'id'
    | 'name'
    | 'modelValue'
    | 'label'
    | 'rules'
    | 'type'
    | 'lazy-rules'
    | 'autofocus'
    | ('label' & { style?: Partial<CSSStyleDeclaration> })
  >
  unavailableHolidaysOptions?: {
    label: string
    value: string
  }[]
}
defineProps<Props>()

const emit = defineEmits<{
  (
    e: 'submit',
    {
      data,
      done
    }: {
      data: OpeningTime
      done: (success?: boolean) => void
    }
  ): void
}>()

const $q = useQuasar()
const lang = useLang()

const formRef = ref<QForm>()

const initialValue = {
  name: '',
  startTime: '',
  startDayCounted: 0,
  endTime: '',
  endDayCounted: 0,
  daysOfWeek: [],
  unavailableHolidays: [],
  disabled: false
}
const modelValue = ref<OpeningTime>(initialValue)

const setValue = (newValue: OpeningTime) => {
  modelValue.value = extend({}, initialValue, newValue)
}

const submit: InstanceType<typeof ResponsiveDialog>['$props']['onSubmit'] = ({
  done
}) => {
  formRef.value?.validate().then((success) => {
    if (success) {
      return emit('submit', {
        data: modelValue.value,
        done
      })
    }
  })
  done(false)
}

const daysOfWeekOptions = ref([
  {
    label: $q.lang.date.days[1],
    value: 0
  },
  {
    label: $q.lang.date.days[2],
    value: 1
  },
  {
    label: $q.lang.date.days[3],
    value: 2
  },
  {
    label: $q.lang.date.days[4],
    value: 3
  },
  {
    label: $q.lang.date.days[5],
    value: 4
  },
  {
    label: $q.lang.date.days[6],
    value: 5
  },
  {
    label: $q.lang.date.days[0],
    value: 6
  }
])

const variables = ref({
  // header: lang.value.some.nested.prop
})
const functions = ref({
  submit,
  setValue
})
defineExpose({
  variables,
  functions
})
</script>

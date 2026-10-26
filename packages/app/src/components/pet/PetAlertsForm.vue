<template>
  <q-form ref="formRef">
    <div class="grid grid-cols-12 gap-3">
      <q-select
        v-model="alert.condition"
        :options="alertOptions"
        :label="lang.pet.alerts.condition"
        class="col-span-12"
        map-options
        emit-value
        :rules="[(val: unknown) => !!val || lang.pet.validations.fieldRequired]"
      />
      <date-input
        v-model="alert.startDate"
        :label="lang.pet.alerts.startDate"
        format="DD-MM-YYYY"
        clearable
        class="col-span-12 md:col-span-6"
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
        v-model="alert.endDate"
        :label="lang.pet.alerts.endDate"
        format="DD-MM-YYYY"
        clearable
        class="col-span-12 md:col-span-6"
        :date="{
          noUnset: true,
          firstDayOfWeek: '1'
        }"
        :icons="{
          event: 'i-mdi-event',
          clear: 'i-mdi-clear'
        }"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { useLang } from '../../lang/index.js'
import { PET_ALERTS, PET_ALERT_CONDITIONS } from '@petboarding/tools/constants'
import { DateInput } from '@simsustech/quasar-components/form'
import type { PetAlert } from '../../configuration.js'

interface Props {
  modelValue?: PetAlert
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    condition: PET_ALERT_CONDITIONS.IN_HEAT,
    startDate: null,
    endDate: null
  })
})

const emit = defineEmits<{
  (e: 'update:model-value', value: PetAlert): void
  (
    e: 'submit',
    value: { data: PetAlert; done: (success?: boolean) => void }
  ): void
}>()

const lang = useLang()

const formRef = ref<any>()

const alert = reactive<PetAlert>({ ...props.modelValue })

const alertOptions = computed(() =>
  PET_ALERTS.map((a) => ({
    label: lang.value.pet.alerts[a.value as keyof typeof lang.value.pet.alerts],
    value: a.value
  }))
)

/**
 * Reset (or prefill) the form for the next open: the previous alert's dates
 * used to survive into a new one, and a stale "field is required" stayed on
 * screen after the field was filled.
 */
function setValue(data: PetAlert | null) {
  alert.condition = data?.condition ?? PET_ALERT_CONDITIONS.IN_HEAT
  alert.startDate = data?.startDate ?? null
  alert.endDate = data?.endDate ?? null
  formRef.value?.resetValidation()
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Either end of a window may be open (a chronic condition has no window at
 * all), so only a closed window has an order to check. The component emits ISO
 * strings; partial input (`2024-__-__`) is left to the field's own rule.
 */
const windowIsOrdered = () =>
  !alert.startDate ||
  !alert.endDate ||
  !ISO_DATE.test(alert.startDate) ||
  !ISO_DATE.test(alert.endDate) ||
  alert.endDate >= alert.startDate

function submit({ done }: { done: (success?: boolean) => void }) {
  if (!windowIsOrdered()) {
    Notify.create({
      message: lang.value.pet.alerts.endBeforeStart,
      type: 'negative'
    })
    done(false)
    return
  }
  formRef.value.validate().then((success: boolean) => {
    if (success) {
      emit('submit', { data: { ...alert }, done })
    } else {
      done(false)
    }
  })
}

const functions = ref({
  setValue,
  submit
})

defineExpose({
  functions
})
</script>

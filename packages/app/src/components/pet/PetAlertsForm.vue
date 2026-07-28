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
        :rules="[(val: any) => !!val || 'Required']"
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
import { useLang } from '../../lang/index.js'
import { PET_ALERTS } from '@petboarding/tools/constants'
import { DateInput } from '@simsustech/quasar-components/form'
import type { PetAlert } from '../../configuration.js'

interface Props {
  modelValue?: PetAlert
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({ condition: '', startDate: null, endDate: null })
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

function setValue(data: PetAlert) {
  alert.condition = data.condition
  alert.startDate = data.startDate
  alert.endDate = data.endDate
}

function submit({ done }: { done: (success?: boolean) => void }) {
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

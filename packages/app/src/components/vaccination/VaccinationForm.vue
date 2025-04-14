<template>
  <q-form ref="formRef">
    <div class="row justify-center">
      <image-avatar v-model="modelValue.image" allow-change />
    </div>
    <div class="row">
      <vaccination-types-select
        v-model="modelValue.types"
        class="col-12"
        :species="species"
        required
      />
      <date-input
        v-model="modelValue.expirationDate"
        :label="lang.pet.vaccination.expirationDate"
        format="DD-MM-YYYY"
        clearable
        required
        class="col-12"
        :date="{
          noUnset: true,
          defaultView: 'Years',
          firstDayOfWeek: '1',
          options: limitDateOptionsFn
        }"
        :icons="{
          event: 'i-mdi-event',
          clear: 'i-mdi-clear'
        }"
      />
    </div>
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'VaccinationForm'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { QForm, extend, date as dateUtil } from 'quasar'
import { useLang } from '../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { DateInput } from '@simsustech/quasar-components/form'
import {
  Vaccination as VaccinationType,
  PET_SPECIES
} from '@petboarding/api/zod'
import VaccinationTypesSelect from './VaccinationTypesSelect.vue'
import ImageAvatar from '../ImageAvatar.vue'

export interface Vaccination extends VaccinationType {
  image?: string
}

const emit = defineEmits<{
  (
    e: 'submit',
    {
      data,
      done
    }: {
      data: Vaccination
      done: (success?: boolean) => void
    }
  ): void
}>()

const lang = useLang()

const species = ref<(typeof PET_SPECIES)[number]>('dog')
const initialValue: Vaccination = {
  petId: 0,
  expirationDate: '',
  types: []
}
const modelValue = ref<Vaccination>(initialValue)
const setValue = (newValue: Vaccination) => {
  modelValue.value = extend({}, initialValue, newValue)
}

const formRef = ref<QForm>()
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
    done(false)
  })
}

const limitDateOptionsFn = (date: string) => {
  return (
    date >
      dateUtil.formatDate(
        dateUtil.subtractFromDate(new Date(), { years: 2 }),
        'YYYY/MM/DD'
      ) &&
    date <
      dateUtil.formatDate(
        dateUtil.addToDate(new Date(), { years: 4 }),
        'YYYY/MM/DD'
      )
  )
}

const variables = ref({
  // header: lang.value.some.nested.prop
})
const functions = ref({
  setValue,
  submit
})
defineExpose({
  variables,
  functions
})
</script>

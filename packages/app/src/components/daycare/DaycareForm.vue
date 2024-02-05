<template>
  <q-form v-bind="attrs" ref="formRef" class="row justtify-center">
    <div class="col-12 col-md-6">
      <q-select
        v-model="modelValue.petIds"
        :options="petOptions"
        :label="lang.booking.fields.pets"
        :rules="validations['pets']"
        use-chips
        emit-value
        map-options
        multiple
      />
      <terms-and-conditions-checkbox
        v-model="termsAndConditions"
        :terms-and-conditions-url="termsAndConditionsUrl"
        :ignore-terms-and-conditions="ignoreTermsAndConditions"
      />
    </div>
  </q-form>
  <daycare-calendar-month
    :selected-dates="selectedDates"
    :disabled-weekdays="configuration.DAYCARE_DISABLED_WEEKDAYS"
    @update:selected-dates="($event) => (selectedDates = $event)"
  ></daycare-calendar-month>
</template>

<script lang="ts">
export default {
  name: 'DaycareForm',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { Pet, DaycareDate } from '@petboarding/api/zod'
import { ref, useAttrs, computed, toRefs } from 'vue'
import DaycareCalendarMonth from './DaycareCalendarMonth.vue'
import { useLang } from '../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { QForm } from 'quasar'
import { useConfiguration } from '../../configuration.js'
import TermsAndConditionsCheckbox from '../TermsAndConditionsCheckbox.vue'
export interface Props {
  pets: Pet[]
  termsAndConditionsUrl?: string
  ignoreTermsAndConditions?: boolean
}

const props = defineProps<Props>()
const attrs = useAttrs()

const lang = useLang()
const configuration = useConfiguration()

const emit = defineEmits<{
  (
    e: 'submit',
    {
      data,
      done
    }: {
      data: DaycareDate[]
      done: (success?: boolean) => void
    }
  ): void
}>()

const formRef = ref<QForm>()
const validations = computed<
  Record<string, ((val: string) => boolean | string)[]>
>(() => ({
  comments: [(val) => !!val || lang.value.booking.validations.fieldRequired],
  pets: [(val) => !!val.length || lang.value.booking.validations.fieldRequired]
}))

const { pets } = toRefs(props)
const selectedDates = ref<string[]>([])
const modelValue = ref({
  petIds: []
})

const petOptions = computed(() =>
  pets.value.map((pet) => ({
    label: pet.name,
    value: pet.id
  }))
)

const termsAndConditions = ref(false)

const setValue = (newValue: DaycareDate) => {
  //
}

const submit: InstanceType<typeof ResponsiveDialog>['$props']['onSubmit'] = ({
  done
}) => {
  formRef.value?.validate().then((success) => {
    if (success) {
      const data: DaycareDate[] = selectedDates.value.map((date) => ({
        petIds: modelValue.value.petIds,
        date
      }))
      return emit('submit', {
        data,
        done
      })
    }
  })
  done(false)
}

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

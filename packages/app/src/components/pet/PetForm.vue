<template>
  <q-form ref="formRef">
    <div class="row q-mb-md justify-center">
      <image-avatar v-model="modelValue.image" allow-change />
    </div>
    <div class="grid grid-cols-12 grid-flow-row gap-3">
      <pet-species-select
        v-bind="input"
        v-model="modelValue.species"
        class="col-span-12 md:col-span-2"
        required
        bottom-slots
        lazy-rules
        name="species"
      />

      <form-input
        v-bind="input"
        v-model="modelValue.name"
        class="col-span-12 md:col-span-3"
        required
        field="name"
        bottom-slots
        lazy-rules
        name="petname"
      />
      <pet-breed-select
        v-bind="input"
        v-model="modelValue.breed"
        class="col-span-12 md:col-span-3"
        :species="modelValue.species"
        required
        bottom-slots
        lazy-rules
        name="breed"
      />
      <date-input
        v-model="modelValue.birthDate"
        :label="lang.pet.fields.birthDate"
        class="col-span-12 md:col-span-4"
        format="DD-MM-YYYY"
        clearable
        required
        :date="{
          noUnset: true,
          defaultView: 'Years',
          options: pastDateOptionsFn,
          firstDayOfWeek: '1'
        }"
        :icons="{
          event: 'i-mdi-event',
          clear: 'i-mdi-clear'
        }"
      />

      <gender-select
        v-bind="input"
        id="gender"
        v-model="modelValue.gender"
        class="col-span-12 md:col-span-2"
        name="gender"
        disable-other
        required
        bottom-slots
        lazy-rules
      />

      <boolean-select
        v-model="modelValue.sterilized"
        :label="lang.pet.fields.sterilized"
        class="col-span-12 md:col-span-3"
        required
        name="sterilized"
      />

      <form-input
        v-bind="input"
        v-model="modelValue.color"
        class="col-span-12 md:col-span-3"
        :label="lang.pet.fields.color"
        bottom-slots
        lazy-rules
        name="color"
      />

      <date-input
        v-model="modelValue.chemicalSterilizationDate"
        :label="lang.pet.fields.chemicalSterilizationDate"
        :hint="lang.pet.messages.chemicalSterilizationDate"
        format="DD-MM-YYYY"
        clearable
        class="col-span-12 md:col-span-4"
        :date="{
          noUnset: true,
          options: pastDateOptionsFn,
          firstDayOfWeek: '1'
        }"
        :icons="{
          event: 'i-mdi-event',
          clear: 'i-mdi-clear'
        }"
      />

      <form-input
        v-bind="input"
        v-model="modelValue.medicines"
        class="col-span-12 md:col-span-4"
        :label="lang.pet.fields.medicines"
        bottom-slots
        lazy-rules
        name="medicines"
      />
      <pet-food-input
        v-if="useFood"
        v-model="modelValue.food"
        class="col-span-12 md:col-span-6"
        name="food"
      />

      <pet-weight
        v-model="modelValue.weight"
        class="col-span-12 md:col-span-4"
        :unit="configuration.UNIT_OF_MASS"
        v-bind="input"
        bottom-slots
        lazy-rules
      />
      <form-input
        v-bind="input"
        v-model="modelValue.chipNumber"
        class="col-span-12 md:col-span-4"
        :label="lang.pet.fields.chipNumber"
        mask="###############"
        bottom-slots
        lazy-rules
        name="chipNumber"
      />
      <boolean-select
        v-model="modelValue.insured"
        :label="lang.pet.fields.insured"
        class="col-span-12 md:col-span-4"
        name="insured"
      />

      <pet-category-select
        v-if="useCategory"
        v-model="modelValue.categoryId"
        class="col-span-12 md:col-span-4"
        required
        :categories="categories"
        :species="modelValue.species"
        name="category"
      />

      <form-input
        v-bind="input"
        id="particularities"
        v-model="modelValue.particularities"
        class="col-span-12"
        name="particularities"
        :label="lang.pet.fields.particularities"
        bottom-slots
        lazy-rules
        type="textarea"
        row
        q-col-gutter-mds="3"
      />

      <form-input
        v-if="useComments"
        v-bind="input"
        id="comments"
        v-model="modelValue.comments"
        class="col-span-12"
        name="comments"
        :label="lang.pet.fields.comments"
        bottom-slots
        lazy-rules
        type="textarea"
        row
        q-col-gutter-mds="3"
      />

      <boolean-select
        v-if="useDeceased && modelValue.deceased !== void 0"
        v-model="modelValue.deceased"
        :label="lang.pet.fields.deceased"
        class="col-span-12 md:col-span-4"
        name="deceased"
      />
      <div class="col-span-12 text-center">
        <q-rating
          v-if="useRating && modelValue.rating !== void 0"
          :model-value="modelValue.rating || 0"
          size="3em"
          icon="i-mdi-star-border"
          icon-selected="i-mdi-star"
          icon-half="i-mdi-star-half"
          @update:model-value="($event) => (modelValue.rating = $event)"
        />
      </div>
    </div>
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'PetForm'
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  QForm,
  QFormProps,
  QInputProps,
  useQuasar,
  extend,
  date as dateUtil
} from 'quasar'
import { useLang, loadLang } from '../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import {
  GenderSelect,
  FormInput,
  DateInput,
  BooleanSelect
} from '@simsustech/quasar-components/form'
import type { Pet as PetType, Category } from '@petboarding/api/zod'
import PetSpeciesSelect from './PetSpeciesSelect.vue'
import PetBreedSelect from './PetBreedSelect.vue'
import PetCategorySelect from './PetCategorySelect.vue'
import ImageAvatar from '../ImageAvatar.vue'
import PetWeight from './PetWeight.vue'
import { useConfiguration } from '../../configuration.js'
import PetFoodInput from './PetFoodInput.vue'

export interface Pet extends PetType {
  image?: string
}
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
  categories: Record<string, Category>
  useRating?: boolean
  useFood?: boolean
  useComments?: boolean
  useCategory?: boolean
  useDeceased?: boolean
}
defineProps<Props>()
const emit = defineEmits<{
  (
    e: 'submit',
    {
      pet,
      done
    }: {
      pet: Pet
      done: (success?: boolean) => void
    }
  ): void
}>()

const initialValue: Pet = {
  species: 'dog',
  chipNumber: '',
  name: '',
  breed: '',
  gender: null,
  sterilized: null,
  chemicalSterilizationDate: null,
  birthDate: '',
  color: '',
  medicines: '',
  food: {
    timesADay: 0,
    amount: 0,
    amountUnit: 'gram',
    kind: ''
  },
  weight: '',
  particularities: '',
  insured: null
}

const modelValue = ref<Pet>(initialValue)

const $q = useQuasar()
const lang = useLang()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, (val) => {
  loadLang($q.lang.isoName)
})

const formRef = ref<QForm>()

const setValue = (newValue: Pet) => {
  modelValue.value = extend(true, {}, initialValue, newValue)
}

const submit: InstanceType<typeof ResponsiveDialog>['$props']['onSubmit'] = ({
  done
}) => {
  formRef.value?.validate().then((success) => {
    if (success) {
      return emit('submit', {
        pet: modelValue.value,
        done
      })
    }
    done(false)
  })
}

const pastDateOptionsFn = (date: string) => {
  return date < dateUtil.formatDate(new Date(), 'YYYY/MM/DD')
}

const configuration = useConfiguration()

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

<template>
  <q-form ref="formRef">
    <div class="row justify-center">
      <pet-avatar v-model="modelValue.image" allow-change />
    </div>
    <div class="row">
      <pet-species-select
        v-bind="input"
        v-model="modelValue.species"
        class="col-md-2 col-12"
        required
        bottom-slots
        lazy-rules
        name="species"
      />

      <form-input
        v-bind="input"
        v-model="modelValue.name"
        class="col-md-3 col-12"
        required
        field="name"
        bottom-slots
        lazy-rules
        name="petname"
      />
      <pet-breed-select
        v-bind="input"
        v-model="modelValue.breed"
        :species="modelValue.species"
        class="col-md-3 col-12"
        required
        bottom-slots
        lazy-rules
        name="breed"
      />
      <date-input
        v-model="modelValue.birthDate"
        :label="lang.pet.fields.birthDate"
        clearable
        required
        class="col-md-4 col-12"
        :date="{
          noUnset: true,
          defaultView: 'Years',
          options: pastDateOptionsFn,
          firstDayOfWeek: '1'
        }"
      />
    </div>
    <div class="row justify-center">
      <gender-select
        v-bind="input"
        id="gender"
        v-model="modelValue.gender"
        class="col-md-4 col-12"
        name="gender"
        disable-other
        required
        bottom-slots
        lazy-rules
      />

      <boolean-select
        v-model="modelValue.sterilized"
        :label="lang.pet.fields.sterilized"
        class="col-md-4 col-12"
        required
        name="sterilized"
      />

      <date-input
        v-model="modelValue.chemicalSterilizationDate"
        :label="lang.pet.fields.chemicalSterilizationDate"
        :hint="lang.pet.messages.chemicalSterilizationDate"
        clearable
        class="col-md-4 col-12"
        :date="{
          noUnset: true,
          options: pastDateOptionsFn,
          firstDayOfWeek: '1'
        }"
      />
    </div>
    <div class="row">
      <form-input
        v-bind="input"
        v-model="modelValue.color"
        class="col-md-4 col-12"
        :label="lang.pet.fields.color"
        bottom-slots
        lazy-rules
        name="color"
      />

      <form-input
        v-bind="input"
        v-model="modelValue.medicines"
        class="col-md-4 col-12"
        :label="lang.pet.fields.medicines"
        bottom-slots
        lazy-rules
        name="medicines"
      />
      <form-input
        v-if="useFood"
        v-bind="input"
        v-model="modelValue.food"
        class="col-md-4 col-12"
        :label="lang.pet.fields.food"
        bottom-slots
        lazy-rules
        name="food"
      />
    </div>

    <div class="row">
      <form-input
        v-bind="input"
        v-model="modelValue.chipNumber"
        class="col-md-6 col-12"
        :label="lang.pet.fields.chipNumber"
        mask="###############"
        bottom-slots
        lazy-rules
        name="chipNumber"
      />
      <pet-category-select
        v-if="useCategory"
        class="col-md-6 col-12"
        v-model="modelValue.categoryId"
        :categories="categories"
        :species="modelValue.species"
        name="category"
      />
    </div>

    <form-input
      v-bind="input"
      id="particularities"
      v-model="modelValue.particularities"
      class="col-12"
      name="particularities"
      :label="lang.pet.fields.particularities"
      bottom-slots
      lazy-rules
      type="textarea"
      rows="3"
    />

    <form-input
      v-if="useComments"
      v-bind="input"
      id="comments"
      v-model="modelValue.comments"
      class="col-12"
      name="comments"
      :label="lang.pet.fields.comments"
      bottom-slots
      lazy-rules
      type="textarea"
      rows="3"
    />

    <boolean-select
      v-if="useDeceased && modelValue.deceased !== void 0"
      v-model="modelValue.deceased"
      :label="lang.pet.fields.deceased"
      class="col-md-4 col-12"
      name="deceased"
    />
    <div class="col-12 text-center">
      <q-rating
        v-if="useRating && modelValue.rating !== void 0"
        :model-value="modelValue.rating || 0"
        size="3em"
        icon="star_border"
        icon-selected="star"
        icon-half="star_half"
        @update:model-value="($event) => (modelValue.rating = $event)"
      />
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
import PetAvatar from './PetAvatar.vue'
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
  food: '',
  weight: '',
  particularities: ''
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
  modelValue.value = extend({}, initialValue, newValue)
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
  })
  done(false)
}

const pastDateOptionsFn = (date: string) => {
  return date < dateUtil.formatDate(new Date(), 'YYYY/MM/DD')
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

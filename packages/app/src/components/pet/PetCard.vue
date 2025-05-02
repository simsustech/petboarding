<template>
  <q-styled-card v-bind="attrs" :class="{ 'bg-grey-5': modelValue.deceased }">
    <template #title>
      <div class="row justify-between">
        <image-avatar :model-value="modelValue.image" />
        <div class="col text-right">
          <q-btn outline rounded icon="i-mdi-edit" @click="update(modelValue)">
            <q-tooltip>
              {{ lang.update }}
            </q-tooltip>
          </q-btn>
          <q-btn
            v-if="onOpenCustomer"
            outline
            rounded
            icon="i-mdi-person"
            @click="$emit('openCustomer', { id: modelValue.customerId })"
          >
            <q-tooltip>{{ lang.customer.title }}</q-tooltip>
          </q-btn>
          <q-btn
            v-if="onDelete && allowDelete"
            outline
            rounded
            color="red"
            icon="i-mdi-delete"
            @click="deletePet(modelValue)"
          />
        </div>
      </div>
      <div class="row q-pl-md">
        {{ modelValue.name }}
      </div>
      <div class="row justify-center">
        <q-rating
          v-if="useRating"
          :model-value="modelValue.rating || 0"
          readonly
          size="sm"
          icon="i-mdi-star-border"
          icon-selected="i-mdi-star"
          icon-half="i-mdi-star-half"
        />
      </div>
    </template>
    <q-list>
      <!-- <form-item field="name" :model-value="modelValue.name" /> -->
      <form-item
        v-if="modelValue.customer?.lastName"
        field="lastName"
        :model-value="modelValue.customer.lastName"
      />
      <form-item
        :label="lang.pet.fields.breed"
        :model-value="modelValue.breed"
      />
      <form-item
        :label="lang.pet.fields.birthDate"
        :model-value="formatDate(modelValue.birthDate)"
      />
      <gender-item :model-value="modelValue.gender" />
      <boolean-item
        :label="lang.pet.fields.sterilized"
        :model-value="modelValue.sterilized"
      />
      <form-item
        :label="lang.pet.fields.chemicalSterilizationDate"
        :model-value="formatDate(modelValue.chemicalSterilizationDate)"
      ></form-item>
      <form-item
        :label="lang.pet.fields.color"
        :model-value="modelValue.color"
      />
      <form-item
        :label="lang.pet.fields.medicines"
        :model-value="modelValue.medicines"
      />
      <form-item
        :label="lang.pet.fields.food"
        :model-value="
          modelValue.food
            ? `${modelValue.food?.timesADay ?? ''}x ${modelValue.food.amount || ''} 
                    ${lang.pet.food.unit[modelValue.food?.amountUnit] ?? ''} ${modelValue.food?.kind}`
            : undefined
        "
      />
      <form-item
        :label="lang.pet.fields.weight"
        :model-value="
          modelValue.weight
            ? `${modelValue.weight} ${configuration.UNIT_OF_MASS || 'kg'}`
            : null
        "
      />
      <form-item
        :label="lang.pet.fields.chipNumber"
        :model-value="modelValue.chipNumber"
      />
      <form-item
        :label="lang.pet.fields.particularities"
        :model-value="modelValue.particularities"
      />
      <pet-category-item
        :model-value="modelValue.categoryId"
        :categories="categories"
        :species="modelValue.species"
      />
      <boolean-item
        :label="lang.pet.fields.insured"
        :model-value="modelValue.insured"
      />
      <form-item
        v-if="useComments"
        :label="lang.pet.fields.comments"
        :model-value="modelValue.comments"
      />
    </q-list>
    <q-list v-if="modelValue.vaccinations || showAddVaccination">
      <q-item>
        <q-item-section avatar>
          <q-icon
            v-if="!modelValue.hasMandatoryVaccinations"
            name="i-mdi-warning"
            color="red"
          >
            <q-tooltip>
              {{ lang.pet.messages.vaccinationsMissing }}
            </q-tooltip></q-icon
          >
        </q-item-section>
        <q-item-section>
          <q-item-label header>
            {{ lang.pet.vaccination.title }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            v-if="showAddVaccination"
            outline
            icon="i-mdi-add"
            @click="addVaccination(modelValue)"
          />
        </q-item-section>
      </q-item>
      <vaccination-item
        v-for="vaccination in modelValue.vaccinations"
        :key="vaccination.id"
        :model-value="vaccination"
        :hide-expiration-date="!showAddVaccination"
        :show-edit-button="showAddVaccination"
        @update="updateVaccination"
      />
    </q-list>
  </q-styled-card>
</template>

<script lang="ts">
export default {
  name: 'PetCard',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { toRefs, useAttrs } from 'vue'
import { useQuasar } from 'quasar'
import { QStyledCard } from '@simsustech/quasar-components'
import type { Pet as PetType, Category } from '@petboarding/api/zod'
import { useLang } from '../../lang/index.js'
import {
  FormItem,
  GenderItem,
  BooleanItem
} from '@simsustech/quasar-components/form'
import PetCategoryItem from './PetCategoryItem.vue'
import ImageAvatar from '../ImageAvatar.vue'
import VaccinationItem from '../vaccination/VaccinationItem.vue'
import { useConfiguration } from '../../configuration.js'
import type { Vaccination } from '../vaccination/VaccinationItem.vue'

export interface Pet extends PetType {
  image?: string
}
export interface Props {
  modelValue: Pet
  categories: Record<string, Category>
  useRating?: boolean
  useComments?: boolean
  showAddVaccination?: boolean
  allowDelete?: boolean
  onOpenCustomer?: unknown
  onDelete?: unknown
}
const props = defineProps<Props>()

const emit = defineEmits<{
  (
    e: 'update',
    {
      data,
      done
    }: {
      data: Pet
      done: (success?: boolean) => void
    }
  ): void
  (
    e: 'add:vaccination',
    {
      data,
      done
    }: {
      data: Pet
      done: (success?: boolean) => void
    }
  ): void
  (
    e: 'update:vaccination',
    {
      data,
      done
    }: {
      data: Vaccination & { species: Pet['species'] }
      done: (success?: boolean) => void
    }
  ): void
  (
    e: 'openCustomer',
    {
      id
    }: {
      id: number
    }
  ): void
  (
    e: 'delete',
    {
      data,
      done
    }: {
      data: Pet
      done: (success?: boolean) => void
    }
  ): void
}>()

const attrs = useAttrs()
const lang = useLang()
const $q = useQuasar()

const { modelValue } = toRefs(props)

const update = (pet: Pet) => {
  function done() {
    //
  }
  emit('update', { data: pet, done })
}

const addVaccination = (pet: Pet) => {
  function done() {
    //
  }
  if (pet.id) {
    emit('add:vaccination', { data: pet, done })
  }
}

const updateVaccination = (vaccination: Vaccination) => {
  function done() {
    //
  }

  if (vaccination.id) {
    emit('update:vaccination', {
      data: { ...vaccination, species: modelValue.value.species },
      done
    })
  }
}

const dateFormatter = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeZone: 'UTC'
  }).format(date)
const formatDate = (date: string | null) => {
  if (date) return dateFormatter(new Date(date), $q.lang.isoName)
  return '-'
}

const deletePet = (pet: Pet) => {
  function done() {}
  if (pet.id) {
    emit('delete', { data: pet, done })
  }
}

const configuration = useConfiguration()
</script>

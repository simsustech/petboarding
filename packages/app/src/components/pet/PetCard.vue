<template>
  <div>
    <q-styled-card v-bind="attrs" :class="{ 'bg-grey-5': modelValue.deceased }">
      <template #title>
        <div class="row justify-between">
          <pet-avatar :model-value="modelValue.image" @open="openImage" />
          <div class="col text-right">
            <q-btn outline rounded icon="edit" @click="update(modelValue)">
              <q-tooltip>
                {{ lang.update }}
              </q-tooltip>
            </q-btn>
            <q-btn
              v-if="onOpenCustomer"
              outline
              rounded
              icon="person"
              @click="$emit('openCustomer', { id: modelValue.customerId })"
            >
              <q-tooltip>{{ lang.customer.title }}</q-tooltip>
            </q-btn>
          </div>
        </div>
        <div class="row justify-center">
          <q-rating
            v-if="useRating"
            :model-value="modelValue.rating || 0"
            readonly
            size="sm"
            icon="star_border"
            icon-selected="star"
            icon-half="star_half"
          />
        </div>
      </template>
      <q-list>
        <form-item field="name" :model-value="modelValue.name" />
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
          :model-value="modelValue.food"
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
      </q-list>
      <q-list v-if="modelValue.vaccinations || showAddVaccination">
        <q-item>
          <q-item-section avatar>
            <q-icon v-if="!hasMandatoryVaccinations" name="warning" color="red">
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
              icon="add"
              @click="addVaccination(modelValue)"
            />
          </q-item-section>
        </q-item>
        <vaccination-item
          v-for="vaccination in modelValue.vaccinations"
          :key="vaccination.id"
          :model-value="vaccination"
        />
      </q-list>
      <template #actions>
        <!-- <div class="row full-width justify-center q-mb-md">
          <q-btn icon="edit" label="Update" @click="update(modelValue)" />
        </div>
        <div v-if="onOpenCustomer" class="row full-width justify-center">
          <q-btn
            :label="lang.customer.title"
            @click="$emit('openCustomer', { id: modelValue.customerId })"
          />
        </div> -->
      </template>
    </q-styled-card>

    <responsive-dialog ref="imageDialog" persistent display>
      <base64-image class="text-center" :model-value="modelValue.image" />
    </responsive-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: 'PetCard',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { computed, ref, toRefs, useAttrs } from 'vue'
import { date as dateUtil } from 'quasar'
import { QStyledCard } from '@simsustech/quasar-components'
import type { Pet as PetType, Category } from '@petboarding/api/zod'
import { useLang } from 'src/lang/index.js'
import {
  FormItem,
  GenderItem,
  BooleanItem
} from '@simsustech/quasar-components/form'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import PetCategoryItem from './PetCategoryItem.vue'
import PetAvatar from './PetAvatar.vue'
import Base64Image from '../Base64Image.vue'
import VaccinationItem from '../vaccination/VaccinationItem.vue'

export interface Pet extends PetType {
  image?: string
}
export interface Props {
  modelValue: Pet
  categories: Record<string, Category>
  useRating?: boolean
  showAddVaccination?: boolean
  onOpenCustomer?: unknown
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
    e: 'openCustomer',
    {
      id
    }: {
      id: number
    }
  ): void
}>()

const attrs = useAttrs()
const lang = useLang()

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

const formatDate = (date: string | null) => {
  if (date) return dateUtil.formatDate(new Date(date), 'DD MMM YYYY')
  return '-'
}

const imageDialog = ref<typeof ResponsiveDialog>()
const openImage = () => {
  imageDialog.value?.functions.open()
}

const mandatoryVaccinationsDog = import.meta.env.VITE_MANDATORY_VACCINATIONS_DOG
  ? import.meta.env.VITE_MANDATORY_VACCINATIONS_DOG.split(',')
  : ['parvo', 'distemper']

const mandatoryVaccinations = {
  dog: mandatoryVaccinationsDog,
  cat: []
}
const hasMandatoryVaccinations = computed(() => {
  const validVaccinations: string[] = []
  if (modelValue.value?.vaccinations) {
    for (let vaccination of modelValue.value.vaccinations) {
      if (
        vaccination.expirationDate >
        dateUtil.formatDate(new Date(), 'YYYY-MM-DD')
      ) {
        validVaccinations.push(...vaccination.types)
      }
    }
  }
  if (
    mandatoryVaccinations[modelValue.value.species].every((val) =>
      validVaccinations.includes(val)
    )
  ) {
    return true
  }
  return false
})
</script>

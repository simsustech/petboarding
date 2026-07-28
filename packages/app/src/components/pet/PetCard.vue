<template>
  <q-styled-card v-bind="attrs" :class="{ 'bg-grey-5': modelValue.deceased }">
    <template #title>
      <div class="row justify-between">
        <image-avatar :model-value="modelValue.image" />
        <div class="col text-right">
          <q-btn
            outline
            rounded
            icon="i-mdi-edit"
            data-testid="edit-button"
            @click="update(modelValue)"
          >
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
      <div class="row q-pl-md items-center">
        <span class="q-mr-md">{{ modelValue.name }}</span>
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
      <q-item v-if="showRelations">
        <q-item-section>
          <q-item-label>
            {{ lang.pet.relations.relations }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            outline
            icon="i-mdi-edit"
            @click="petRelationsDialogRef?.functions.open()"
          />
        </q-item-section>
      </q-item>
      <q-item v-if="showAlerts">
        <q-item-section>
          <q-item-label header>
            {{ lang.pet.alerts.title }}
          </q-item-label>
          <div v-if="modelValue.alerts?.length" class="row items-center">
            <q-badge
              v-for="alert in modelValue.alerts"
              :key="alert.id || alert.condition"
              :class="`bg-${PET_ALERT_COLORS[alert.condition]} text-white`"
              :title="
                lang.pet.alerts[alert.condition as keyof typeof lang.pet.alerts]
              "
              dense
              rounded
              class="q-mr-sm"
            >
              <q-icon :name="PET_ALERT_ICONS[alert.condition]" size="xs" />
              {{
                lang.pet.alerts[alert.condition as keyof typeof lang.pet.alerts]
              }}
              <q-btn
                dense
                flat
                round
                size="xs"
                icon="i-mdi-close-circle"
                class="q-ml-xs"
                @click.stop="confirmDeleteAlert(alert)"
              />
            </q-badge>
          </div>
        </q-item-section>
        <q-item-section side>
          <q-btn
            outline
            icon="i-mdi-add"
            @click="petAlertsDialogRef?.functions.open()"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-styled-card>

  <responsive-dialog
    ref="petRelationsDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    display
  >
    <pet-select multiple clearable :filled="false" rounded standout>
      <template #prepend> <q-icon name="i-mdi-search" /> </template>
      <template #side="{ itemProps, opt }">
        <q-rating
          :model-value="modelValue.relations?.[opt.value]?.rating / 2 || 0"
          size="3em"
          icon="i-mdi-star-border"
          icon-selected="i-mdi-star"
          icon-half="i-mdi-star-half"
          @update:model-value="
            ($event) =>
              updatePetRelation({
                petId1: modelValue.id!,
                petId2: opt.value,
                rating: $event * 2
              })
          "
        />
      </template>
    </pet-select>
    <q-list>
      <div
        v-for="rating in Array.from(
          { length: 10 },
          (_, index) => index + 1
        ).reverse()"
      >
        <q-item
          v-if="
            modelValue.relations &&
            Object.values(modelValue.relations).some(
              (relation) => relation.rating === rating
            )
          "
        >
          <q-item-section>
            <q-item-label overline>
              <q-rating
                :model-value="rating / 2"
                icon="i-mdi-star-border"
                icon-selected="i-mdi-star"
                icon-half="i-mdi-star-half"
              />
            </q-item-label>
            <q-item-label>
              {{
                Object.values(modelValue.relations)
                  .filter((relation) => relation.rating === rating)
                  .map((relation) => relation.name)
                  .join(', ')
              }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </q-list>
  </responsive-dialog>

  <responsive-dialog
    ref="petAlertsDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    @submit="submitAlertForm"
  >
    <pet-alerts-form ref="petAlertsFormRef" @submit="createAlert" />
  </responsive-dialog>
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
import { useEmployeeCreateAlert } from '../../mutations/employee/pet.js'

import { useEmployeeDeleteAlert } from '../../mutations/employee/pet.js'
import type { Vaccination } from '../vaccination/VaccinationItem.vue'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { ref } from 'vue'
import PetSelect from '../employee/PetSelect.vue'
import { useEmployeeSetPetRelation } from '../../mutations/employee/pet.js'
import PetAlertsForm from './PetAlertsForm.vue'
import {
  PET_ALERT_COLORS,
  PET_ALERT_ICONS,
  type PetAlert
} from '../../configuration.js'

export type OpenCustomerHandler = (payload: { id: number }) => void
export type DeleteHandler = (payload: {
  data: PetType
  done: (success?: boolean) => void
}) => void

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
  showRelations?: boolean
  showAlerts?: boolean
  onOpenCustomer?: OpenCustomerHandler
  onDelete?: DeleteHandler
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
  (e: 'update:modelValue', value: Pet): void
}>()

const attrs = useAttrs()
const lang = useLang()
const $q = useQuasar()

const { modelValue } = toRefs(props)

const { mutateAsync: setPetRelation } = useEmployeeSetPetRelation()

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

const petRelationsDialogRef = ref<typeof ResponsiveDialog>()
const petAlertsDialogRef = ref<typeof ResponsiveDialog>()

const petAlertsFormRef = ref<typeof PetAlertsForm>()

const submitAlertForm: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = ({ done }) => {
  petAlertsFormRef.value?.functions.submit({ done })
}

const createAlert: InstanceType<
  typeof PetAlertsForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  if (modelValue.value.id) {
    const { mutateAsync: createAlertMutation } = useEmployeeCreateAlert()
    try {
      await createAlertMutation({
        petId: modelValue.value.id,
        condition: data.condition,
        startDate: data.startDate,
        endDate: data.endDate
      })
      done()
      emit('update:modelValue', {
        ...modelValue.value,
        alerts: [...(modelValue.value.alerts || []), data]
      })
    } catch (e) {
      console.error(e)
      done(false)
    }
  }
}

const confirmDeleteAlert = (alert: PetAlert) => {
  $q.dialog({
    title: lang.value.pet.alerts.title,
    message: `${lang.value.delete} ${lang.value.pet.alerts[alert.condition as keyof typeof lang.value.pet.alerts]}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    if (alert.id && modelValue.value.id) {
      const { mutateAsync: deleteAlert } = useEmployeeDeleteAlert()
      await deleteAlert({ id: alert.id })
      emit('update:modelValue', {
        ...modelValue.value,
        alerts: modelValue.value.alerts?.filter((a) => a.id !== alert.id) || []
      })
    }
  })
}

const updatePetRelation = async ({
  petId1,
  petId2,
  rating
}: {
  petId1: number
  petId2: number
  rating: number
}) => {
  await setPetRelation({
    petId1,
    petId2,
    rating
  })
  emit('update:modelValue', {
    ...modelValue.value,
    relations: {
      ...modelValue.value.relations
    }
  })
}

const saveAlerts = (alerts: PetAlert[]) => {
  emit('update:modelValue', {
    ...modelValue.value,
    alerts
  })
}
</script>

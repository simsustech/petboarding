<template>
  <q-styled-card
    v-bind="attrs"
    :class="{
      'bg-surface-container-high text-on-surface-variant': modelValue.deceased
    }"
  >
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
    </q-list>

    <q-list v-if="showRelations">
      <q-item>
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
    </q-list>

    <q-list v-if="showAlerts" data-testid="pet-alerts">
      <q-item>
        <q-item-section>
          <q-item-label header>
            {{ lang.pet.alerts.title }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            outline
            icon="i-mdi-add"
            data-testid="add-alert-button"
            :aria-label="lang.pet.alerts.addAlert"
            @click="openCreateAlert"
          >
            <q-tooltip>{{ lang.pet.alerts.addAlert }}</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>

      <!-- One alert per row, and the row's text is the edit affordance: an alert
           whose dates are hidden cannot be acted on, and a window read behind a
           destructive control is worse. The condition + tile sit inside a real
           button (keyboard and screen-reader path, named by aria-label), and the
           destructive action is a sibling control, never a target inside the
           status shape. A second 48px button here measured the window down to
           120px and ellipsized it — the 400-year range the row exists to show.
           The window is a plain line under that button, so it owns the row's
           remaining width and wraps instead of clipping. -->
      <q-item
        v-for="alert in modelValue.alerts"
        :key="alertKey(alert)"
        data-testid="pet-alert-row"
      >
        <q-item-section>
          <q-btn
            flat
            class="full-width text-left"
            data-testid="edit-alert-button"
            :aria-label="editAlertLabel(alert)"
            @click="openEditAlert(alert)"
          >
            <div class="row items-center no-wrap full-width">
              <q-badge
                :class="[
                  PET_ALERT_FILL_CLASSES[alert.condition],
                  PET_ALERT_INK_CLASSES[alert.condition]
                ]"
                class="q-mr-sm"
                rounded
                aria-hidden="true"
                data-testid="pet-alert-tile"
              >
                <q-icon :name="PET_ALERT_ICONS[alert.condition]" size="0.8em" />
              </q-badge>
              {{ alertLabel(alert) }}
            </div>
            <q-tooltip>{{ lang.edit }}</q-tooltip>
          </q-btn>
          <!-- The app's own wrap rule for a dated label in a dense row
               (BookingExpansionItem/BookingItemContent): `q-item__label` clips
               to one line, and a hidden window is the defect this row exists to
               fix. -->
          <q-item-label
            class="whitespace-normal overflow-visible"
            overline
            data-testid="pet-alert-window"
          >
            {{ alertWindow(alert) }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            flat
            round
            dense
            data-testid="delete-alert-button"
            :aria-label="deleteAlertLabel(alert)"
            @click="confirmDeleteAlert(alert)"
          >
            <!-- The theme's error token, not the palette's `red`: that shade
                 measures 2.5:1 on the light card, while `--q-error` flips with
                 the scheme (#ba1a1a light / #ffb4ab dark) and clears the 3:1
                 floor for a glyph in both. -->
            <q-icon name="i-mdi-delete-outline" class="text-error" />
            <q-tooltip>{{ lang.delete }}</q-tooltip>
          </q-btn>
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
          size="2em"
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
    <template #title>{{ alertDialogTitle }}</template>
    <pet-alerts-form ref="petAlertsFormRef" @submit="saveAlert" />
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

import {
  useEmployeeDeleteAlert,
  useEmployeeUpdateAlert
} from '../../mutations/employee/pet.js'
import type { Vaccination } from '../vaccination/VaccinationItem.vue'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { computed, nextTick, ref } from 'vue'
import PetSelect from '../employee/PetSelect.vue'
import { useEmployeeSetPetRelation } from '../../mutations/employee/pet.js'
import PetAlertsForm from './PetAlertsForm.vue'
import {
  PET_ALERT_FILL_CLASSES,
  PET_ALERT_INK_CLASSES,
  PET_ALERT_ICONS,
  type PetAlert,
  type PetAlertRow
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

const editingAlert = ref<PetAlertRow | null>(null)

const alertDialogTitle = computed(() =>
  editingAlert.value
    ? lang.value.pet.alerts.editAlert
    : lang.value.pet.alerts.addAlert
)

const alertLabel = (alert: PetAlertRow) =>
  lang.value.pet.alerts[alert.condition as keyof typeof lang.value.pet.alerts]

/**
 * A stable key for a row that may not have a server id yet. Two alerts with the
 * same condition are legal, so the condition alone cannot identify a row —
 * `alert.id || alert.condition` collided as soon as one row lacked an id.
 */
const alertKey = (alert: PetAlertRow) =>
  alert.id ??
  `${alert.condition}-${alert.startDate ?? ''}-${alert.endDate ?? ''}`

/**
 * The alert's window in the reading order the locale expects. `formatRange`
 * collapses the fields both ends share ("Jan 5 – 12, 2024" / "5–12 jan 2024"),
 * which assembled date glue cannot do per locale; an open end reads as a word,
 * because a bare "-" is all the delete dialog ever showed.
 */
const alertWindow = (alert: PetAlertRow) => {
  const formatter = new Intl.DateTimeFormat($q.lang.isoName, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  })
  const start = alert.startDate ? new Date(alert.startDate) : null
  const end = alert.endDate ? new Date(alert.endDate) : null
  if (start && end) return formatter.formatRange(start, end)
  if (start) return `${lang.value.pet.alerts.since} ${formatter.format(start)}`
  if (end) return `${lang.value.pet.alerts.until} ${formatter.format(end)}`
  return lang.value.pet.alerts.ongoing
}

const editAlertLabel = (alert: PetAlertRow) =>
  `${lang.value.pet.alerts.editAlert}: ${alertLabel(alert)}`
const deleteAlertLabel = (alert: PetAlertRow) =>
  `${lang.value.pet.alerts.deleteAlert}: ${alertLabel(alert)}`

const setAlerts = (alerts: PetAlertRow[]) =>
  emit('update:modelValue', { ...modelValue.value, alerts })

const openCreateAlert = () => {
  editingAlert.value = null
  petAlertsDialogRef.value?.functions.open()
  nextTick(() => {
    petAlertsFormRef.value?.functions.setValue(null)
  })
}

const openEditAlert = (alert: PetAlertRow) => {
  // The optimistic row of a just-created alert has no id until the card
  // refetches, and the update endpoint keys on it.
  if (!alert.id) return
  editingAlert.value = alert
  petAlertsDialogRef.value?.functions.open()
  nextTick(() => {
    petAlertsFormRef.value?.functions.setValue(alert)
  })
}

const saveAlert: InstanceType<
  typeof PetAlertsForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  const alert = editingAlert.value
  if (alert?.id) {
    await updateAlert({ id: alert.id, data, done })
    return
  }
  await createAlert({ data, done })
}

const createAlert = async ({
  data,
  done
}: {
  data: PetAlertRow
  done: (success?: boolean) => void
}) => {
  if (!modelValue.value.id) return
  const { mutateAsync: createAlertMutation } = useEmployeeCreateAlert()
  try {
    // Merge the row the server returned, not the form payload: without its id
    // the new alert cannot be edited or deleted until the card refetches.
    const created = await createAlertMutation({
      petId: modelValue.value.id,
      condition: data.condition,
      startDate: data.startDate,
      endDate: data.endDate
    })
    done()
    setAlerts([...(modelValue.value.alerts || []), created ?? data])
  } catch (e) {
    console.error(e)
    done(false)
  }
}

const updateAlert = async ({
  id,
  data,
  done
}: {
  id: number
  data: PetAlertRow
  done: (success?: boolean) => void
}) => {
  const { mutateAsync: updateAlertMutation } = useEmployeeUpdateAlert()
  try {
    const updated = await updateAlertMutation({
      id,
      condition: data.condition,
      startDate: data.startDate,
      endDate: data.endDate
    })
    done()
    setAlerts(
      (modelValue.value.alerts || []).map((alert) =>
        alert.id === id ? { ...alert, ...updated, id } : alert
      )
    )
  } catch (e) {
    console.error(e)
    done(false)
  }
}

const confirmDeleteAlert = (alert: PetAlertRow) => {
  $q.dialog({
    title: lang.value.pet.alerts.deleteAlert,
    message: `${alertLabel(alert)} — ${alertWindow(alert)} (${modelValue.value.name})`,
    ok: lang.value.delete,
    cancel: lang.value.cancel,
    persistent: true
  }).onOk(async () => {
    if (alert.id && modelValue.value.id) {
      const { mutateAsync: deleteAlert } = useEmployeeDeleteAlert()
      await deleteAlert({ id: alert.id })
      setAlerts(modelValue.value.alerts?.filter((a) => a.id !== alert.id) || [])
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
</script>

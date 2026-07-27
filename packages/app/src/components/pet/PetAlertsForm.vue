<template>
  <q-list>
    <div
      v-for="(alert, index) in modelValue"
      :key="index"
      class="row items-end q-pb-sm"
    >
      <q-select
        v-model="modelValue[index].condition"
        :options="alertOptions"
        :label="lang.pet.alerts.condition"
        class="col-6"
        map-options
        emit-value
      />
      <q-input
        v-model="modelValue[index].startDate"
        type="date"
        :label="lang.pet.alerts.startDate"
        class="col-3 q-mx-sm"
      />
      <q-input
        v-model="modelValue[index].endDate"
        type="date"
        :label="lang.pet.alerts.endDate"
        class="col-3 q-mx-sm"
      />
      <q-btn
        icon="i-mdi-delete"
        label="Remove"
        color="red"
        @click="removeAlert(index)"
        class="q-ml-sm"
      />
    </div>
  </q-list>
  <q-btn label="Add alert" icon="i-mdi-add" @click="addAlert()" />
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { useLang } from '../../lang/index.js'
import { PET_ALERTS } from '@petboarding/tools/constants'
import type { PetAlert } from '../../configuration.js'
import { useEmployeeDeleteAlert } from '../../mutations/employee/pet.js'

interface Props {
  modelValue: PetAlert[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:model-value', value: PetAlert[]): void
}>()

const lang = useLang()
const { modelValue } = toRefs(props)
const { mutateAsync: deleteAlert } = useEmployeeDeleteAlert()

const alertOptions = computed(() =>
  PET_ALERTS.map((a) => ({
    label: lang.value.pet.alerts[a.value as keyof typeof lang.value.pet.alerts],
    value: a.value
  }))
)

function addAlert() {
  const current = [...(modelValue.value || [])]
  current.push({ condition: '', startDate: null, endDate: null })
  emit('update:model-value', current)
}

async function removeAlert(index: number) {
  const current = [...(modelValue.value || [])]
  const removed = current.splice(index, 1)[0]
  if (removed?.id) {
    await deleteAlert({ id: removed.id })
  }
  emit('update:model-value', current)
}
</script>

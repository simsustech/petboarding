<template>
  <q-styled-card>
    <template #title>
      <div class="row justify-end">
        <q-btn outline rounded icon="edit" @click="update">
          <q-tooltip>
            {{ lang.update }}
          </q-tooltip></q-btn
        >
      </div>
    </template>
    <q-list>
      <form-item field="firstName" :model-value="modelValue.firstName" />
      <form-item field="lastName" :model-value="modelValue.lastName" />
      <form-item
        :label="lang.contactPerson.fields.telephoneNumber"
        :model-value="modelValue.telephoneNumber"
      />
    </q-list>

    <template #actions>
      <!-- <div class="row full-width justify-center">
        <q-btn icon="edit" label="Update" @click="update" />
      </div> -->
    </template>
  </q-styled-card>
</template>

<script lang="ts">
export default {
  name: 'ContactPersonCard'
}
</script>
<script setup lang="ts">
import { ref, toRefs } from 'vue'
import { QStyledCard } from '@simsustech/quasar-components'
import type { ContactPerson } from '@petboarding/api/zod'
import { useLang } from '../../lang/index.js'
import { FormItem } from '@simsustech/quasar-components/form'

export interface Props {
  modelValue: ContactPerson
}
const props = defineProps<Props>()

const emit = defineEmits<{
  (
    e: 'update',
    {
      data,
      done
    }: {
      data: ContactPerson
      done: (success?: boolean) => void
    }
  ): void
}>()

const lang = useLang()

const loading = ref(false)

const { modelValue } = toRefs(props)

const update = () => {
  loading.value = true
  const done = () => (loading.value = false)
  emit('update', { data: modelValue.value, done })
}
</script>

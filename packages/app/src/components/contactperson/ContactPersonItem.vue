<template>
  <q-item>
    <q-item-section>
      <q-item-label>
        {{ `${modelValue.firstName} ${modelValue.lastName}` }}
      </q-item-label>
      <q-item-label caption>
        {{ modelValue.telephoneNumber }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { ContactPerson } from '@petboarding/api/zod'

export interface Props {
  modelValue: ContactPerson
}

defineProps<Props>()
</script>

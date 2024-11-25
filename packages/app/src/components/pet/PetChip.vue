<template>
  <q-chip>
    {{
      `${modelValue.name} ${truncate(modelValue.customer?.lastName || '', 6)}`
    }}
  </q-chip>
</template>

<script setup lang="ts">
import { Pet as PetType, Customer as CustomerType } from '@petboarding/api/zod'

type Pet = Pick<PetType, 'name'> & { customer: Pick<CustomerType, 'lastName'> }

interface Props {
  modelValue: Pick<Pet, 'name' | 'customer'>
}

defineProps<Props>()

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + '...' : str
}
</script>

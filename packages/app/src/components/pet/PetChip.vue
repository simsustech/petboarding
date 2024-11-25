<template>
  <q-chip>
    {{
      `${modelValue.name} ${truncateLastName(modelValue.customer?.lastName || '')}`
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

const truncate = (str: string, n: number) =>
  str.length > n ? str.slice(0, n) + '...' : str

const truncateLastName = (lastName: string) => {
  const parts = lastName.split(' ')
  parts.splice(-1, 1, truncate(parts.at(-1) || '', 3))
  return parts.join(' ')
}
</script>

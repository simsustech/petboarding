<template>
  <q-select
    v-bind="attrs"
    :model-value="modelValue"
    :options="options"
    label="Email"
    emit-value
    map-options
    fill-input
    use-input
    input-debounce="500"
    hide-selected
    @filter="filterFn"
    @update:model-value="$emit('update:model-value', $event)"
  ></q-select>
</template>

<script lang="ts">
export default {
  name: 'AccountSelect'
}
</script>

<script setup lang="ts">
import { QSelect } from 'quasar'
import { createUseTrpc } from '../../trpc.js'
import { reactive, ref, toRefs, useAttrs } from 'vue'

export interface Props {
  modelValue?: number
}
const props = defineProps<Props>()
const attrs = useAttrs()

const { useQuery } = await createUseTrpc()
const { modelValue } = toRefs(props)
const email = ref('')

const { data, execute } = useQuery('admin.findAccounts', {
  args: reactive({ email: email })
})

const options = ref<
  {
    label: string
    value: number
  }[]
>([])

const filterFn = (val, update) => {
  if (val === '') {
    options.value = []
    update()
  } else {
    email.value = val.toLowerCase()
    execute().then(() => {
      update(() => {
        options.value =
          data.value?.map((account) => ({
            label: account.email,
            value: account.id
          })) || []
      })
    })
  }
}
</script>

<template>
  <q-select
    v-bind="attrs"
    :model-value="modelValue"
    :options="options"
    :label="lang.search"
    emit-value
    map-options
    fill-input
    use-input
    input-debounce="500"
    hide-selected
    @filter="filterFn"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #before>
      <slot name="before" />
    </template>
    <template #option="{ itemProps, opt }">
      <q-item v-bind="itemProps">
        <q-item-section>
          <q-item-label>
            {{ opt.label }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-rating
            v-if="opt.rating"
            :model-value="opt.rating"
            icon="star_border"
            icon-selected="star"
            icon-half="star_half"
          />
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts">
export default {
  name: 'EmployeeCustomerSelect'
}
</script>

<script setup lang="ts">
import { QSelect } from 'quasar'
import { createUseTrpc } from '../../trpc.js'
import { ref, toRefs, useAttrs } from 'vue'
import { useLang } from '../../lang/index.js'

export interface Props {
  modelValue?: number
}
const props = defineProps<Props>()
const attrs = useAttrs()

const lang = useLang()
const { useQuery } = await createUseTrpc()
const { modelValue } = toRefs(props)
const searchPhrase = ref('')

const { data, execute } = useQuery('employee.searchCustomers', {
  args: () => searchPhrase.value,
  reactive: {
    args: true
  }
})

const options = ref([])

const filterFn = (val, update, abort) => {
  if (val === '') {
    options.value = []
  } else if (val.length < 2) {
    abort()
    return
  } else {
    searchPhrase.value = val.toLowerCase()
    execute().then(() => {
      update(() => {
        options.value = data.value.map((customer) => ({
          label: `${customer.firstName} ${customer.lastName} - ${customer.address} - ${customer.city}`,
          value: customer.id,
          rating: customer.rating
        }))
      })
    })
  }
}
</script>

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
    <template #prepend> <slot name="prepend" /> </template>
    <template #option="{ itemProps, opt }">
      <q-item v-bind="itemProps" :class="{ 'bg-grey-5': opt.deceased }">
        <q-item-section>
          <q-item-label>
            {{ opt.label }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-rating
            v-if="opt.rating"
            :model-value="opt.rating"
            icon="i-mdi-star-border"
            icon-selected="i-mdi-star"
            icon-half="i-mdi-star-half"
          />
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts">
export default {
  name: 'EmployeePetSelect'
}
</script>

<script setup lang="ts">
import { QSelect } from 'quasar'
import { createUseTrpc } from '../../trpc.js'
import { ref, toRefs, useAttrs } from 'vue'
import { useLang } from '../../lang/index.js'

export interface Props {
  modelValue?: number | number[]
}
const props = defineProps<Props>()
const attrs = useAttrs()

const lang = useLang()
const { useQuery } = await createUseTrpc()
const { modelValue } = toRefs(props)
const searchPhrase = ref('')

const { data, execute } = useQuery('employee.searchPets', {
  args: () => searchPhrase.value,
  reactive: {
    args: true
  }
})

const options = ref([])

const filterFn = (val, update) => {
  if (val === '') {
    options.value = []
  } else {
    searchPhrase.value = val.toLowerCase()
    execute().then(() => {
      update(() => {
        options.value = data.value.map((pet) => ({
          label: `${pet.name} ${pet.lastName} - ${pet.breed} - ${
            lang.value.pet.genders[pet.gender]
          }`,
          value: pet.id,
          rating: pet.rating,
          deceased: pet.deceased
        }))
      })
    })
  }
}
</script>

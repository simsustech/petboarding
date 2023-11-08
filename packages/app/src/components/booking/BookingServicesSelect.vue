<template>
  <q-select
    v-bind="attrs"
    :model-value="modelValue"
    :options="options"
    :label="`${lang.booking.fields.services}${required ? '*' : ''}`"
    emit-value
    map-options
    multiple
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #option="scope">
      <q-item v-if="allowHidden || !scope.opt.hidden" v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>{{ scope.opt.label }}</q-item-label>
          <q-item-label caption>{{ scope.opt.description }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-item-label>
            {{
              scope.opt.listPrice
                ? configuration.CURRENCY + scope.opt.listPrice
                : lang.tbd
            }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts">
export default {
  name: 'BookingServiceSelect'
}
</script>

<script setup lang="ts">
import { watch, useAttrs, ref, toRefs } from 'vue'
import { useQuasar } from 'quasar'
import { useLang, loadLang } from '../../lang/index.js'
import { Service } from '@petboarding/api/zod'
import { useConfiguration } from '../../configuration.js'

export interface Props {
  modelValue?: number[]
  required?: boolean
  services: Service[]
  allowHidden?: boolean
}
const props = defineProps<Props>()

const attrs = useAttrs()

const lang = useLang()
const configuration = useConfiguration()

const $q = useQuasar()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, () => {
  loadLang($q.lang.isoName)
})

const { services } = toRefs(props)

const options = ref(
  Object.values(services.value)?.map((service) => ({
    label: service.name,
    value: service.id,
    price: service.listPrice,
    description: service.description,
    hidden: service.hidden
  }))
)
</script>

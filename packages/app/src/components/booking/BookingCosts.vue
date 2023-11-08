<template>
  <q-markup-table>
    <thead>
      <tr>
        <th class="text-left">{{ lang.booking.costs.name }}</th>
        <th class="text-right">{{ lang.booking.costs.price }}</th>
        <th class="text-right">{{ lang.booking.costs.quantity }}</th>
        <th class="text-right">{{ lang.booking.costs.discount }}</th>
        <th class="text-right">{{ lang.booking.costs.total }}</th>
      </tr>
    </thead>
    <tbody v-for="(item, id) in modelValue.items" :key="id">
      <tr v-if="item.price">
        <td class="text-left">{{ item.name }}</td>
        <td class="text-right">
          {{ configuration.CURRENCY + (Number(item.price) / 100).toFixed(2) }}
        </td>
        <td class="text-right">{{ item.quantity }}</td>
        <td class="text-right">
          {{ configuration.CURRENCY + item.discount.toFixed(2) }}
        </td>
        <td class="text-right">
          {{
            configuration.CURRENCY +
            (
              (Number(item.price) / 100) * item.quantity -
              item.discount
            ).toFixed(2)
          }}
        </td>
      </tr>
    </tbody>
    <tbody>
      <tr>
        <td>
          {{ lang.pricesSubjectToChange }}
        </td>
        <td />
        <td />
        <td>{{ lang.booking.costs.total }}:</td>
        <td class="text-right">
          {{
            modelValue.total
              ? configuration.CURRENCY + modelValue.total.toFixed(2)
              : lang.tbd
          }}
        </td>
      </tr>
    </tbody>
  </q-markup-table>
</template>

<script lang="ts">
export default {
  name: 'BookingCosts'
}
</script>

<script setup lang="ts">
import { useLang } from '../../lang/index.js'
import { useConfiguration } from '../../configuration.js'

export interface BookingCosts {
  items: {
    name: string
    price: number
    quantity: number
    discount: number
  }[]
  total: number
}

export interface Props {
  modelValue: BookingCosts
}
defineProps<Props>()

const configuration = useConfiguration()
const lang = useLang()
</script>

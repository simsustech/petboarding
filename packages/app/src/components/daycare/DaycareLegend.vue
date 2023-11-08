<template>
  <div class="row">
    <div class="col-12 col-sm">
      <q-badge rounded :color="DAYCARE_DATE_COLORS.approved" /><a>{{
        lang.daycare.status.approved
      }}</a>
    </div>
    <div class="col-12 col-sm">
      <q-badge rounded :color="DAYCARE_DATE_COLORS.cancelled" /><a>{{
        lang.daycare.status.cancelled
      }}</a>
    </div>
    <div class="col-12 col-sm">
      <q-badge rounded :color="DAYCARE_DATE_COLORS.pending" /><a>{{
        lang.daycare.status.pending
      }}</a>
    </div>
    <div class="col-12 col-sm">
      <q-badge rounded :color="DAYCARE_DATE_COLORS.rejected" /><a>{{
        lang.daycare.status.rejected
      }}</a>
    </div>
    <!-- <div class="col-12 col-sm">
      <q-badge rounded :color="DAYCARE_DATE_COLORS.standby" /><a>{{
        lang.daycare.status.standby
      }}</a>
    </div> -->
  </div>
</template>

<script lang="ts">
export default {
  name: 'DaycareLegend'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { useLang } from '../../lang/index.js'
import { DAYCARE_DATE_COLORS } from '../../configuration.js'

const lang = useLang()

const variables = ref({
  // header: lang.value.some.nested.prop
})
const functions = ref({
  // submit
})
defineExpose({
  variables,
  functions
})
</script>

<template>
  <div class="row">
    <div class="col-12 col-sm">
      <q-badge rounded :color="AGENDA_CHIP_BADGE_COLORS.appointment">
        <q-icon
          class="q-ma-none q-pa-none"
          :name="AGENDA_CHIP_BADGE_ICONS.appointment"
          size="0.8em"
        />
      </q-badge>
      {{ lang.service.type.appointment }}
    </div>
    <div class="col-12 col-sm">
      <q-badge
        class="q-ml-lg"
        rounded
        :color="AGENDA_CHIP_BADGE_COLORS.isDoubleBooked"
      >
        <q-icon
          class="q-ma-none q-pa-none"
          :name="AGENDA_CHIP_BADGE_ICONS.isDoubleBooked"
          size="0.8em"
        />
      </q-badge>
      {{ lang.booking.messages.isDoubleBooked }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AGENDA_CHIP_BADGE_COLORS,
  AGENDA_CHIP_BADGE_ICONS
} from '../../configuration.js'
import { useLang } from '../../lang/index.js'

const lang = useLang()
</script>

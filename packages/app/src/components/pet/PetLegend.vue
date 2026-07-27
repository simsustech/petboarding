<template>
  <div class="row">
    <div class="col-12 col-sm">
      <q-badge :color="PET_CHIP_BADGE_COLORS.food" rounded>
        <q-icon :name="PET_CHIP_BADGE_ICONS.food" size="0.8em" />
      </q-badge>
      {{ lang.pet.messages.foodMoreThanTwoTimesADay }}
    </div>
    <div class="col-12 col-sm">
      <q-badge :color="PET_CHIP_BADGE_COLORS.medicines" rounded>
        <q-icon :name="PET_CHIP_BADGE_ICONS.medicines" size="0.8em" />
      </q-badge>
      {{ lang.pet.messages.hasMedication }}
    </div>
    <div class="col-12 col-sm">
      <q-badge :color="PET_CHIP_BADGE_COLORS.vaccinations" rounded>
        <q-icon :name="PET_CHIP_BADGE_ICONS.vaccinations" size="0.8em" />
      </q-badge>
      {{ lang.pet.vaccination.missingVaccinations }}
    </div>
    <div v-for="alert in PET_ALERTS" :key="alert.value" class="col-12 col-sm">
      <q-badge :color="alert.color" rounded>
        <q-icon :name="alert.icon" size="0.8em" />
      </q-badge>
      {{ lang.pet.alerts[alert.value as keyof typeof lang.pet.alerts] }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '../../lang/index.js'
import {
  PET_CHIP_BADGE_COLORS,
  PET_CHIP_BADGE_ICONS
} from '../../configuration.js'
import { PET_ALERTS } from '@petboarding/tools/constants'

const lang = useLang()
</script>

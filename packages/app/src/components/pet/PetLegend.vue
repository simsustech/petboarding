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
  </div>
</template>

<script setup lang="ts">
import lang from 'src/lang/en-US.js'
import {
  PET_CHIP_BADGE_COLORS,
  PET_CHIP_BADGE_ICONS
} from '../../configuration.js'
</script>

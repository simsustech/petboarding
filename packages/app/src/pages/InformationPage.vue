<template>
  <q-banner rounded>
    <template v-slot:avatar>
      <q-icon name="warning" color="warning" />
    </template>
    <a href="/termsandconditions.pdf" target="_blank">{{
      lang.information.messages.termsAndConditions
    }}</a>
  </q-banner>
  <q-banner rounded>
    <template v-slot:avatar>
      <q-icon name="warning" color="warning" />
    </template>
    <a>{{ lang.information.messages.petHealth }}</a>
  </q-banner>
  <q-banner rounded>
    <template v-slot:avatar>
      <q-icon name="info" color="info" />
    </template>
    <a>{{ lang.information.messages.openingTimes }}</a>
  </q-banner>
  <q-banner rounded class="bg-red-2">
    <template v-slot:avatar>
      <q-icon name="priority_high" color="red" />
    </template>
    <a>{{ lang.information.messages.vaccinations }}</a>
  </q-banner>
</template>

<script setup lang="ts">
import { useLang } from '../lang/index.js'

const lang = useLang()
</script>

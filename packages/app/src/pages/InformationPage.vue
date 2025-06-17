<template>
  <q-banner rounded>
    <template #avatar>
      <q-icon name="i-mdi-warning" color="warning" />
    </template>
    <a href="/print/termsandconditions" target="_blank">{{
      lang.information.messages.termsAndConditions
    }}</a>
  </q-banner>
  <q-banner rounded>
    <template #avatar>
      <q-icon name="i-mdi-warning" color="warning" />
    </template>
    <a>{{ lang.information.messages.petHealth }}</a>
  </q-banner>
  <q-banner rounded>
    <template #avatar>
      <q-icon name="i-mdi-info" color="info" />
    </template>
    <a>{{ lang.information.messages.openingTimes }}</a>
  </q-banner>
  <q-banner rounded class="bg-red-2">
    <template #avatar>
      <q-icon name="i-mdi-exclamation" color="red" />
    </template>
    <a>{{ lang.information.messages.vaccinations }}</a>
  </q-banner>
</template>

<script setup lang="ts">
import { useLang } from '../lang/index.js'

const lang = useLang()
</script>

<template>
  <q-list separator>
    <q-item to="/admin/financial/overview">
      <q-item-section avatar>
        <q-icon name="i-mdi-view-dashboard" />
      </q-item-section>
      <q-item-section>
        <q-item-label> {{ lang.overview.title }} </q-item-label>
      </q-item-section>
    </q-item>
    <q-item to="/admin/financial/bookings">
      <q-item-section avatar>
        <q-icon name="i-mdi-calendar" />
      </q-item-section>
      <q-item-section>
        <q-item-label> {{ lang.booking.title }} </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { useLang } from '../../lang/index.js'

const lang = useLang()
</script>

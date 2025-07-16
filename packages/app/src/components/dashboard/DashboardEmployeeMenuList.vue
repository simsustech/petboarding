<template>
  <q-list separator>
    <q-item clickable to="/employee/overview">
      <q-item-section avatar>
        <q-icon name="i-mdi-calendar-today" />
      </q-item-section>
      <q-item-section>
        <q-item-label> {{ lang.dayOverview }} </q-item-label>
      </q-item-section>
    </q-item>
    <q-item clickable to="/employee/agenda">
      <q-item-section avatar>
        <q-icon name="i-mdi-calendar-month" />
      </q-item-section>
      <q-item-section>
        <q-item-label> {{ lang.agenda.title }} </q-item-label>
      </q-item-section>
    </q-item>
    <q-item clickable to="/employee/kennellayout">
      <q-item-section avatar>
        <q-icon name="i-mdi-housing-estate" />
      </q-item-section>
      <q-item-section>
        <q-item-label>
          {{ lang.kennellayout.title }}
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item clickable to="/employee/customers">
      <q-item-section avatar>
        <q-icon name="i-mdi-people" />
      </q-item-section>
      <q-item-section>
        <q-item-label> {{ lang.customers }} </q-item-label>
      </q-item-section>
    </q-item>
    <q-item clickable to="/employee/pets">
      <q-item-section avatar>
        <q-icon name="i-mdi-paw" />
      </q-item-section>
      <q-item-section>
        <q-item-label> {{ lang.pet.title }} </q-item-label>
      </q-item-section>
    </q-item>
    <q-item :inset-level="1" clickable to="/employee/labels/pets">
      <q-item-section avatar>
        <q-icon name="i-mdi-chevron-right" />
      </q-item-section>
      <q-item-section>
        <q-item-label> {{ lang.labels }} </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { useLang } from '../../lang/index.js'

const lang = useLang()
</script>

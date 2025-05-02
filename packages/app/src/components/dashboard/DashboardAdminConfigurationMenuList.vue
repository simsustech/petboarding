<template>
  <q-list separator>
    <q-item to="/admin/configuration/buildings">
      <q-item-section avatar>
        <q-icon name="i-mdi-building" />
      </q-item-section>
      <q-item-section>
        <q-item-label> {{ lang.building.title }} </q-item-label>
      </q-item-section>
    </q-item>
    <q-item to="/admin/configuration/kennels">
      <q-item-section avatar>
        <q-icon name="i-mdi-housing-estate" />
      </q-item-section>
      <q-item-section>
        <q-item-label> {{ lang.kennel.title }} </q-item-label>
      </q-item-section>
    </q-item>
    <q-item to="/admin/configuration/categories">
      <q-item-section avatar>
        <q-icon name="i-mdi-category" />
      </q-item-section>
      <q-item-section>
        <q-item-label> {{ lang.category.title }} </q-item-label>
      </q-item-section>
    </q-item>
    <q-item to="/admin/configuration/openingtimes">
      <q-item-section avatar>
        <q-icon name="i-mdi-access-time" />
      </q-item-section>
      <q-item-section>
        <q-item-label>
          {{ lang.configuration.openingTimes }}
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item to="/admin/configuration/services">
      <q-item-section avatar>
        <q-icon name="i-mdi-dog-service" />
      </q-item-section>
      <q-item-section>
        <q-item-label> {{ lang.service.title }} </q-item-label>
      </q-item-section>
    </q-item>
    <q-item to="/admin/configuration/daycaresubscriptions">
      <q-item-section avatar>
        <q-icon name="i-mdi-events" />
      </q-item-section>
      <q-item-section>
        <q-item-label>
          {{ lang.daycareSubscription.title }}
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item to="/admin/configuration/integrations">
      <q-item-section avatar>
        <q-icon name="i-mdi-external-link" />
      </q-item-section>
      <q-item-section>
        <q-item-label>
          {{ lang.configuration.integrations }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { useLang } from '../../lang/index.js'

const lang = useLang()
</script>

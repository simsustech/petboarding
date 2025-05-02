<template>
  <q-list separator>
    <q-item clickable to="/account/customer">
      <q-item-section avatar>
        <q-icon name="i-mdi-person" />
      </q-item-section>
      <q-item-section>
        <q-item-label>
          {{ lang.dashboard.account.menu.editCustomer }}
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item clickable to="/account/contactpeople">
      <q-item-section avatar>
        <q-icon name="i-mdi-people" />
      </q-item-section>
      <q-item-section>
        <q-item-label>
          {{ lang.dashboard.account.menu.editContactPeople }}
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item clickable to="/account/pets">
      <q-item-section avatar>
        <q-icon name="i-mdi-paw" />
      </q-item-section>
      <q-item-section>
        <q-item-label>
          {{ lang.dashboard.account.menu.editPets }}
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item clickable to="/account/bookings">
      <q-item-section avatar>
        <q-icon name="i-mdi-calendar" />
      </q-item-section>
      <q-item-section>
        <q-item-label>
          {{ lang.dashboard.account.menu.addOrViewBooking }}
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item clickable to="/account/daycare">
      <q-item-section avatar>
        <q-icon name="i-mdi-events" />
      </q-item-section>
      <q-item-section>
        <q-item-label>
          {{ lang.dashboard.account.menu.addOrViewDaycareDates }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { useLang } from '../../lang/index.js'

const lang = useLang()
</script>

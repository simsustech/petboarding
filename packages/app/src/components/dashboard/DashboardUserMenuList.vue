<template>
  <q-list>
    <q-item clickable to="/account/customer">
      <q-item-section>
        <q-item-label>
          {{ lang.dashboard.user.menu.editCustomer }}
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-icon name="chevron_right" />
      </q-item-section>
    </q-item>
    <q-item clickable to="/account/pets">
      <q-item-section>
        <q-item-label>
          {{ lang.dashboard.user.menu.editPets }}
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-icon name="chevron_right" />
      </q-item-section>
    </q-item>
    <q-item clickable to="/account/bookings">
      <q-item-section>
        <q-item-label>
          {{ lang.dashboard.user.menu.addOrViewBooking }}
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-icon name="chevron_right" />
      </q-item-section>
    </q-item>
    <q-item clickable to="/account/daycare">
      <q-item-section>
        <q-item-label>
          {{ lang.dashboard.user.menu.addOrViewDaycareDates }}
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-icon name="chevron_right" />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { useLang } from '../../lang/index.js'

const lang = useLang()
</script>

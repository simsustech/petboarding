<template>
  <q-list separator>
    <q-item to="/admin/financial">
      <q-item-section avatar>
        <q-icon name="i-mdi-finance" />
      </q-item-section>
      <q-item-section>
        <q-item-label> {{ lang.financial.title }} </q-item-label>
      </q-item-section>
    </q-item>
    <q-item to="/admin/accounts">
      <q-item-section avatar>
        <q-icon name="i-mdi-people" />
      </q-item-section>
      <q-item-section>
        <q-item-label> Accounts </q-item-label>
      </q-item-section>
    </q-item>
    <q-item to="/admin/bookings">
      <q-item-section avatar>
        <q-icon name="i-mdi-calendar" />
      </q-item-section>
      <q-item-section>
        <q-item-label>
          {{ lang.booking.title }}
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-badge v-if="numberOfPendingBookings && numberOfPendingBookings > 0">
          {{ numberOfPendingBookings }}</q-badge
        >
      </q-item-section>
    </q-item>
    <q-item to="/admin/daycare">
      <q-item-section avatar>
        <q-icon name="i-mdi-events" />
      </q-item-section>
      <q-item-section>
        <q-item-label> {{ lang.daycare.title }} </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-badge
          v-if="numberOfPendingDaycareDates && numberOfPendingDaycareDates > 0"
        >
          {{ numberOfPendingDaycareDates }}</q-badge
        >
      </q-item-section>
    </q-item>
    <q-item to="/admin/occupancy">
      <q-item-section avatar>
        <q-icon name="i-mdi-widgets" />
      </q-item-section>
      <q-item-section>
        <q-item-label> {{ lang.occupancy.title }} </q-item-label>
      </q-item-section>
    </q-item>
    <q-item to="/admin/announcements">
      <q-item-section avatar>
        <q-icon name="i-mdi-announcement" />
      </q-item-section>
      <q-item-section>
        <q-item-label>
          {{ lang.announcement.title }}
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item to="/admin/periods">
      <q-item-section avatar>
        <q-icon name="i-mdi-date-range" />
      </q-item-section>
      <q-item-section>
        <q-item-label> {{ lang.period.title }} </q-item-label>
      </q-item-section>
    </q-item>
    <q-item to="/admin/configuration">
      <q-item-section avatar>
        <q-icon name="i-mdi-cog" />
      </q-item-section>
      <q-item-section>
        <q-item-label>
          {{ lang.configuration.title }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { useLang } from '../../lang/index.js'

interface Props {
  numberOfPendingBookings?: number
  numberOfPendingDaycareDates?: number
}

defineProps<Props>()
const lang = useLang()
</script>

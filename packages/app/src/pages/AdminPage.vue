<template>
  <q-page padding>
    <div class="row">
      <dashboard-admin-menu-list
        class="col-12 col-md-4"
        :number-of-pending-bookings="numberOfPendingBookings"
        :number-of-pending-daycare-dates="numberOfPendingDaycareDates"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import DashboardAdminMenuList from '../components/dashboard/DashboardAdminMenuList.vue'
import { useAdminGetBookingsCount } from '../queries/admin/booking.js'
import { useAdminGetDaycareCount } from '../queries/admin/daycare.js'

const { bookingsCount: numberOfPendingBookings } = useAdminGetBookingsCount()
const { daycareCount: numberOfPendingDaycareDates } = useAdminGetDaycareCount()
</script>

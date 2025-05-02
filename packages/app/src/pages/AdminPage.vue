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
import DashboardAdminMenuList from 'src/components/dashboard/DashboardAdminMenuList.vue'
import { createUseTrpc } from '../trpc.js'
import { BOOKING_STATUS, DAYCARE_DATE_STATUS } from '@petboarding/api/zod'

const { useQuery } = await createUseTrpc()

const { data: numberOfPendingBookings } = useQuery('admin.getBookingsCount', {
  args: {
    status: BOOKING_STATUS.PENDING
  },
  immediate: true
})

const { data: numberOfPendingDaycareDates } = useQuery(
  'admin.getDaycareCount',
  {
    args: {
      status: DAYCARE_DATE_STATUS.PENDING
    },
    immediate: true
  }
)
</script>

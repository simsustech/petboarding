<template>
  <q-page padding>
    <div class="grid grid-cols-12 gap-3">
      <q-card class="col-span-12 md:col-span-4">
        <q-card-section>
          <div class="text-center">
            {{ title }}
          </div>
        </q-card-section>
        <q-card-section>
          <div class="text-center">
            <q-img
              loading="eager"
              style="max-width: 100px"
              :img-style="{ overflow: 'visible', width: '100%' }"
              :src="logo"
            />
          </div>
        </q-card-section>
        <q-card-section>
          <dashboard-home-menu-list bordered />
        </q-card-section>
      </q-card>

      <q-card class="col-span-12 md:col-span-6">
        <announcements-list
          v-if="announcements"
          :model-value="announcements"
          bordered
        />
      </q-card>

      <!-- <div class="row justify-around q-mb-md">
      <announcements-list v-model="announcements" bordered />
    </div>
    <div class="row justify-around q-ma-lg"></div> -->
    </div>
  </q-page>
</template>

<scirpt lang="ts">
export default {
  name: 'IndexPage'
}
</scirpt>

<script setup lang="ts">
import AnnouncementsList from '../components/announcement/AnnouncementsList.vue'
import { useConfiguration } from '../configuration.js'
import { computed, onMounted, ref } from 'vue'
import petboardingLogo from '../assets/logo.svg'
import { useQuasar } from 'quasar'
import DashboardHomeMenuList from 'src/components/dashboard/DashboardHomeMenuList.vue'
import {
  usePublicGetAnnouncementsQuery,
  usePublicGetUrgentAnnouncementsQuery
} from 'src/queries/public'

const configuration = useConfiguration()
const $q = useQuasar()

const title = computed(() => configuration.value.TITLE)
const logo = ref(petboardingLogo)

const { announcements, refetch: execute } = usePublicGetAnnouncementsQuery()
const { urgentAnnouncements, refetch: executeUrgentAnnouncements } =
  usePublicGetUrgentAnnouncementsQuery()

onMounted(async () => {
  await fetch('./logo.svg').then(() => {
    logo.value = './logo.svg'
  })
  await execute()
  await executeUrgentAnnouncements()
  // executePeriods()
  if (urgentAnnouncements.value) {
    for (const urgentAnnouncement of urgentAnnouncements.value) {
      $q.dialog({
        title: urgentAnnouncement.title,
        message: urgentAnnouncement.message,
        persistent: true
      })
    }
  }
})
</script>

<template>
  <q-page padding>
    <!-- <div class="row justify-around q-mb-md">
      <announcements-list v-model="announcements" bordered />
    </div>
    <div class="row justify-around q-ma-lg"></div> -->
    <div class="row q-mb-md q-col-gutter-lg">
      <div class="col-md-8 justify-center row q-gutter-lg">
        <announcements-list
          v-if="announcements"
          :model-value="announcements"
          bordered
        />

        <q-styled-card v-if="user">
          <template #title> {{ `${lang.welcome} ${user.email}` }} </template>
          <q-list>
            <q-item clickable to="/user">
              <q-item-section>
                <q-item-label>
                  {{ lang.account.title }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable to="/account/customer">
              <q-item-section>
                <q-item-label>
                  {{ lang.customer.title }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-styled-card>
        <q-styled-card v-else>
          <template #title>
            <div class="text-center">
              {{ title }}
            </div>
          </template>
          <template #image>
            <div class="text-center">
              <q-img
                loading="eager"
                style="max-width: 100px"
                :img-style="{ overflow: 'visible', width: '100%' }"
                :src="logo"
              />
            </div>
          </template>
          <template #actions>
            <div class="row justify-center full-width">
              <login-button color="primary" @click="login" />
            </div>
          </template>
        </q-styled-card>

        <q-styled-card v-if="user?.roles?.includes('employee')">
          <template #title>
            {{ lang.employee }}
          </template>

          <q-list>
            <q-item clickable to="/employee/overview">
              <q-item-section>
                <q-item-label>
                  {{ lang.overview }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable to="/employee/agenda">
              <q-item-section>
                <q-item-label>
                  {{ lang.agenda.title }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-styled-card>
      </div>
      <div class="col-md-4">
        <q-banner rounded>
          <template #avatar>
            <q-icon name="i-mdi-info" color="info" />
          </template>
          <router-link to="/availability">{{
            lang.availability.title
          }}</router-link>
        </q-banner>

        <!-- <availability-card v-if="periods" :periods="periods" /> -->
      </div>
    </div>
    <div class="row justify-center q-gutter-md"></div>
  </q-page>
</template>

<scirpt lang="ts">
export default {
  name: 'IndexPage'
}
</scirpt>

<script setup lang="ts">
import { user, oAuthClient } from '../oauth.js'
import { LoginButton } from '@simsustech/quasar-components/authentication'
import { QStyledCard } from '@simsustech/quasar-components'
import AnnouncementsList from '../components/announcement/AnnouncementsList.vue'
import { useConfiguration } from '../configuration.js'
import { useLang } from '../lang/index.js'
import { createUseTrpc } from '../trpc.js'
import { computed, onMounted, ref } from 'vue'
import petboardingLogo from '../assets/logo.svg'
import { useQuasar } from 'quasar'

const { useQuery } = await createUseTrpc()
const configuration = useConfiguration()
const lang = useLang()
const $q = useQuasar()

const title = computed(() => configuration.value.TITLE)
const logo = ref(petboardingLogo)
const login = () => {
  if (oAuthClient.value) oAuthClient.value.signIn({})
}

const { data: announcements, execute } = useQuery('public.getAnnouncements')
const { data: urgentAnnouncements, execute: executeUrgentAnnouncements } =
  useQuery('public.getUrgentAnnouncements')

// const { data: periods, execute: executePeriods } = useQuery('public.getPeriods')

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

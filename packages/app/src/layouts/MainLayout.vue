<template>
  <q-layout view="lHh Lpr lFf">
    <div v-show="ready">
      <q-header elevated>
        <q-toolbar>
          <q-btn flat dense round aria-label="Menu" @click="toggleLeftDrawer">
            <q-icon :name="matMenu" />
          </q-btn>

          <q-toolbar-title> {{ title }} </q-toolbar-title>
          <q-language-select
            v-model="language"
            :language-imports="languageImports"
          />

          <user-menu-button
            v-if="user"
            color="accent"
            :user-route="userRoute"
            @sign-out="logout"
          />
          <login-button v-else color="accent" @click="login" />
          <q-btn icon="more_vert" flat>
            <q-menu>
              <q-list>
                <q-item clickable href="/privacypolicy.pdf" target="_blank">
                  <q-item-section>
                    <q-item-label>
                      {{ lang.privacyPolicy }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-toolbar>
      </q-header>

      <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
        <q-scroll-area
          style="height: calc(100% - 60px); border-right: 1px solid #ddd"
        >
          <div v-if="user">
            <q-list>
              <q-expansion-item
                ref="accountExpansionItemRef"
                :header-class="
                  route.path.includes('/account/') ? 'text-primary' : undefined
                "
              >
                <template #header>
                  <q-item-section avatar>
                    <q-icon name="person" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-section>
                      <q-item-label> Account </q-item-label>
                    </q-item-section>
                  </q-item-section>
                </template>
                <q-item :inset-level="1" to="/account/customer">
                  <q-item-section>
                    <q-item-label> {{ lang.customer.title }} </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item :inset-level="1" to="/account/contactpeople">
                  <q-item-section>
                    <q-item-label>
                      {{ lang.contactPerson.title }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item :inset-level="1" to="/account/pets">
                  <q-item-section>
                    <q-item-label> {{ lang.pet.title }} </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item :inset-level="1" to="/account/bookings">
                  <q-item-section>
                    <q-item-label> {{ lang.bookings }} </q-item-label>
                  </q-item-section></q-item
                >
                <q-item :inset-level="1" to="/account/daycare">
                  <q-item-section>
                    <q-item-label> {{ lang.daycare.title }} </q-item-label>
                  </q-item-section>
                </q-item>
              </q-expansion-item>
            </q-list>
            <q-separator />
          </div>
          <div v-if="user?.roles?.includes('employee')">
            <q-list>
              <q-expansion-item
                ref="employeeExpansionItemRef"
                :label="lang.employee"
                :header-class="
                  route.path.includes('/employee/') ? 'text-primary' : undefined
                "
              >
                <q-item :inset-level="1" to="/employee/overview">
                  <q-item-section>
                    <q-item-label> {{ lang.overview }} </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item :inset-level="1" to="/employee/agenda">
                  <q-item-section>
                    <q-item-label> {{ lang.agenda.title }} </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item :inset-level="1" to="/employee/customers">
                  <q-item-section>
                    <q-item-label> {{ lang.customers }} </q-item-label>
                  </q-item-section>
                </q-item>
                <q-expansion-item
                  :header-inset-level="1"
                  :content-inset-level="2"
                  to="/employee/pets"
                  :label="lang.pet.title"
                >
                  <q-item to="/employee/labels/pets">
                    <q-item-section>
                      <q-item-label> Labels </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-expansion-item>
                <q-item :inset-level="1" to="/employee/bookings">
                  <q-item-section>
                    <q-item-label> {{ lang.booking.title }} </q-item-label>
                  </q-item-section>
                </q-item>
              </q-expansion-item>
            </q-list>
          </div>
          <div v-if="user?.roles?.includes('administrator')">
            <q-list>
              <q-expansion-item
                ref="adminExpansionItemRef"
                :label="lang.administrator"
                :header-class="
                  route.path.includes('/admin/') ? 'text-primary' : undefined
                "
              >
                <template #header>
                  <q-item-section>
                    <q-item-label>
                      {{ lang.administrator }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon
                      v-if="
                        numberOfPendingBookings > 0 ||
                        numberOfPendingDaycareDates > 0
                      "
                      color="red"
                      name="priority_high"
                    />
                  </q-item-section>
                </template>
                <q-item :inset-level="1" to="/admin/accounts">
                  <q-item-section>
                    <q-item-label> Accounts </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item :inset-level="1" to="/admin/bookings">
                  <q-item-section>
                    <q-item-label>
                      {{ lang.booking.title }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge v-if="numberOfPendingBookings > 0">
                      {{ numberOfPendingBookings }}</q-badge
                    >
                  </q-item-section>
                </q-item>
                <q-item :inset-level="1" to="/admin/daycare">
                  <q-item-section>
                    <q-item-label> {{ lang.daycare.title }} </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge v-if="numberOfPendingDaycareDates > 0">
                      {{ numberOfPendingDaycareDates }}</q-badge
                    >
                  </q-item-section>
                </q-item>
                <q-item :inset-level="1" to="/admin/occupancy">
                  <q-item-section>
                    <q-item-label> {{ lang.occupancy.title }} </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item :inset-level="1" to="/admin/announcements">
                  <q-item-section>
                    <q-item-label> {{ lang.announcement.title }} </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item :inset-level="1" to="/admin/periods">
                  <q-item-section>
                    <q-item-label> {{ lang.period.title }} </q-item-label>
                  </q-item-section>
                </q-item>
                <q-expansion-item
                  :header-inset-level="1"
                  :content-inset-level="2"
                  :label="lang.configuration.title"
                >
                  <q-item to="/admin/configuration/categories">
                    <q-item-section>
                      <q-item-label> {{ lang.category.title }} </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item to="/admin/configuration/services">
                    <q-item-section>
                      <q-item-label> {{ lang.service.title }} </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item to="/admin/configuration/email">
                    <q-item-section>
                      <q-item-label>
                        {{ lang.configuration.emailTemplates }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item to="/admin/configuration/openingtimes">
                    <q-item-section>
                      <q-item-label>
                        {{ lang.configuration.openingTimes }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-expansion-item>
              </q-expansion-item>
            </q-list>
          </div>
          <q-separator />
          <q-list>
            <q-item to="/" exact>
              <q-item-section avatar>
                <q-icon color="primary" name="home" />
              </q-item-section>

              <q-item-section>Home</q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
        <q-space />
        <q-list v-if="!configuration.HIDE_BRANDING">
          <q-item>
            <q-item-section avatar>
              <petboarding-icon size="lg" />
            </q-item-section>
            <q-item-section>
              <q-item-label> Petboarding </q-item-label>
              <q-item-label caption> © simsustech </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-drawer>

      <q-page-container>
        <router-view />
      </q-page-container>
    </div>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { matMenu } from '@quasar/extras/material-icons'
import {
  LoginButton,
  UserMenuButton
} from '@simsustech/quasar-components/authentication'
import { QLanguageSelect } from '@simsustech/quasar-components'
import { useOAuthClient, userRouteKey, user, oAuthClient } from '../oauth.js'
import { useRoute, useRouter } from 'vue-router'
import { useLang, loadLang } from '../lang/index.js'
import { useConfiguration, loadConfiguration } from '../configuration'
import PetboardingIcon from '../components/PetboardingIcon.vue'
import { createUseTrpc } from '../trpc.js'

import type { QuasarLanguage } from 'quasar'
import { BOOKING_STATUS, DAYCARE_DATE_STATUS } from '@petboarding/api/zod'
import { loadLang as loadComponentsFormLang } from '@simsustech/quasar-components/form'
const configuration = useConfiguration()

const router = useRouter()
const route = useRoute()
const lang = useLang()

const $q = useQuasar()
const leftDrawerOpen = ref(false)

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const login = () => {
  if (oAuthClient.value) oAuthClient.value.signIn({})
}

const logout = () => {
  if (oAuthClient.value) oAuthClient.value.signOut({})
}

const userRoute = {
  name: userRouteKey
}

const title = computed(() => configuration.value.TITLE)
const language = ref($q.lang.isoName)

const quasarLang = import.meta.glob<QuasarLanguage>(
  '../../node_modules/quasar/lang/*.mjs'
)

const languageImports = ref(
  Object.entries(quasarLang).reduce(
    (acc, [key, value]) => {
      const langKey = key.split('/').at(-1)?.split('.').at(0)
      if (langKey) acc[langKey] = value
      return acc
    },
    {} as Record<string, () => Promise<QuasarLanguage>>
  )
)

if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, () => {
  loadLang($q.lang.isoName)
  loadComponentsFormLang($q.lang.isoName)
})

watch(route, (val) => {
  if (val.path.includes('account')) accountExpansionItemRef.value.show()
  if (val.path.includes('employee')) employeeExpansionItemRef.value.show()
  if (val.path.includes('admin')) adminExpansionItemRef.value.show()
})
const accountExpansionItemRef = ref()
const employeeExpansionItemRef = ref()
const adminExpansionItemRef = ref()

const numberOfPendingBookings = ref<number>(0)
const numberOfPendingDaycareDates = ref<number>(0)

watch(user, async () => {
  if (user.value?.roles?.includes('administrator')) {
    const { useQuery } = await createUseTrpc()
    const {
      data: bookingsCount,
      immediatePromise: immediaPromiseBookingsCount
    } = useQuery('admin.getBookingsCount', {
      args: {
        status: BOOKING_STATUS.PENDING
      },
      immediate: true
    })
    await immediaPromiseBookingsCount
    if (bookingsCount.value !== void 0)
      numberOfPendingBookings.value = bookingsCount.value

    const {
      data: daycareDatesCount,
      immediatePromise: immediatePromiseDaycareDatesCount
    } = useQuery('admin.getDaycareCount', {
      args: {
        status: DAYCARE_DATE_STATUS.PENDING
      },
      immediate: true
    })
    await immediatePromiseDaycareDatesCount
    if (daycareDatesCount.value !== void 0)
      numberOfPendingDaycareDates.value = daycareDatesCount.value
  }
})

const authenticatedRoutes = ['/account', '/employee', '/admin', '/user']
const isAuthenticatedRoute = (route: string) => {
  return authenticatedRoutes.some((authenticatedRoute) =>
    route.includes(authenticatedRoute)
  )
}

const ready = ref(false)
onMounted(async () => {
  if (__IS_PWA__) {
    await import('../pwa.js')
  }
  await loadConfiguration(language)
  await useOAuthClient()
  await oAuthClient.value?.getUserInfo()

  if (oAuthClient.value?.getAccessToken()) {
    user.value = await oAuthClient.value?.getUser()
    if (!user.value && isAuthenticatedRoute(route.path))
      router.push({ path: '/' })
  } else if (isAuthenticatedRoute(route.path)) {
    router.push({ path: '/' })
  }

  ready.value = true
})
</script>

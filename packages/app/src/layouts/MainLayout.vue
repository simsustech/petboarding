<template>
  <md3-layout :ready="ready">
    <template #header-toolbar>
      <q-toolbar-title> {{ title }} </q-toolbar-title>

      <user-menu-button
        v-if="user"
        color="accent"
        :user-route="userRoute"
        :icons="{ person: 'i-mdi-person' }"
        @sign-out="logout"
      />
      <login-button v-else color="accent" @click="login" />
      <q-btn icon="i-mdi-more-vert" flat>
        <q-menu>
          <q-list>
            <q-item clickable href="/privacypolicy.pdf" target="_blank">
              <q-item-section avatar>
                <q-icon name="i-mdi-document" />
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  {{ lang.privacyPolicy }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              :href="`https://www.petboarding.app/documentation/users?lang=${$q.lang.isoName}`"
              target="_blank"
            >
              <q-item-section avatar>
                <q-icon name="i-mdi-link" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ lang.documentation }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="configuration.SUPPORT_EMAIL">
              <q-item-section avatar>
                <q-icon name="i-mdi-email" />
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  {{ configuration.SUPPORT_EMAIL }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-language-select
              v-model="language"
              :language-imports="languageImports"
              :locales="languageLocales"
            />
            <q-item>
              <q-item-section label>
                {{ lang.darkMode }}
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  :model-value="$q.dark.isActive"
                  checked-icon="i-mdi-moon-and-stars"
                  unchecked-icon="i-mdi-brightness-7"
                  size="2em"
                  @update:model-value="$q.dark.set"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </template>

    <template #drawer-mini-navigation>
      <div class="col">
        <navigation-tabs vertical dense />
      </div>
    </template>

    <template #drawer>
      <q-scroll-area class="fit">
        <div class="q-px-md">
          <div class="text-overline">{{ title }}</div>
          <q-list>
            <q-item to="/" exact>
              <q-item-section avatar>
                <q-icon color="primary" name="i-mdi-home" />
              </q-item-section>

              <q-item-section>Home</q-item-section>
            </q-item>
          </q-list>
          <div v-if="user">
            <q-list>
              <q-expansion-item
                ref="accountExpansionItemRef"
                :content-inset-level="1"
                :header-class="
                  route.path.includes('/account/') ? 'text-primary' : undefined
                "
              >
                <template #header>
                  <q-item-section avatar>
                    <q-icon name="i-mdi-person" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-section>
                      <q-item-label> Account </q-item-label>
                    </q-item-section>
                  </q-item-section>
                </template>
                <q-item to="/account" exact>
                  <q-item-section>
                    <q-item-label> {{ lang.overview }} </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item to="/account/customer">
                  <q-item-section>
                    <q-item-label> {{ lang.customer.title }} </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item to="/account/contactpeople">
                  <q-item-section>
                    <q-item-label>
                      {{ lang.contactPerson.title }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item to="/account/pets">
                  <q-item-section>
                    <q-item-label> {{ lang.pet.title }} </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item to="/account/bookings">
                  <q-item-section>
                    <q-item-label> {{ lang.bookings.title }} </q-item-label>
                  </q-item-section></q-item
                >
                <q-item to="/account/daycare">
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
                :header-class="
                  route.path.includes('/employee/') ? 'text-primary' : undefined
                "
                :content-inset-level="1"
              >
                <template #header>
                  <q-item-section avatar>
                    <q-icon name="i-mdi-person-star" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-section>
                      <q-item-label> {{ lang.employee }} </q-item-label>
                    </q-item-section>
                  </q-item-section>
                </template>
                <q-item to="/employee/overview">
                  <q-item-section>
                    <q-item-label> {{ lang.dayOverview }} </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item to="/employee/agenda">
                  <q-item-section>
                    <q-item-label> {{ lang.agenda.title }} </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  to="/employee/kennellayout"
                  :active="route.path.includes('/employee/kennellayout')"
                >
                  <q-item-section>
                    <q-item-label>
                      {{ lang.kennellayout.title }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item to="/employee/customers">
                  <q-item-section>
                    <q-item-label> {{ lang.customers }} </q-item-label>
                  </q-item-section>
                </q-item>
                <q-expansion-item
                  :content-inset-level="1"
                  to="/employee/pets"
                  :label="lang.pet.title"
                >
                  <q-item to="/employee/labels/pets">
                    <q-item-section>
                      <q-item-label> Labels </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-expansion-item>
                <!-- <q-item  to="/employee/bookings">
                  <q-item-section>
                    <q-item-label> {{ lang.booking.title }} </q-item-label>
                  </q-item-section>
                </q-item> -->
              </q-expansion-item>
            </q-list>
          </div>
          <div v-if="user?.roles?.includes('administrator')">
            <q-list>
              <q-expansion-item
                ref="adminExpansionItemRef"
                :label="lang.administrator"
                :content-inset-level="1"
                :header-class="
                  route.path.includes('/admin/') ? 'text-primary' : undefined
                "
              >
                <template #header>
                  <q-item-section avatar>
                    <q-icon name="i-mdi-account-cog" />
                  </q-item-section>
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
                      name="i-mdi-exclamation"
                    />
                  </q-item-section>
                </template>
                <q-expansion-item
                  :content-inset-level="1"
                  :label="lang.financial.title"
                >
                  <q-item to="/admin/financial/overview">
                    <q-item-section>
                      <q-item-label> {{ lang.overview }} </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item to="/admin/financial/bookings">
                    <q-item-section>
                      <q-item-label> {{ lang.booking.title }} </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-expansion-item>
                <q-item to="/admin/accounts">
                  <q-item-section>
                    <q-item-label> Accounts </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item to="/admin/bookings">
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
                <q-item to="/admin/daycare">
                  <q-item-section>
                    <q-item-label> {{ lang.daycare.title }} </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge v-if="numberOfPendingDaycareDates > 0">
                      {{ numberOfPendingDaycareDates }}</q-badge
                    >
                  </q-item-section>
                </q-item>
                <q-item to="/admin/occupancy">
                  <q-item-section>
                    <q-item-label> {{ lang.occupancy.title }} </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item to="/admin/announcements">
                  <q-item-section>
                    <q-item-label>
                      {{ lang.announcement.title }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item to="/admin/periods">
                  <q-item-section>
                    <q-item-label> {{ lang.period.title }} </q-item-label>
                  </q-item-section>
                </q-item>
                <q-expansion-item
                  :header-inset-level="1"
                  :content-inset-level="2"
                  :label="lang.configuration.title"
                >
                  <q-item to="/admin/configuration/buildings">
                    <q-item-section>
                      <q-item-label> {{ lang.building.title }} </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item to="/admin/configuration/kennels">
                    <q-item-section>
                      <q-item-label> {{ lang.kennel.title }} </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item to="/admin/configuration/categories">
                    <q-item-section>
                      <q-item-label> {{ lang.category.title }} </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item to="/admin/configuration/openingtimes">
                    <q-item-section>
                      <q-item-label>
                        {{ lang.configuration.openingTimes }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item to="/admin/configuration/services">
                    <q-item-section>
                      <q-item-label> {{ lang.service.title }} </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item to="/admin/configuration/daycaresubscriptions">
                    <q-item-section>
                      <q-item-label>
                        {{ lang.daycareSubscription.title }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <!-- <q-item to="/admin/configuration/email">
                    <q-item-section>
                      <q-item-label>
                        {{ lang.configuration.emailTemplates }}
                      </q-item-label>
                    </q-item-section>
                  </q-item> -->
                  <q-item to="/admin/configuration/integrations">
                    <q-item-section>
                      <q-item-label>
                        {{ lang.configuration.integrations }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-expansion-item>
              </q-expansion-item>
            </q-list>
            <q-separator />
          </div>
        </div>
      </q-scroll-area>
      <q-list
        v-if="!configuration.HIDE_BRANDING"
        class="items-end justify-end self-end"
      >
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
    </template>

    <template #footer>
      <div class="column fit items-center justify-center">
        <navigation-tabs dense class="col-12 lt-md" />
      </div>
    </template>

    <template #fabs="{ showSticky }">
      <router-view name="fabs" :show-sticky="showSticky" />
    </template>
  </md3-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import {
  LoginButton,
  UserMenuButton
} from '@simsustech/quasar-components/authentication'
import { QLanguageSelect } from '@simsustech/quasar-components'
import { Md3Layout } from '@simsustech/quasar-components/md3'
import { useOAuthClient, userRouteKey, user, oAuthClient } from '../oauth.js'
import { useRoute, useRouter } from 'vue-router'
import { useLang, loadLang } from '../lang/index.js'
import { useConfiguration, loadConfiguration } from '../configuration'
import PetboardingIcon from '../components/PetboardingIcon.vue'
import { createUseTrpc } from '../trpc.js'
import { BOOKING_STATUS, DAYCARE_DATE_STATUS } from '@petboarding/api/zod'
import { loadLang as loadComponentsFormLang } from '@simsustech/quasar-components/form'
import { loadLang as loadModularApiQuasarComponentsCheckoutLang } from '@modular-api/quasar-components/checkout'
import NavigationTabs from './NavigationTabs.vue'

const configuration = useConfiguration()

const router = useRouter()
const route = useRoute()
const lang = useLang()

const $q = useQuasar()

const login = () => {
  if (oAuthClient.value) oAuthClient.value.signIn({})
}

const logout = () => {
  if (oAuthClient.value) oAuthClient.value.signOut({})
}

const userRoute = {
  name: userRouteKey
}

const title = computed(() => {
  let title = configuration.value.TITLE
  // @ts-expect-error key might not exist
  if (lang.value[route.meta?.lang]) title = lang.value[route.meta.lang].title
  return title
})
const language = ref($q.lang.isoName)

const languageLocales = ref([
  {
    icon: 'i-flagpack-nl',
    isoName: 'nl'
  },
  {
    icon: 'i-flagpack-us',
    isoName: 'en-US'
  }
])

// const languageImports = ref(
//   Object.entries(quasarLang).reduce(
//     (acc, [key, value]) => {
//       const langKey = key.split('/').at(-1)?.split('.').at(0)
//       if (langKey) acc[langKey] = value
//       return acc
//     },
//     {} as Record<string, () => Promise<{ default: QuasarLanguage }>>
//   )
// )
const languageImports = ref({
  nl: () => import(`../../node_modules/quasar/lang/nl.js`),
  'en-US': () => import(`../../node_modules/quasar/lang/en-US.js`)
})

if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, () => {
  loadLang($q.lang.isoName)
  loadComponentsFormLang($q.lang.isoName)
  loadModularApiQuasarComponentsCheckoutLang($q.lang.isoName)
})

watch(route, () => {
  // if (val.path.includes('account')) accountExpansionItemRef.value.show()
  // if (val.path.includes('employee')) employeeExpansionItemRef.value.show()
  // if (val.path.includes('admin')) adminExpansionItemRef.value.show()
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

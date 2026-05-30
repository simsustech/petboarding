import { ref } from 'vue'
import { Loading } from 'quasar'
import { useLang } from './lang/index.js'
import type { Pet } from '@petboarding/api/zod'
import { PET_SPECIES } from '@petboarding/tools/constants'
import { QuasarTheme } from 'unocss-preset-quasar/theme'
import { Locales } from '@simsustech/quasar-components/form'

const lang = useLang()

export type PetKennel = Pick<Pet, 'id' | 'name' | 'food' | 'medicines'> & {
  customer: {
    lastName: string
  }
  kennelId: number | null
  bookingId?: number
  daycareDateId?: number
  arrivalTimeId?: number
  departureTimeId?: number
  relations?: Record<number, { rating: number; name: string; comment?: string }>
}

export interface PETBOARDING_CLIENT_CONFIGURATION {
  API_HOST?: string
  LICENSE_KEY?: string
  LANG: string
  COUNTRY: string
  TITLE?: string
  ALLOWED_SPECIES?: (typeof PET_SPECIES)[number][]
  CURRENCY: 'EUR' | 'USD'
  HIDE_BRANDING: boolean
  DAYCARE_DISABLED_WEEKDAYS?: number[]
  MANDATORY_VACCINATIONS_DOG?: string[]
  MANDATORY_VACCINATIONS_CAT?: string[]
  TERMS_AND_CONDITIONS_URL?: string
  SASS_VARIABLES?: {
    $primary?: string
    $secondary?: string
    $accent?: string
    $dark?: string
    $positive?: string
    $negative?: string
    $info?: string
    $warning?: string
  }
  UNIT_OF_MASS?: 'kg' | 'lbs'
  INTEGRATIONS?: {
    slimfact: {
      host: string
    }
  }
  SUPPORT_EMAIL?: string
  THEME_COLORS?: QuasarTheme['colors']
}
export const BOOKING_ICON = ref({
  approved: 'i-mdi-check',
  rejected: 'i-mdi-block',
  canceled: 'i-mdi-clear',
  canceledoutsideperiod: 'i-mdi-cancel',
  pending: 'i-mdi-hourglass-empty',
  standby: 'i-mdi-hourglass-full',
  awaitingdownpayment: 'i-mdi-hourglass'
})

export const BOOKING_ICON_COLOR = ref({
  approved: 'green',
  rejected: 'red',
  canceled: 'red',
  canceledoutsideperiod: 'red',
  pending: 'grey',
  standby: 'yellow',
  awaitingdownpayment: 'green'
})

export const DAYCARE_DATE_COLORS = {
  approved: 'green',
  rejected: 'red',
  canceled: 'red',
  pending: 'grey',
  standby: 'yellow',
  default: 'red-5'
} as const

export const DAYCARE_DATE_BUTTON_BG_CLASSES = {
  approved: ['bg-green'],
  rejected: ['bg-red'],
  canceled: ['bg-red'],
  pending: ['bg-grey'],
  standby: ['bg-yellow'],
  default: ['bg-blue-5']
} as const

export const DAYCARE_DATE_BUTTON_OUTLINE_CLASSES = {
  default: ['!border-blue-5 border-2px']
} as const

export const DAYCARE_DATE_ICONS = {
  approved: 'i-mdi-check',
  rejected: 'i-mdi-block',
  canceled: 'i-mdi-clear',
  pending: 'i-mdi-hourglass-empty',
  standby: 'i-mdi-hourglass-full'
}

export const AGENDA_CHIP_BADGE_COLORS = {
  appointment: 'light-blue',
  isDoubleBooked: 'deep-orange'
}

export const AGENDA_CHIP_BADGE_ICONS = {
  appointment: 'i-mdi-event',
  isDoubleBooked: 'i-mdi-event-busy'
}

export const PET_CHIP_BADGE_COLORS = {
  food: 'yellow',
  medicines: 'orange',
  vaccinations: 'red'
}

export const PET_CHIP_BADGE_ICONS = {
  food: 'i-mdi-restaurant',
  medicines: 'i-mdi-medical-bag',
  vaccinations: 'i-mdi-needle'
}

export const configuration = ref<PETBOARDING_CLIENT_CONFIGURATION>({
  LANG: import.meta.env.VITE_LANG || 'en-US',
  COUNTRY: import.meta.env.VITE_COUNTRY || 'NL',
  TITLE: import.meta.env.VITE_TITLE,
  CURRENCY: 'EUR',
  HIDE_BRANDING: false
})

export const useConfiguration = () => configuration

export const loadConfiguration = async (locale: Ref<string>) => {
  Loading.show({
    message: lang.value.configuration.loading + '...',
    boxClass: 'bg-grey-2 text-grey-9',
    spinnerColor: 'primary'
  })
  return fetch('/configuration')
    .then((res) => res.json())
    .then((res) => {
      configuration.value = { ...configuration.value, ...res }
      if (configuration.value.LANG) locale.value = configuration.value.LANG
    })
    .then(() => Loading.hide())
    .catch(() => {
      Loading.show({
        message: lang.value.configuration.errorLoading,
        messageColor: 'red',
        boxClass: 'bg-grey-2 text-grey-9',
        spinner: undefined
      })
    })
}

export const languageLocales = ref([
  {
    icon: 'i-flagpack-nl',
    bcp47: 'nl-NL'
  },
  {
    icon: 'i-flagpack-us',
    bcp47: 'en-US'
  }
])

export const countryOptions = ref([
  {
    icon: 'i-flagpack-nl',
    iso3166: 'NL'
  },
  {
    icon: 'i-flagpack-us',
    iso3166: 'US'
  }
])

export const languageImports = ref({
  nl: () => import(`quasar/lang/nl.js`),
  'en-US': () => import(`quasar/lang/en-US.js`)
})

export const quasarLanguageMap: Partial<Record<Locales, string>> = {
  'en-US': 'en-US',
  'nl-NL': 'nl'
}

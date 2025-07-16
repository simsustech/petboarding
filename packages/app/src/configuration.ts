import { ref } from 'vue'
import { Loading, setCssVar } from 'quasar'
import { useLang } from './lang/index.js'
import { Pet, PET_SPECIES } from '@petboarding/api/zod'
import { QuasarTheme } from 'unocss-preset-quasar/theme'

const lang = useLang()

export type PetKennel = Pick<Pet, 'id' | 'name' | 'food' | 'medicines'> & {
  customer: {
    lastName: string
  }
  kennelId: number | null
  bookingId?: number
  daycareDateId?: number
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
  standby: 'yellow'
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
  TITLE: import.meta.env.VITE_TITLE || 'Petboarding',
  CURRENCY: 'EUR',
  HIDE_BRANDING: false
})

export const useConfiguration = () => configuration

export const loadConfiguration = async () => {
  Loading.show({
    message: lang.value.configuration.loading + '...',
    spinnerColor: 'primary'
  })
  return fetch('/configuration')
    .then((res) => res.json())
    .then((res) => {
      configuration.value = { ...configuration.value, ...res }
      // if (configuration.value.LANG) language.value = configuration.value.LANG
    })
    .then(() => {
      const sassVariables = configuration.value.SASS_VARIABLES
      if (sassVariables) {
        for (const key in sassVariables) {
          if (sassVariables[key]) setCssVar(key.slice(1), sassVariables[key])
        }
      }
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

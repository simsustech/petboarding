import { Ref, ref } from 'vue'
import { Loading, setCssVar } from 'quasar'
import { useLang } from './lang/index.js'
import { PET_SPECIES } from '@petboarding/api/zod'

const lang = useLang()

export interface PETBOARDING_CLIENT_CONFIGURATION {
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
      hostname: string
    }
  }
}
export const BOOKING_ICON = ref({
  approved: 'check',
  rejected: 'block',
  canceled: 'clear',
  canceledoutsideperiod: 'cancel',
  pending: 'hourglass_empty',
  standby: 'hourglass_full',
  awaitingdownpayment: 'hourglass_top'
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
  approved: 'check',
  rejected: 'block',
  canceled: 'clear',
  pending: 'hourglass_empty',
  standby: 'hourglass_full'
}

export const BOOKING_SERVICE_COLORS = {
  appointment: 'yellow'
}

export const configuration = ref<PETBOARDING_CLIENT_CONFIGURATION>({
  LANG: import.meta.env.VITE_LANG || 'en-US',
  COUNTRY: import.meta.env.VITE_COUNTRY || 'NL',
  TITLE: import.meta.env.VITE_TITLE || 'Petboarding',
  CURRENCY: 'EUR',
  HIDE_BRANDING: false
})

export const useConfiguration = () => configuration

export const loadConfiguration = async (language: Ref<string>) => {
  Loading.show({
    message: lang.value.configuration.loading + '...',
    boxClass: 'bg-grey-2 text-grey-9',
    spinnerColor: 'primary'
  })
  return fetch('/configuration')
    .then((res) => res.json())
    .then((res) => {
      configuration.value = { ...configuration.value, ...res }
      if (configuration.value.LANG) language.value = configuration.value.LANG
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

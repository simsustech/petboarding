import { ref, type Ref } from 'vue'
import { Loading, Notify } from 'quasar'
import { useLang } from './lang/index.js'
import type { Pet } from '@petboarding/api/zod'
import {
  type PET_SPECIES,
  PET_ALERT_CONDITIONS
} from '@petboarding/tools/constants'
import {
  alertToken,
  badgeToken,
  iconToken,
  inkToken,
  statusToken
} from './theme-tokens.js'
import type { QuasarTheme } from 'unocss-preset-quasar/theme'
import type { Locales } from '@simsustech/quasar-components/form'

// Toasts use Quasar's default position (bottom). The earlier top placement is
// not restored: it existed to keep the toast off the mobile tab bar, and the
// bottom default was preferred anyway (reverted 2026-10-08).

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
  alerts?: PetAlert[]
}

export interface PetAlert {
  id?: number
  condition: PET_ALERT_CONDITIONS
  startDate: string | null
  endDate: string | null
}

/**
 * The alert family as colour *names* — `alert-in-heat` … — which Quasar composes
 * into `bg-<name>` at runtime and which `themeTokenColors` (in
 * `vitrify.config.ts`) gives a rule: `.bg-alert-in-heat{background-color:var(--q-alert-in-heat)}`.
 *
 * Derived from the enum rather than listed, so a new condition cannot be
 * forgotten here. `PET_ALERTS[].color` used to carry these as wind4 palette
 * names from `@petboarding/tools` — a presentation detail that does not belong
 * in a shared package, and a value that could not follow a colour scheme.
 */
export const PET_ALERT_COLORS = Object.fromEntries(
  Object.values(PET_ALERT_CONDITIONS).map((condition) => [
    condition,
    alertToken(condition)
  ])
) as Record<PET_ALERT_CONDITIONS, string>

/** The ink on each fill: `on-alert-in-heat` … → `--q-on-surface`. */
export const PET_ALERT_INK_COLORS = Object.fromEntries(
  Object.values(PET_ALERT_CONDITIONS).map((condition) => [
    condition,
    inkToken(alertToken(condition))
  ])
) as Record<PET_ALERT_CONDITIONS, string>

/**
 * The tile's classes as literals, so UnoCSS's content scan sees the exact class
 * (a `bg-${…}` template is invisible to it). Solid now, rather than the 40% tint
 * that stood in while no fill had a dark value: each condition has one value per
 * scheme, so the fill carries the scheme and the ink clears 4.5:1 in both
 * (6.10–7.99 light, 6.10–7.02 dark).
 */
export const PET_ALERT_FILL_CLASSES: Record<PET_ALERT_CONDITIONS, string> = {
  [PET_ALERT_CONDITIONS.IN_HEAT]: 'bg-alert-in-heat',
  [PET_ALERT_CONDITIONS.NEEDS_REST]: 'bg-alert-needs-rest',
  [PET_ALERT_CONDITIONS.AGGRESSIVE]: 'bg-alert-aggressive',
  [PET_ALERT_CONDITIONS.DIABETIC]: 'bg-alert-diabetic'
}

/** The ink that sits on each tile, named per condition so a fill can differ. */
export const PET_ALERT_INK_CLASSES: Record<PET_ALERT_CONDITIONS, string> = {
  [PET_ALERT_CONDITIONS.IN_HEAT]: 'text-on-alert-in-heat',
  [PET_ALERT_CONDITIONS.NEEDS_REST]: 'text-on-alert-needs-rest',
  [PET_ALERT_CONDITIONS.AGGRESSIVE]: 'text-on-alert-aggressive',
  [PET_ALERT_CONDITIONS.DIABETIC]: 'text-on-alert-diabetic'
}

/**
 * An alert row as the API's `Pet` carries it: its dates are optional-with-null
 * there, where `PetAlert` (the app's read/write shape) requires them. A surface
 * that renders rows straight off the model types them from the model rather than
 * casting between the two spellings.
 */
export type PetAlertRow = NonNullable<Pet['alerts']>[number]

/**
 * Icons as literals, not derived from `PET_ALERTS`: UnoCSS's content scan reaches
 * this file but not `@petboarding/tools`, where the icon values live — a class that
 * exists only as a value there is never generated. `Record<…>` keeps the map
 * exhaustive, so a new condition fails to compile until its icon is listed.
 */
export const PET_ALERT_ICONS: Record<PET_ALERT_CONDITIONS, string> = {
  [PET_ALERT_CONDITIONS.IN_HEAT]: 'i-mdi-paw',
  [PET_ALERT_CONDITIONS.NEEDS_REST]: 'i-mdi-bed',
  [PET_ALERT_CONDITIONS.AGGRESSIVE]: 'i-mdi-alert',
  [PET_ALERT_CONDITIONS.DIABETIC]: 'i-mdi-needle'
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
  DAYCARE_CUTOFF_PERIOD_HOURS?: number
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

/**
 * Booking-status glyphs — a *foreground* accent, not a fill. The icon sits on the
 * surface, so each status needs a value that reads on a light **and** a dark one
 * (dark-in-light, bright-in-dark), which is why these are `icon-*` tokens and not
 * the status fills. Measured against the surface: 5.92–7.48 light, 5.37–12.11
 * dark. The light halves keep the hues these had as palette names.
 */
export const BOOKING_ICON_COLOR = ref({
  approved: iconToken('approved'),
  rejected: iconToken('rejected'),
  canceled: iconToken('canceled'),
  canceledoutsideperiod: iconToken('canceled'),
  pending: iconToken('pending'),
  standby: iconToken('standby'),
  awaitingdownpayment: iconToken('approved')
})

/**
 * The status *names* the daycare legend and the agenda badges hand to Quasar,
 * each one the token it means. `default` is not a status — a daycare date with
 * no booking — and keeps its palette name.
 */
export const DAYCARE_DATE_COLORS = {
  approved: statusToken('approved'),
  rejected: statusToken('rejected'),
  canceled: statusToken('canceled'),
  pending: statusToken('pending'),
  standby: statusToken('standby'),
  default: 'red-5'
} as const

/**
 * The date cell's classes: a status fill and the ink that belongs on it. The ink
 * is the half that was missing — the label inherited the theme's text colour, so
 * a light fill with near-white text measured 1.04–1.45:1 in a dark theme.
 */
export const DAYCARE_DATE_BUTTON_BG_CLASSES = {
  approved: ['bg-status-approved', 'text-on-status-approved'],
  rejected: ['bg-status-rejected', 'text-on-status-rejected'],
  canceled: ['bg-status-canceled', 'text-on-status-canceled'],
  pending: ['bg-status-pending', 'text-on-status-pending'],
  standby: ['bg-status-standby', 'text-on-status-standby'],
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

/**
 * Category fills. Not statuses — DESIGN.md's status vocabulary is five and closed
 * — but an icon sits on each of them, so a fixed light fill under an ink that
 * flips fails in a dark theme exactly as the alert tiles did. Hence a pair each,
 * with the ink named so a fill can differ without touching a call site.
 */
export const AGENDA_CHIP_BADGE_COLORS = {
  appointment: badgeToken('appointment'),
  isDoubleBooked: badgeToken('doubleBooked')
} as const

/** The ink on each agenda badge fill. */
export const AGENDA_CHIP_BADGE_INK_COLORS = {
  appointment: inkToken(badgeToken('appointment')),
  isDoubleBooked: inkToken(badgeToken('doubleBooked'))
} as const

export const AGENDA_CHIP_BADGE_ICONS = {
  appointment: 'i-mdi-event',
  isDoubleBooked: 'i-mdi-event-busy'
}

export const PET_CHIP_BADGE_COLORS = {
  food: badgeToken('food'),
  medicines: badgeToken('medicines'),
  vaccinations: badgeToken('vaccinations')
} as const

/** The ink on each pet badge fill. */
export const PET_CHIP_BADGE_INK_COLORS = {
  food: inkToken(badgeToken('food')),
  medicines: inkToken(badgeToken('medicines')),
  vaccinations: inkToken(badgeToken('vaccinations'))
} as const

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

export const currencySymbols: Record<
  PETBOARDING_CLIENT_CONFIGURATION['CURRENCY'],
  string
> = {
  EUR: '€',
  USD: '$'
}

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
      Loading.hide()
      Notify.create({
        message: lang.value.configuration.errorLoading,
        type: 'negative',
        timeout: 5000
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

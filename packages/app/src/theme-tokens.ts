import { PET_ALERT_CONDITIONS } from '@petboarding/tools/constants'

/**
 * The status and pet-alert colour tokens, as ADR 005 defines them.
 *
 * Every fill is a (light, dark) pair. One fixed fill under an ink that flips
 * with the scheme measures **1.04–2.45:1 in a dark theme** across the fills
 * this app shipped (`bg-green-2` 1.04, `bg-red-2` 1.09, `bg-yellow-2` 1.21,
 * `bg-grey-3` 1.30, `bg-grey-5` 1.45) — the fill stays a light 400 shade while
 * the ink turns near-white, so the text disappears into it.
 *
 * The light half is the palette value every site already used — `bg-green` was
 * `#4ade80`, `bg-red` `#f87171`, `bg-yellow` `#facc15`, `bg-grey` `#9e9e9e`,
 * `bg-deep-orange` `#ff5722` — so a light theme does not change at all.
 *
 * **The ink is deliberately not a value here.** `on-status-*` and `on-alert-*`
 * resolve to the scheme's own `--q-on-surface`, so a deployment's source colour
 * keeps driving the ink instead of a hardcoded black/white pair drifting away
 * from it.
 *
 * **How the values reach the browser.** As `--q-*` custom properties, written
 * by `setThemeColors` — light keys under `:root`, dark keys under
 * `body.body--dark`, in its own injected stylesheet. That is the only mechanism
 * in this stack that scopes a dark value correctly (a `light-dark()` value
 * cannot: the stack emits no `color-scheme`), so `statusAndAlertTones()` builds
 * the payload and `App.vue` merges it over whatever the deployment configured.
 *
 * Not covered here, deliberately (ADR 005, "Not covered"): category hues
 * (`PET_CHIP_BADGE_COLORS`, `AGENDA_CHIP_BADGE_COLORS`) have no dark half yet,
 * and glyph colours (`BOOKING_ICON_COLOR`) are a *foreground* problem — a light
 * 400 shade on a dark surface reads fine, so the fill pairs would make them
 * worse, not better.
 */

/** Kebab exactly as the preset kebabizes a theme key (`quasar-theme.js`). */
const kebab = (key: string) => key.replace(/([A-Z])/g, '-$1').toLowerCase()

/** `inHeat` → `InHeat`, so the payload key reads as the preset's `alertInHeat`. */
const pascal = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

interface Tones {
  light: string
  dark: string
}

/** DESIGN.md's status vocabulary: five statuses, one meaning each. */
export const STATUS_TONES = {
  approved: { light: '#4ade80', dark: '#14532d' },
  rejected: { light: '#f87171', dark: '#991b1b' },
  canceled: { light: '#ff5722', dark: '#9a2c08' },
  pending: { light: '#9e9e9e', dark: '#424242' },
  standby: { light: '#facc15', dark: '#713f12' }
} as const

export type StatusName = keyof typeof STATUS_TONES

/**
 * The four pet-alert conditions, keyed by the enum so a new condition fails to
 * compile until it has a pair (AGENTS.md: never a bare `string`).
 *
 * `needs-rest` is amber where it shipped yellow: that yellow was byte-identical
 * to `status-standby`, and DESIGN.md names yellow as meaning "reserve". Amber
 * stays 0.197 of relative luminance away from it and still clears the floor in
 * both schemes (7.99 light, 7.02 dark).
 */
export const ALERT_TONES: Record<PET_ALERT_CONDITIONS, Tones> = {
  [PET_ALERT_CONDITIONS.IN_HEAT]: { light: '#f472b6', dark: '#9d174d' },
  [PET_ALERT_CONDITIONS.NEEDS_REST]: { light: '#f59e0b', dark: '#78350f' },
  [PET_ALERT_CONDITIONS.AGGRESSIVE]: { light: '#f87171', dark: '#991b1b' },
  [PET_ALERT_CONDITIONS.DIABETIC]: { light: '#60a5fa', dark: '#1e40af' }
}

/**
 * The category hues — food, medicines, vaccinations, an appointment, a double
 * booking. Not statuses (DESIGN.md's status vocabulary is five and closed), but
 * they *are* fills that carry an icon, so they fail in a dark theme for exactly
 * the reason the alert tiles did: a fixed light fill under an ink that flips.
 * Light halves are the palette values already in use. Ink clears 4.5:1 in both
 * schemes (5.40–9.18 light, 5.87–7.27 dark).
 */
export const BADGE_TONES = {
  food: { light: '#2dd4bf', dark: '#115e59' },
  medicines: { light: '#fb923c', dark: '#7c2d12' },
  vaccinations: { light: '#f87171', dark: '#991b1b' },
  appointment: { light: '#03a9f4', dark: '#075985' },
  doubleBooked: { light: '#ff5722', dark: '#9a2c08' }
} as const

export type BadgeName = keyof typeof BADGE_TONES

/**
 * Foreground accents — the booking-status glyphs. The opposite case to a fill:
 * the colour sits *on* the surface rather than under ink, so a light 400 shade
 * reads fine in a light theme and washes out in a dark one. Each pair is
 * therefore dark-in-light and bright-in-dark, the shape of the preset's own
 * `positive`/`negative` family. Measured against the surface: 5.92–7.48 light,
 * 5.37–12.11 dark.
 */
export const ICON_TONES = {
  approved: { light: '#006c45', dark: '#00a56c' },
  rejected: { light: '#bd0048', dark: '#ff4e79' },
  canceled: { light: '#8a3d00', dark: '#ffb77c' },
  pending: { light: '#5f6368', dark: '#c4c7c5' },
  standby: { light: '#7a5900', dark: '#ffd54f' }
} as const

export type IconName = keyof typeof ICON_TONES

/** `badge-food` — a category fill. */
export const badgeToken = (badge: BadgeName) => `badge-${kebab(badge)}`

/** `icon-approved` — a foreground accent. */
export const iconToken = (icon: IconName) => `icon-${kebab(icon)}`

/** `status-approved` — the name a class or a Quasar `color=` prop uses. */
export const statusToken = (status: StatusName) => `status-${kebab(status)}`

/** `alert-in-heat` */
export const alertToken = (condition: PET_ALERT_CONDITIONS) =>
  `alert-${kebab(condition)}`

/** `on-alert-in-heat` — the ink that belongs on that fill. */
export const inkToken = (token: string) => `on-${token}`

/** Fill tokens — these carry an ink (`on-*`): `status-approved` … `badge-double-booked`. */
export const FILL_TOKENS = [
  ...(Object.keys(STATUS_TONES) as StatusName[]).map(statusToken),
  ...Object.values(PET_ALERT_CONDITIONS).map(alertToken),
  ...(Object.keys(BADGE_TONES) as BadgeName[]).map(badgeToken)
]

/** Foreground tokens — a colour that sits on the surface, so it has no ink of its own. */
export const FOREGROUND_TOKENS = (Object.keys(ICON_TONES) as IconName[]).map(
  iconToken
)

/** Everything, fills first. */
export const TOKEN_NAMES = [...FILL_TOKENS, ...FOREGROUND_TOKENS]

const tonesToKeys = (pairs: Record<string, Tones>, prefix: string) => ({
  light: Object.fromEntries(
    Object.entries(pairs).map(([name, tones]) => [
      `${prefix}${pascal(name)}`,
      tones.light
    ])
  ),
  dark: Object.fromEntries(
    Object.entries(pairs).map(([name, tones]) => [
      `${prefix}${pascal(name)}`,
      tones.dark
    ])
  )
})

/**
 * The `setThemeColors` payload: every pair as light/dark custom properties. Only
 * the fills and the foregrounds are in it — the *ink* is the scheme's own
 * `--q-on-surface`, so a deployment's source colour keeps driving it.
 */
export const tokenTones = () => ({
  light: {
    ...tonesToKeys(STATUS_TONES, 'status').light,
    ...tonesToKeys(ALERT_TONES, 'alert').light,
    ...tonesToKeys(BADGE_TONES, 'badge').light,
    ...tonesToKeys(ICON_TONES, 'icon').light
  },
  dark: {
    ...tonesToKeys(STATUS_TONES, 'status').dark,
    ...tonesToKeys(ALERT_TONES, 'alert').dark,
    ...tonesToKeys(BADGE_TONES, 'badge').dark,
    ...tonesToKeys(ICON_TONES, 'icon').dark
  }
})

export const themeTokenColors = Object.fromEntries([
  ...FILL_TOKENS.flatMap((token) => [
    [token, `var(--q-${token})`],
    [`on-${token}`, 'var(--q-on-surface)']
  ]),
  // A foreground has no ink on it: it *is* the ink.
  ...FOREGROUND_TOKENS.map((token) => [token, `var(--q-${token})`])
])

export const tokenSafelist = [
  ...FILL_TOKENS.flatMap((token) => [
    `bg-${token}`,
    `text-${token}`,
    `text-on-${token}`
  ]),
  // A foreground is only ever a `text-` — a Quasar `color=` on an icon.
  ...FOREGROUND_TOKENS.map((token) => `text-${token}`)
]

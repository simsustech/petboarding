import type { VitrifyConfig } from 'vitrify'
import {
  PiniaPlugin,
  type PiniaPluginOptions,
  QuasarPlugin,
  type QuasarPluginOptions
} from 'vitrify/plugins'
import { getCertificate } from '@vitejs/plugin-basic-ssl'
import QuasarComponentsPlugin from '@simsustech/quasar-components/vite-plugin'
import {
  QuasarPreset,
  quasarIconSet,
  quasarWind4Options
} from 'unocss-preset-quasar'
import presetWind4 from '@unocss/preset-wind4'
import { MaterialDesign3 } from 'unocss-preset-quasar/styles'
import { loadEnv } from 'vite'
import { PET_ALERT_CONDITIONS } from '@petboarding/tools/constants'

/**
 * ADR 005's status and alert tokens, as UnoCSS theme colours.
 *
 * Spelled out here rather than imported from `src/theme-tokens.ts`: this config
 * is transpiled to a `.js` file and then executed by Node's ESM loader, so a
 * relative import of a `.ts` module cannot resolve (`ERR_MODULE_NOT_FOUND`, no
 * bundling step). The list is kept honest by `src/theme-tokens.test.ts`, which
 * asserts it equals the app's own `TOKEN_NAMES`.
 */
const STATUS_NAMES = [
  'approved',
  'rejected',
  'canceled',
  'pending',
  'standby'
] as const

/**
 * The category and glyph families. Literal lists for the same reason as the
 * statuses: this file cannot import the app's token module. `src/theme-tokens.test.ts`
 * asserts all three lists stay in step with `TOKEN_NAMES`.
 */
const BADGE_NAMES = [
  'food',
  'medicines',
  'vaccinations',
  'appointment',
  'doubleBooked'
] as const
const ICON_NAMES = [
  'approved',
  'rejected',
  'canceled',
  'pending',
  'standby'
] as const

/** Kebab the way the preset kebabizes a theme key (`quasar-theme.js`). */
const kebab = (key: string) => key.replace(/([A-Z])/g, '-$1').toLowerCase()

/** Fills carry an ink; foregrounds *are* the ink, so they get no `on-*` entry. */
const UNOCSS_FILL_TOKENS = [
  ...STATUS_NAMES.map((status) => `status-${status}`),
  ...Object.values(PET_ALERT_CONDITIONS).map(
    (condition) => `alert-${kebab(condition)}`
  ),
  ...BADGE_NAMES.map((badge) => `badge-${kebab(badge)}`)
]

const UNOCSS_FOREGROUND_TOKENS = ICON_NAMES.map((icon) => `icon-${kebab(icon)}`)

/**
 * A theme colour whose value is a `var()` emits a working utility, so the fills
 * are `bg-status-approved` … and the `on-*` names follow the scheme's own ink.
 */
const themeTokenColors = Object.fromEntries([
  ...UNOCSS_FILL_TOKENS.flatMap((token) => [
    [token, `var(--q-${token})`],
    [`on-${token}`, 'var(--q-on-surface)']
  ]),
  ...UNOCSS_FOREGROUND_TOKENS.map((token) => [token, `var(--q-${token})`])
])

/**
 * Quasar composes `bg-${color}` from a `color=` prop at runtime, which UnoCSS's
 * content scan cannot see — without these the named colours paint nothing.
 */
const tokenSafelist = [
  ...UNOCSS_FILL_TOKENS.flatMap((token) => [
    `bg-${token}`,
    `text-${token}`,
    `text-on-${token}`
  ]),
  ...UNOCSS_FOREGROUND_TOKENS.map((token) => `text-${token}`)
]
import type { QuasarIconSet } from 'quasar'

// The icon set comes from the preset's provider (BUG-003), derived from
// Quasar's own icon-set data — no hand-written copy that can drift.
const provider = quasarIconSet('mdi-v7')

const quasarConf: QuasarPluginOptions = {
  // Toast position is set in `src/configuration.ts` (`Notify.setDefaults`); Quasar ignores this block.
  framework: {
    plugins: ['Dialog', 'Notify', 'Loading', 'Meta', 'LocalStorage'],
    iconSet: provider.iconSet as QuasarIconSet,
    // vitrify serialises framework.iconMapFn with `.toString()` into a bare
    // virtual module (no imports, no closed-over bindings), so it must be
    // self-contained. It mirrors provider.iconMapFn's idempotency: Quasar calls
    // it on values that are already iconify classes, so re-prefixing them would
    // produce `i-mdi-i-mdi-*` classes with no CSS.
    iconMapFn: (name) => ({
      icon: name.startsWith('i-') ? name : `i-mdi-${name.replace(/^mdi-/, '')}`
    })
  },
  /*
   * Disable SASS if you use UnoCSS
   */
  disableSass: true
}

export default async function ({
  mode
}: {
  mode: string
}): Promise<VitrifyConfig> {
  const env = loadEnv(mode, process.cwd(), '')
  const config: VitrifyConfig = {
    plugins: [QuasarComponentsPlugin()],
    vitrify: {
      plugins: [
        {
          plugin: QuasarPlugin,
          options: quasarConf as QuasarPluginOptions
        },
        {
          plugin: PiniaPlugin,
          options: { colada: true } as PiniaPluginOptions
        }
      ],
      lang: env.VITE_LANG?.includes('en')
        ? env.VITE_LANG
        : env.VITE_LANG?.split('-').at(0),
      productName: 'Petboarding',
      hooks: {
        onSetup: [new URL('src/setup.ts', import.meta.url)]
      },
      ssr: {
        serverModules: []
      },
      // `manualChunks: ['zod']` lived here but vitrify's config has no such key; a real
      // chunking opt-in belongs in vite's `build.rollupOptions.output.manualChunks`.
      pwa: {
        manifest: {
          name: 'Petboarding',
          short_name: 'Petboarding',
          icons: [
            {
              src: './logo-pwa.svg',
              sizes: '48x48 72x72 96x96 128x128 256x256',
              type: 'image/svg+xml',
              purpose: 'any'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,mjs,css,html,ico,png,svg,pdf}'],
          navigateFallbackDenylist: [/^\/(oidc|interaction|callback|redirect)/],
          maximumFileSizeToCacheInBytes: 3097152
        }
      },
      unocss: {
        presets: [
          // wind4 is composed by the consumer here (`quasarWind4Options`: reset off, Quasar dark mapping).
          presetWind4(quasarWind4Options),
          QuasarPreset({
            style: MaterialDesign3,
            sourceColor: env.VITE_SOURCE_COLOR,
            plugins: quasarConf['framework']['plugins'],
            iconSet: 'mdi-v7',
            // ADR 0005: the preset ships this CSS; opt the extensions in here.
            appExtensions: ['qcalendar', 'qmarkdown']
          })
        ],
        // ADR 005: the status and alert tokens. Their values live in
        // `src/theme-tokens.ts` as `--q-*` pairs written per scheme by
        // `setThemeColors`; these entries are what turn them into utilities
        // (`bg-status-approved`, `text-on-alert-in-heat`). `safelist` carries the
        // names Quasar composes into classes at runtime, which the content scan
        // cannot see — without it they would silently paint nothing.
        theme: { colors: themeTokenColors },
        safelist: tokenSafelist,
        content: {
          pipeline: {
            include: [
              'src/**/configuration.ts',
              /@simsustech\/quasar-components/,
              /@modular-api\/quasar-components/,
              // Linked/overlay installs resolve to a path without the scoped name — match the dir too.
              /quasar-components\//,
              /modular-api\//
            ]
          }
        }
      }
      // pwa: true
    }
    // quasar: quasarConf
  }
  if (mode === 'development') {
    const certificate = await getCertificate(
      'node_modules/.vite/basic-ssl',
      '',
      ['vitrify.test']
    )
    config.server = {
      https: {
        cert: certificate,
        key: certificate
      }
    }
  }
  return config
}

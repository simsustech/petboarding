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
        theme: {},
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

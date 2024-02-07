import type { VitrifyConfig } from 'vitrify'
import { certificateFor } from 'devcert'
import QuasarComponentsPlugin from '@simsustech/quasar-components/vite-plugin'
import ModularApiComponentsPlugin from '@modular-api/quasar-components/vite-plugin'
export default async function ({ mode, command }): Promise<VitrifyConfig> {
  const config: VitrifyConfig = {
    plugins: [QuasarComponentsPlugin(), ModularApiComponentsPlugin()],
    vitrify: {
      lang: process.env.VITE_LANG,
      productName: 'Petboarding',
      hooks: {
        onSetup: [new URL('src/setup.ts', import.meta.url)]
      },
      sass: {
        variables: {
          // $primary: '#990000'
          $primary: process.env.SASS_VARIABLE_PRIMARY,
          $secondary: process.env.SASS_VARIABLE_SECONDARY,
          $accent: process.env.SASS_VARIABLE_ACCENT,
          $dark: process.env.SASS_VARIABLE_DARK,
          $positive: process.env.SASS_VARIABLE_POSITIVE,
          $negative: process.env.SASS_VARIABLE_NEGATIVE,
          $info: process.env.SASS_VARIABLE_INFO,
          $warning: process.env.SASS_VARIABLE_WARNING
        }
      },
      ssr: {
        serverModules: []
      },
      manualChunks: ['zod'],
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
          navigateFallbackDenylist: [/^\/(oidc|interaction)/]
        }
      }
      // pwa: true
    },
    quasar: {
      extras: ['material-icons'],
      framework: {
        components: [
          // Deprecated
        ],
        iconSet: 'svg-material-icons',
        plugins: ['Dialog', 'Notify', 'Loading', 'Meta']
      }
    }
  }
  if (mode === 'development') {
    config.server = {
      https: await certificateFor('vitrify.local')
    }
  }
  return config
}

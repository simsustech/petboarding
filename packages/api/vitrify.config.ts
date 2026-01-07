import type { VitrifyConfig } from 'vitrify'
import { certificateFor } from 'devcert'
import { loadEnv } from 'vite'

export default async function ({ mode, command }): Promise<VitrifyConfig> {
  const env = loadEnv(mode, process.cwd(), '')

  const config: VitrifyConfig = {
    vitrify: {
      lang: env.VITE_LANG,
      hooks: {
        onSetup: [new URL('src/setup.ts', import.meta.url)]
      },
      ssr: {
        fastify: {
          bodyLimit: 10e6,
          routerOptions: {
            maxParamLength: 5000
          }
        },
        serverModules: [
          '@petboarding/app',
          '@fastify/middie',
          '@fastify/formbody',
          '@fastify/cookie',
          '@fastify/static',
          '@fastify/cors',
          '@modular-api/api',
          '@vitrify/plugin-env',
          '@modular-api/fastify-oidc',
          '@modular-api/oidc-interactions',
          '@modular-api/fastify-checkout',
          'bcryptjs',
          'kysely',
          'jose',
          'oidc-provider',
          'handlebars',
          'otplib',
          'date-holidays',
          'pg',
          'sharp',
          'compress-tag'
        ]
      },
      manualChunks: ['api.config', 'zod', 'date-fns', 'types']
    }
  }
  if (mode === 'development') {
    config.server = {
      https: await certificateFor('vitrify.local')
    }
  }
  return config
}

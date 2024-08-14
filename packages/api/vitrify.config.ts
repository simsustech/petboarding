import type { VitrifyConfig } from 'vitrify'
import { certificateFor } from 'devcert'

export default async function ({ mode, command }): Promise<VitrifyConfig> {
  const config: VitrifyConfig = {
    vitrify: {
      lang: process.env.VITE_LANG,
      hooks: {
        onSetup: [new URL('src/setup.ts', import.meta.url)]
      },
      ssr: {
        fastify: {
          bodyLimit: 10e6
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
          'bcrypt',
          'kysely',
          'jose',
          'oidc-provider',
          'handlebars',
          'otplib',
          'date-holidays',
          'pg',
          'sharp'
        ]
      },
      manualChunks: ['api.config', 'zod', 'date-fns']
    }
  }
  if (mode === 'development') {
    config.server = {
      https: await certificateFor('vitrify.local')
    }
  }
  return config
}

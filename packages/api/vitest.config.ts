import { defineConfig } from 'vite'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Some unit tests import modules that transitively load `env.js`, which
  // calls `required()` for API_HOST/POSTGRES_*/OIDC_* at import time. Load
  // packages/api/.env (dotenv format) into process.env so `pnpm test` works
  // without manually exporting variables. Real env vars take precedence.
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value
  }

  return {
    test: {
      include: ['src/**/*.test.ts'],
      exclude: ['node_modules', 'dist', 'tests/e2e/**']
    }
  }
})

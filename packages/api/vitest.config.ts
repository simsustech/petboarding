import { defineConfig } from 'vite'
import { loadEnv } from 'vite'
import { fileURLToPath } from 'node:url'

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
    // `src/...` imports (tsconfig baseUrl, and the alias the build sets up) also
    // have to resolve under vitest; without this, whole test files failed on
    // "Cannot find package 'src/repositories/...'".
    resolve: {
      alias: {
        src: fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    test: {
      include: ['src/**/*.test.ts', 'tests/e2e/**/*.test.ts'],
      // Playwright specs are collected by playwright.config.ts, never vitest.
      exclude: ['node_modules', 'dist', 'tests/e2e/**/*.spec.ts']
    }
  }
})

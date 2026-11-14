import { defineConfig } from 'vite'
import { loadEnv } from 'vite'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// A pi-safe sandbox cannot reach the host's `localhost`; its gateway exposes every
// host loopback listener under this name, which is where compose publishes the DB.
const sandboxPostgresHost = (): string | undefined => {
  try {
    return readFileSync('/etc/hosts', 'utf8').includes(
      'host.microsandbox.internal'
    )
      ? 'host.microsandbox.internal'
      : undefined
  } catch {
    return undefined
  }
}

export default defineConfig(({ mode }) => {
  // Some unit tests import modules that transitively load `env.js`, which
  // calls `required()` for API_HOST/POSTGRES_*/OIDC_* at import time. Load
  // packages/api/.env (dotenv format) into process.env so `pnpm test` works
  // without manually exporting variables. Real env vars take precedence.
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value
  }

  // The repository default, and any fresh clone's .env, say `localhost` — inside a sandbox
  // that is the guest itself, so the gateway name wins there.
  if (
    process.env.POSTGRES_HOST === undefined ||
    process.env.POSTGRES_HOST === 'localhost'
  ) {
    const sandboxHost = sandboxPostgresHost()
    if (sandboxHost) process.env.POSTGRES_HOST = sandboxHost
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

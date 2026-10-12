import { defineConfig, devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  // Vitest owns *.test.ts under tests/e2e (see vitest.config.ts); Playwright
  // only ever collects the .spec.ts specs.
  testMatch: '**/*.spec.ts',
  globalSetup: './tests/e2e/global-setup.ts',
  testIgnore: [
    process.env.PLAYWRIGHT_TEST_FEATURES ? [] : ['**/features/**/*.spec.ts'],
    // Screenshot/showcase specs write image files and are opt-in via
    // PLAYWRIGHT_ALLOW_SCREENSHOTS. CI never sets the flag, so they are skipped
    // there; run them locally with PLAYWRIGHT_ALLOW_SCREENSHOTS=1.
    process.env.PLAYWRIGHT_ALLOW_SCREENSHOTS
      ? []
      : ['**/screenshots*.spec.ts', '**/showcase-*.spec.ts'],
    process.env.PLAYWRIGHT_SLIMFACT ? [] : ['**/slimfact.spec.ts']
  ].flat(),
  fullyParallel: false,
  // One worker: the suite shares one stack, and files have cross-file order
  // dependencies (e.g. `employee/pets` renames the pet `employee.spec` counts in
  // the agenda), so running files concurrently flakes. Parallelism belongs in CI
  // sharding, where every shard gets its own fresh stack. Override with
  // `PLAYWRIGHT_WORKERS` for a throwaway parallel run.
  workers: Number(process.env.PLAYWRIGHT_WORKERS ?? 1),
  retries: 0,
  // Default per-test timeout. (`use.timeout` is not a Playwright option — it was
  // inert here, so tests silently ran on the 30s built-in default.)
  timeout: 60000,
  reporter: [['html'], ['json', { outputFile: './test-results.json' }]],
  use: {
    launchOptions: {
      // `slowMo` is a debugging aid (25ms per Playwright action) and pure
      // overhead in CI; it is off unless PLAYWRIGHT_SLOWMO opts in.
      slowMo: Number(process.env.PLAYWRIGHT_SLOWMO ?? 0)
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    ignoreHTTPSErrors: true,
    headless: true,
    // Honour the E2E base URL so specs that navigate relatively (e.g. the
    // shared login helper's `page.goto('/')`) hit the same origin the session
    // was established on. Defaults to the .localhost dev host.
    baseURL:
      process.env.PETBOARDING_E2E_BASE_URL ?? 'https://petboarding.localhost'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--no-sandbox']
        }
      }
    }
  ]
})

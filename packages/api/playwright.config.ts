import { defineConfig, devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: [
    process.env.PLAYWRIGHT_TEST_FEATURES ? [] : ['**/features/**/*.spec.ts'],
    process.env.PLAYWRIGHT_ALLOW_SCREENHOTS
      ? process.env.PLAYWRIGHT_SLIMFACT
        ? ['**/screenshots*.spec.ts']
        : ['**/slimfact.spec.ts', '**/screenshots*.spec.ts']
      : process.env.PLAYWRIGHT_SLIMFACT
        ? ['**/screenshots*.spec.ts']
        : ['**/slimfact.spec.ts', '**/screenshots*.spec.ts']
  ].flat(),
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['html'], ['json', { outputFile: './test-results.json' }]],
  use: {
    launchOptions: {
      slowMo: 25
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    ignoreHTTPSErrors: true,
    headless: true,
    baseURL: 'https://petboarding.localhost',
    timeout: 60000
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

import { defineConfig, devices } from '@playwright/test'
import path from 'path'

export default defineConfig({
  testDir: path.resolve('./tests/e2e'),
  testMatch: ['**/screenshots*.spec.ts'],
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    launchOptions: {
      slowMo: 25
    },
    trace: 'off',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: true,
    headless: true,
    baseURL: 'https://petboarding.localhost'
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

import { test, expect } from '@playwright/test'
import { initializeAndLogin } from '../setup'

let page: any

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  page = await initializeAndLogin({
    browser,
    email: 'admin@petboarding.app',
    password: 'qjiNWdT8L'
  })
})

test.describe('Pet Alerts', async () => {
  test('should load the pet page', async () => {
    await page.goto('/employee/pets/2')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('name2').first()).toBeVisible({
      timeout: 10000
    })
  })
})

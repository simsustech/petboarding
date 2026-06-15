import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { initializeAndLogin } from '../setup'

const email = 'admin@petboarding.app'
const password = 'qjiNWdT8L'

let page: Page

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  page = await initializeAndLogin({ browser, email, password })

  await expect(
    page
      .getByRole('tab', { name: 'Administrator' })
      .or(page.getByText('Administrator').locator(':scope.q-item__label'))
  ).toBeVisible()
})

test.describe('Language switcher', async () => {
  test('Switch from English to Dutch and back', async () => {
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Bookings').first()).toBeVisible()

    // Switch to Dutch by setting locale and reloading
    await page.evaluate(() => {
      localStorage.setItem('locale', 'nl-NL')
    })
    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Reserveringen').first()).toBeVisible()

    // Switch back to English
    await page.evaluate(() => {
      localStorage.setItem('locale', 'en-US')
    })
    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Bookings').first()).toBeVisible()
  })
})

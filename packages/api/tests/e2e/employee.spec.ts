import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

import { initializeAndLogin } from './setup'

const email = 'admin@petboarding.app'
const password = 'qjiNWdT8L'

let page: Page

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  page = await initializeAndLogin({ browser, email, password })

  await expect(
    page
      .getByRole('tab', { name: 'Employee' })
      .or(page.getByText('Employee').locator(':scope.q-item__label'))
  ).toBeVisible()
})

test.describe('Employee', async () => {
  test('Ovrview', async () => {
    await page.goto('/employee/overview/2024-01-02')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('name2').first()).toBeVisible()

    const [YYYY, MM, DD] = '2024-01-12'.split('-')
    await page.getByPlaceholder('DD').first().fill(DD)
    await page.getByPlaceholder('MM').first().fill(MM)
    await page.getByPlaceholder('YYYY').first().fill(YYYY)

    // Wait for SPA navigation triggered by date change
    await page.waitForURL(/.*overview\/2024-01-12/)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('name2').first()).toBeVisible()
  })
  test('Agenda', async () => {
    await page.goto('/employee/agenda/2024-01-01')
    await page.waitForLoadState('networkidle')

    await page.getByText('name2').first().waitFor()
    await expect(page.getByText('name2')).toHaveCount(6)

    const [YYYY, MM, DD] = '2024-01-12'.split('-')
    await page.getByPlaceholder('DD').first().fill(DD)
    await page.getByPlaceholder('MM').first().fill(MM)
    await page.getByPlaceholder('YYYY').first().fill(YYYY)

    // Wait for SPA navigation and data to load for the new date
    await page.waitForURL(/.*agenda\/2024-01-12/)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('name2').first()).toBeVisible({
      timeout: 10000
    })
    await expect(page.getByText('name2')).toHaveCount(5)
  })
})

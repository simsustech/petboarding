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
      .getByRole('tab', { name: 'Employee' })
      .or(page.getByText('Employee').locator(':scope.q-item__label'))
  ).toBeVisible()
})

test.describe('Customer daycare subscription', async () => {
  test('Edit expiration date', async () => {
    await page.goto('/employee/customers/1')
    await page.waitForLoadState('networkidle')

    // Toggle "show all" to ensure the subscription is visible
    const showAllToggle = page.getByLabel('Show all')
    if (await showAllToggle.isVisible()) {
      await showAllToggle.click()
    }

    // Click the edit button on the daycare subscription
    await page
      .locator('[data-testid="daycare-subscription-edit-button"]')
      .first()
      .click()

    // Wait for the dialog to appear
    const dialog = page.locator('.q-dialog')
    await expect(dialog).toBeVisible()

    // Change the expiration date
    const newExpirationDate = '2030-12-31'
    await page.getByLabel('Expiration date').fill(newExpirationDate)

    // Submit the form
    await dialog.locator('text=Submit').click()

    // Wait for dialog to close
    await expect(dialog).not.toBeVisible()

    // Verify the new date appears (date format is locale-dependent, check for year)
    await expect(page.getByText('2030')).toBeVisible()
  })
})

import { test, expect } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * `<responsive-dialog>` titles (the `#title` slot exists in the lib but nobody fills
 * it), plus the domain rule that customers may never edit a pet's category or see
 * comments — employees only. The second test asserts that absence.
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }
const CUSTOMER = { email: 'test1@petboarding.app', password: 'qjiNWdT8L' }

const titleOf = (dialog: ReturnType<typeof dialogLocator>) =>
  dialog.locator('.q-toolbar__title')

test.describe('pet dialogs', () => {
  test('employee pet edit dialog has a title and the employee-only fields', async ({
    browser
  }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    await page.goto('/employee/pets/2')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    await page.getByTestId('edit-button').first().click()

    const dialog = dialogLocator(page)
    await expect(dialog).toBeVisible({ timeout: 10000 })
    expect(
      (await titleOf(dialog).first().textContent())?.trim(),
      'employee edit dialog must be titled'
    ).toBeTruthy()
    // Employees keep category + comments (the audit's near-miss).
    await expect(page.getByLabel('Category*')).toHaveCount(1)
  })

  test('customer pet dialog is titled and exposes neither category nor comments', async ({
    browser
  }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: CUSTOMER.email, password: CUSTOMER.password })

    await page.goto('/account/pets')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    await page.locator('#fabAdd').first().click()

    const dialog = dialogLocator(page)
    await expect(dialog).toBeVisible({ timeout: 10000 })
    expect(
      (await titleOf(dialog).first().textContent())?.trim(),
      'customer dialog must be titled'
    ).toBeTruthy()

    // Customers may NEVER edit category or comments — employee-only, and never
    // shown to customers (domain rule; guard, not a feature request).
    await expect(page.getByLabel('Category*')).toHaveCount(0)
    await expect(
      dialog.getByLabel('Comments'),
      'customers must not see comments'
    ).toHaveCount(0)
    await expect(
      dialog.getByText('Comments', { exact: true }),
      'customers must not see comments'
    ).toHaveCount(0)
  })
})

function dialogLocator(page: import('@playwright/test').Page) {
  return page.locator('.q-dialog').last()
}

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

test.describe('Booking approve/reject', async () => {
  test('Approve a pending booking', async () => {
    await page.goto('admin/bookings')
    await page.waitForLoadState('networkidle')

    // Booking #6 (PENDING, pet "name5", CURRENT_YEAR dates) — visible in default filter
    const bookingItem = page
      .locator('.q-expansion-item')
      .filter({
        hasText: 'name5'
      })
      .first()

    const approvalButton = bookingItem.locator(
      '[data-testid="booking-approval-button"]'
    )
    await expect(approvalButton).toBeVisible({ timeout: 5000 })
    await approvalButton.click()

    // Click "Approve booking" in the opened menu
    await page.getByText('Approve booking').click()

    // Wait for the responsive dialog to appear with the email editor
    const dialog = page.locator('.q-dialog').last()
    await expect(dialog).toBeVisible({ timeout: 10000 })

    // Click Send to approve the booking
    await dialog.locator('button').filter({ hasText: 'Send' }).click()

    // Wait for dialog to close after successful mutation
    await expect(dialog).not.toBeVisible({ timeout: 15000 })
  })

  test('Reject a pending booking', async () => {
    await page.goto('admin/bookings')
    await page.waitForLoadState('networkidle')

    // Booking #8 (PENDING, pet "name2", CURRENT_YEAR dates) — visible in default filter
    const bookingItem = page
      .locator('.q-expansion-item')
      .filter({
        hasText: 'name2'
      })
      .first()
    await expect(bookingItem).toBeVisible({ timeout: 5000 })

    const approvalButton = bookingItem.locator(
      '[data-testid="booking-approval-button"]'
    )
    await expect(approvalButton).toBeVisible({ timeout: 5000 })
    await approvalButton.click()

    // Click "Reject booking" in the opened menu
    await page.getByText('Reject booking').click()

    // Wait for the responsive dialog to appear
    const dialog = page.locator('.q-dialog').last()
    await expect(dialog).toBeVisible({ timeout: 10000 })

    // Click Send to reject the booking
    await dialog.locator('button').filter({ hasText: 'Send' }).click()

    // Wait for dialog to close after successful mutation
    await expect(dialog).not.toBeVisible({ timeout: 15000 })
  })
})

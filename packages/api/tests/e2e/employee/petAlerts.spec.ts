import { test, expect } from '@playwright/test'
import { initializeAndLogin } from '../setup'

const email = 'admin@petboarding.app'
const password = 'qjiNWdT8L'

let page: any

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  page = await initializeAndLogin({ browser, email, password })

  await expect(
    page
      .getByRole('tab', { name: 'Employee' })
      .or(page.getByText('Employee').locator(':scope.q-item__label'))
  ).toBeVisible()
})

test.describe('Pet Alerts', async () => {
  test('should create, display, and delete a pet alert', async () => {
    // Navigate to pet page (pet with ID 2 exists in seed data)
    await page.goto('/employee/pets/2')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('name2').first()).toBeVisible({
      timeout: 10000
    })

    // Click the alerts button (alert icon) to open the dialog
    const alertsButton = page
      .locator('button:has(q-icon[name="i-mdi-alert"])')
      .first()
    await expect(alertsButton).toBeVisible({ timeout: 10000 })
    await alertsButton.click()

    // Wait for dialog to open
    const dialog = page.locator('.q-dialog').last()
    await expect(dialog).toBeVisible({ timeout: 10000 })

    // Verify the PetAlertsForm is visible
    await expect(dialog.locator('text=Condition')).toBeVisible()
    await expect(dialog.locator('text=Start date')).toBeVisible()
    await expect(dialog.locator('text=End date')).toBeVisible()
    await expect(dialog.locator('text=Add alert')).toBeVisible()

    // Add an alert - select a condition from the dropdown
    const conditionSelect = dialog.locator('q-select').first()
    await conditionSelect.click()
    await page.getByRole('option', { name: 'Medical' }).click()

    // Fill start date
    const startDateInput = dialog.locator('q-input[type="date"]').first()
    await startDateInput.fill('2024-01-15')

    // Fill end date
    const endDateInput = dialog.locator('q-input[type="date"]').last()
    await endDateInput.fill('2024-01-30')

    // Click Add alert button
    await dialog.locator('button:has-text("Add alert")').click()

    // Wait for the alert to be added to the list
    await expect(dialog.locator('text=Medical')).toBeVisible({ timeout: 5000 })

    // Close the dialog
    await dialog.locator('button:has(q-icon[name="i-mdi-close"])').click()
    await expect(dialog).not.toBeVisible({ timeout: 5000 })

    // Verify the alert badge appears on the pet card
    await expect(page.locator('text=Medical')).toBeVisible({ timeout: 5000 })

    // Reopen the dialog and delete the alert
    await alertsButton.click()
    await expect(dialog).toBeVisible({ timeout: 5000 })

    // Click the remove button for the alert
    const removeButton = dialog
      .locator('button:has(q-icon[name="i-mdi-delete"])')
      .first()
    await expect(removeButton).toBeVisible()
    await removeButton.click()

    // Verify the alert is removed from the list
    await expect(dialog.locator('text=Medical')).not.toBeVisible({
      timeout: 5000
    })

    // Close the dialog
    await dialog.locator('button:has(q-icon[name="i-mdi-close"])').click()
    await expect(dialog).not.toBeVisible({ timeout: 5000 })

    // Verify the alert badge is no longer on the pet card
    await expect(page.locator('text=Medical')).not.toBeVisible({
      timeout: 5000
    })
  })

  test('should display pet alerts in kennel layout', async () => {
    // Navigate to kennel layout for a date where the pet has an alert
    // First, add an alert to pet 2 for a specific date
    await page.goto('/employee/pets/2')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('name2').first()).toBeVisible({
      timeout: 10000
    })

    const alertsButton = page
      .locator('button:has(q-icon[name="i-mdi-alert"])')
      .first()
    await alertsButton.click()

    const dialog = page.locator('.q-dialog').last()
    await expect(dialog).toBeVisible({ timeout: 10000 })

    const conditionSelect = dialog.locator('q-select').first()
    await conditionSelect.click()
    await page.getByRole('option', { name: 'Behavioral' }).click()

    const startDateInput = dialog.locator('q-input[type="date"]').first()
    await startDateInput.fill('2024-01-02')

    const endDateInput = dialog.locator('q-input[type="date"]').last()
    await endDateInput.fill('2024-01-10')

    await dialog.locator('button:has-text("Add alert")').click()
    await expect(dialog.locator('text=Behavioral')).toBeVisible({
      timeout: 5000
    })

    await dialog.locator('button:has(q-icon[name="i-mdi-close"])').click()
    await expect(dialog).not.toBeVisible({ timeout: 5000 })

    // Now go to kennel layout for 2024-01-02
    await page.goto('/employee/kennellayout/2024-01-02')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#waitlist')).toBeVisible({ timeout: 10000 })

    // Find the pet chip with the alert badge
    const petChip = page.locator('#waitlist [id^="pet"]').first()
    await expect(petChip).toBeVisible({ timeout: 5000 })

    // Verify the alert badge is visible on the pet chip
    await expect(page.locator('text=Behavioral')).toBeVisible({ timeout: 5000 })
  })
})

import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { initializeAndLogin } from '../setup'

const email = 'admin@petboarding.app'
const password = 'qjiNWdT8L'

let page: Page

test.describe('Deceased pets are hidden from PetRelations', () => {
  test.beforeAll(async ({ browser }) => {
    page = await initializeAndLogin({ browser, email, password })

    await expect(
      page
        .getByRole('tab', { name: 'Administrator' })
        .or(page.getByText('Administrator').locator(':scope.q-item__label'))
    ).toBeVisible()
  })

  test('Deceased pets do not appear in the PetRelations dialog select', async () => {
    // Navigate to pet #2 and open the relations edit dialog
    await page.goto('/employee/pets/2')
    await page.waitForLoadState('networkidle')

    // Find the .q-item (Quasar list item) containing the relations text
    const relationsItem = page.locator('.q-item', {
      hasText: 'Relations with other pets'
    })
    await relationsItem.waitFor({ state: 'attached', timeout: 15000 })

    // Click the edit button inside the relations listitem
    const editButton = relationsItem.locator('button').first()
    await editButton.click({ force: true })

    const relationsDialog = page.locator('.q-dialog').last()
    await expect(relationsDialog).toBeVisible({ timeout: 10000 })

    // Search for the deceased pet "Charlie"
    const searchField = relationsDialog.locator('input').first()
    await searchField.fill('Charlie')
    await page.waitForLoadState('networkidle')

    // Verify the deceased pet is NOT in the results list
    const resultsList = relationsDialog
      .locator('.q-dialog__inner .q-list, .q-dialog__inner [role="list"]')
      .first()
    await expect(resultsList).toBeEmpty({ timeout: 5000 })
  })
})

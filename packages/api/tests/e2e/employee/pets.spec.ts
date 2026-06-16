import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { initializeAndLogin } from '../setup'
import { faker } from '@faker-js/faker'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const email = 'admin@petboarding.app'
const password = 'qjiNWdT8L'

const newPetName = faker.person.firstName()

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

test.describe('Employee Pets', async () => {
  test('Update pet name', async () => {
    await page.goto('/employee/pets/2')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('name2').first()).toBeVisible()

    await page.getByTestId('edit-button').first().click()

    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()

    await page.getByLabel('Name*').fill(newPetName)
    await page.getByLabel('Category*').click()
    await page.getByRole('option').first().click()
    await dialog.locator('text=Submit').click()

    await dialog.waitFor({ state: 'hidden' })
    await expect(page.getByText(newPetName).first()).toBeVisible()
  })

  test('Update pet name back to original', async () => {
    await page.goto('/employee/pets/2')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(newPetName).first()).toBeVisible()

    await page.getByTestId('edit-button').first().click()

    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()

    await page.getByLabel('Name*').fill('name2')
    await page.getByLabel('Category*').click()
    await page.getByRole('option').first().click()
    await dialog.locator('text=Submit').click()

    await dialog.waitFor({ state: 'hidden' })
    await expect(page.getByText('name2').first()).toBeVisible()
  })
})

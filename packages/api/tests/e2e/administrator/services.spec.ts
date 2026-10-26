import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { initializeAndLogin } from '../setup'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const email = 'admin@petboarding.app'
const password = 'qjiNWdT8L'

let page: Page

const time = new Date().getTime()

const service = {
  name: `Service ${time}`,
  description: `Description ${time}`
}

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  page = await initializeAndLogin({ browser, email, password })

  await expect(
    page
      .getByRole('tab', { name: 'Administrator' })
      .or(page.getByText('Administrator').locator(':scope.q-item__label'))
  ).toBeVisible()
})

async function gotoPage() {
  await page.goto('/admin/configuration/services')
  await page.waitForLoadState('networkidle')
}

test.describe('Services', async () => {
  test('Create service', async () => {
    await gotoPage()

    await page.locator('#fabAdd').click()
    await page.getByLabel('Name').fill(service.name)
    await page.getByLabel('Description').fill(`${service.description}`)
    await page.locator('text=Submit').click()

    await expect(page.locator(`text=${service.name}`)).toBeVisible()
  })

  test('Update service', async () => {
    await gotoPage()

    const updatedItem = page
      .getByRole('listitem')
      .filter({ hasText: service.name })
    await updatedItem.getByRole('button').click()
    await page.getByTestId('edit-button').last().click()
    const dialog = page.locator('.q-dialog').last()
    await dialog.isVisible()
    await dialog.getByLabel('Name').fill('UpdatedName')
    await dialog.locator('text=Submit').click()
    await delay(200)
    await expect(page.getByText('UpdatedName').first()).toBeVisible()
  })

  test('Delete service', async () => {
    await gotoPage()

    await page
      .getByRole('listitem')
      .filter({ hasText: 'UpdatedName' })
      .first()
      .getByRole('button')
      .click()
    await page.getByTestId('delete-button').last().click()
    await expect(page.locator('.q-dialog').last()).toBeVisible()
    await page
      .locator('.q-dialog')
      .last()
      .getByRole('button', { name: 'Ok' })
      .click()
    await expect(page.locator('.q-dialog').last()).not.toBeVisible()

    await gotoPage()
    await expect(page.getByText('UpdatedName')).toHaveCount(0)
  })
})

import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

// import { format } from 'date-fns'
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
  page = await browser.newPage()

  await page.goto('/')

  await page.click('text=Login')

  await page.waitForLoadState('networkidle')

  await expect(page).toHaveURL(/.*login/)

  await page.locator('text="Email"').fill(email)
  await page.locator('text="Password"').fill(password)

  await page.locator('button >> text=Login').click()

  await page.waitForURL(/.*user/)
  await expect(
    page
      .getByRole('tab', { name: 'Administrator' })
      .or(page.getByText('Administrator').locator(':scope.q-item__label'))
  ).toBeVisible()
})

test.describe('Services', async () => {
  test('Create service', async () => {
    await page.goto('/admin/configuration/services')
    await page.waitForLoadState('networkidle')

    await page.locator('#fabAdd').click()
    await page.getByLabel('Name').fill(service.name)
    await page.getByLabel('Description').fill(`${service.description}`)

    await page.locator('text=Submit').click()

    await expect(page.locator(`text=${service.name}`)).toBeVisible()
  })
  test('Update service', async () => {
    await page.getByRole('listitem').last().getByRole('button').click()
    await page.getByTestId('edit-button').last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await page.getByLabel('Name').fill('UpdatedName')
    await dialog.locator('text=Submit').click()
    await delay(100)
    await expect(page.getByText('UpdatedName').first()).toBeVisible()
  })

  test('Delete service', async () => {
    await page.getByRole('listitem').last().getByRole('button').click()
    await page.getByTestId('delete-button').last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await dialog.locator('text=Ok').click()

    await expect(page.getByText('UpdatedName')).toHaveCount(0)
  })
})

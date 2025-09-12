import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { initializeAndLogin } from '../setup'

// import { format } from 'date-fns'
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const email = 'admin@petboarding.app'
const password = 'qjiNWdT8L'

let page: Page

const time = new Date().getTime()

const category = {
  name: `Category ${time}`
  // price: 111
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

test.describe('Categories', async () => {
  test('Create category', async () => {
    await page.goto('/admin/configuration/categories')
    await page.waitForLoadState('networkidle')

    await page.locator('#fabAdd').click()
    await page.getByLabel('Name').fill(category.name)
    // await page.getByLabel('Price').fill(`${category.price}`)

    await page.locator('text=Submit').click()

    await expect(page.locator(`text=${category.name}`)).toBeVisible()
  })
  test('Update category', async () => {
    await page.getByRole('list').locator('button').last().click()
    // await page.getByRole('listitem').last().getByRole('button').click()
    await page.getByTestId('edit-button').last().click()

    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await page.getByLabel('Name').fill('UpdatedName')
    await dialog.locator('text=Submit').click()
    await delay(100)
    await expect(page.getByText('UpdatedName').first()).toBeVisible()
  })

  test('Add category price', async () => {
    // await page
    //   .getByRole('main')
    //   .getByLabel('Expand')
    //   .getByRole('button')
    //   .last()
    //   .click()
    await page.getByRole('list').locator('button').last().click()
    await page.getByText('Add price').click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    const [YYYY, MM, DD] = '2030-01-01'.split('-')
    await page.getByPlaceholder('DD').first().fill(DD)
    await page.getByPlaceholder('MM').first().fill(MM)
    await page.getByPlaceholder('YYYY').first().fill(YYYY)
    await page.getByLabel('Price').fill('200')

    await dialog.locator('text=Submit').click()
  })

  test('Delete category', async () => {
    await page.getByRole('list').locator('button').last().click()
    await page.getByTestId('delete-button').last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await dialog.locator('text=Ok').click()

    await expect(page.getByText('UpdatedName')).toHaveCount(0)
  })
})

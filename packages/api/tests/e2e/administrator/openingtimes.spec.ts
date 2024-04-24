import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

// import { format } from 'date-fns'
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const email = 'admin@petboarding.app'
const password = 'qjiNWdT8L'

let page: Page

const time = new Date().getTime()

const openingTime = {
  name: `Opening time ${time}`,
  startTime: '20:00',
  endTime: '21:00'
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
    page.getByText('Administrator').locator(':scope.q-item__label')
  ).toBeVisible()
})

test.describe('Opening times', async () => {
  test('Create opening time', async () => {
    await page.goto('/admin/configuration/openingtimes')
    await page.waitForLoadState('networkidle')

    await page.locator('button >> text=Add').click()
    await page.getByLabel('Name').fill(openingTime.name)
    await page.getByLabel('Start time').fill(openingTime.startTime)
    await page.getByLabel('End time').fill(openingTime.endTime)

    await page.locator('text=Submit').click()

    await expect(page.locator(`text=${openingTime.name}`)).toBeVisible()
  })
  test('Update opening time', async () => {
    await page.locator('button').filter({ hasText: 'edit' }).last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await page.getByLabel('Name').fill('UpdatedName')
    await dialog.locator('text=Submit').click()
    await expect(page.getByText('UpdatedName').first()).toBeVisible()
  })

  test('Delete opening time', async () => {
    await page.locator('button').filter({ hasText: 'delete' }).last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await dialog.locator('text=Ok').click()

    await expect(page.getByText('UpdatedName')).toHaveCount(0)
  })
})

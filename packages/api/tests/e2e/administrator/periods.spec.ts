import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

// import { format } from 'date-fns'
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const email = 'admin@petboarding.app'
const password = 'qjiNWdT8L'

let page: Page

const time = new Date().getTime()

const period = {
  startDate: '2024-02-02',
  endDate: '2024-02-22',
  comments: `Comments ${time}`
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

test.describe('Periods', async () => {
  test('Create period', async () => {
    await page.goto('/admin/periods')
    await page.waitForLoadState('networkidle')

    await page.locator('button >> text=Add').click()
    // await page.getByLabel('Start date').fill(period.startDate)
    // await page.getByLabel('End date').fill(`${period.endDate}`)
    await page.locator('.q-date__calendar-item--in').first().click()
    await page
      .locator('.q-date__navigation > div:nth-child(3) > .q-btn')
      .click()
    // await page.locator('div:nth-child(3) > .q-btn').first().click()
    await page.locator('.q-date__calendar-item--in').first().click()

    await page.getByLabel('Comments').fill(`${period.comments}`)

    await page.locator('text=Submit').click()

    await expect(page.locator(`text=${period.comments}`)).toBeVisible()
  })
  test('Update period', async () => {
    await page.locator('button').filter({ hasText: 'edit' }).last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await page.getByLabel('Comments').fill('UpdatedComments')
    await dialog.locator('text=Submit').click()
    await delay(100)
    await expect(page.getByText('UpdatedComments').first()).toBeVisible()
  })

  test('Delete period', async () => {
    await page.locator('button').filter({ hasText: 'delete' }).last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await dialog.locator('text=Ok').click()

    await expect(page.getByText('UpdatedComments')).toHaveCount(0)
  })
})

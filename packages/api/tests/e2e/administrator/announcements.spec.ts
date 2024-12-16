import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

// import { format } from 'date-fns'
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const email = 'admin@petboarding.app'
const password = 'qjiNWdT8L'

let page: Page

const time = new Date().getTime()
const announcement = {
  title: `Title ${time}`,
  message: `Message ${time}`
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
test.describe('Announcements', async () => {
  test('Create announcement', async () => {
    await page.goto('/admin/announcements')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Add' }).click()
    await page.getByLabel('Title').fill(announcement.title)
    await page.getByLabel('Message').fill(announcement.message)
    // await page.getByLabel('Expiration date').fill('2040/01/01')
    const [YYYY, MM, DD] = '2040-01-01'.split('-')
    await page.getByPlaceholder('DD').first().fill(DD)
    await page.getByPlaceholder('MM').first().fill(MM)
    await page.getByPlaceholder('YYYY').first().fill(YYYY)

    await page.locator('text=Submit').click()

    await expect(page.locator(`text=${announcement.message}`)).toBeVisible()
  })
  test('Update announcement', async () => {
    await page.locator('button').filter({ hasText: 'edit' }).last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await page.getByLabel('Title').fill('UpdatedTitle')
    await dialog.locator('text=Submit').click()
    await delay(100)
    await expect(page.getByText('UpdatedTitle').first()).toBeVisible()
  })

  test('Delete announcement', async () => {
    await page.locator('button').filter({ hasText: 'delete' }).last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await dialog.locator('text=Ok').click()

    await expect(page.getByText('UpdatedTitle')).toHaveCount(0)
  })
})

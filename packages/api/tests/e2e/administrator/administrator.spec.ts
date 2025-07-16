import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

// import { format } from 'date-fns'
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const email = 'admin@petboarding.app'
const password = 'qjiNWdT8L'

let page: Page

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

test.describe('Accounts', async () => {
  test('Search account', async () => {
    await page.goto('/admin/accounts')
    await page.waitForLoadState('networkidle')

    await page.getByTestId('search-button').click()

    await page.getByLabel('Email').click()
    await page.getByLabel('Email').fill('admin@petboarding.app')

    await expect(page.locator(`text=admin@petboarding.app`)).toBeVisible()
  })
})

test.describe('Bookings', async () => {
  test('Check bookings', async () => {
    await page.goto('admin/bookings')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('name1 lastName1')).toBeVisible()
  })
})
test.describe('Occupancy', async () => {
  test('Check booking occupancy', async () => {
    await page.goto('admin/occupancy/2024-01-01')
    await page.waitForLoadState('networkidle')

    await page.getByText('2024/01/01').isVisible()
    await expect(
      page
        .locator('div:nth-child(2) > .q-calendar-month__day--content > .column')
        .first()
    ).toHaveText('1 + 0')
  })

  test('Check daycare occupancy', async () => {
    await page.goto('admin/occupancy/2024-02-01')
    await page.waitForLoadState('networkidle')

    await page.getByText('2024/02/01').isVisible()
    await expect(
      page
        .locator('div:nth-child(5) > .q-calendar-month__day--content > .column')
        .first()
    ).toHaveText('0 + 1')
  })
})

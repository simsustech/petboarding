import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { initializeAndLogin } from '../setup'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const email = 'admin@petboarding.app'
const password = 'qjiNWdT8L'

let page: Page

const time = new Date().getTime()

const vacation = {
  name: `Vakantie ${time}`,
  startDate: '2024-04-02',
  endDate: '2024-04-22'
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

test.describe('Vacations', async () => {
  test('Pagination: 12 seeded items across 2 pages', async () => {
    await page.goto('/admin/configuration/vacations')
    await page.waitForLoadState('networkidle')

    const pagination = page.locator('.q-pagination')
    await expect(pagination).toBeVisible()

    // 12 items, 10 per page — Vacation 10 is last on page 1
    await expect(page.getByText('Vacation 10').first()).toBeVisible()
    await expect(page.getByText('Vacation 11').first()).not.toBeVisible()

    // Navigate to page 2
    await pagination.locator('button').last().click()
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Vacation 11').first()).toBeVisible()
    await expect(page.getByText('Vacation 10').first()).not.toBeVisible()

    // Navigate back to page 1
    await pagination.locator('button').first().click()
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Vacation 10').first()).toBeVisible()
  })

  test('Create vacation', async () => {
    await page.goto('/admin/configuration/vacations')
    await page.waitForLoadState('networkidle')

    await page.locator('#fabAdd').click()
    await page.getByLabel('Name').fill(vacation.name)
    // A vacation needs a real range. Quoting only the first day submits
    // `endDate: ""`, which the API rejects ("invalid input syntax for type date"),
    // so the create never reaches the list. The old second click followed the month
    // navigation immediately and was lost in the calendar's slide animation
    // (2026-09-24: the trigger read "Sep 1 - ?" with no day pressed). Navigate to
    // the next month, wait until it is really on screen, then pick two distinct days
    // by their accessible names.
    const dialog = page.locator('.q-dialog:visible').last()
    const nextMonth = new Date(
      Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1)
    )
    const monthName = nextMonth.toLocaleString('en-US', {
      month: 'long',
      timeZone: 'UTC'
    })
    const year = nextMonth.getUTCFullYear()
    await dialog.getByRole('button', { name: 'Next month' }).click()
    await expect(
      dialog.getByRole('button', { name: `10 ${monthName} ${year}` })
    ).toBeVisible()
    await dialog
      .getByRole('button', { name: `10 ${monthName} ${year}` })
      .click()
    await dialog
      .getByRole('button', { name: `15 ${monthName} ${year}` })
      .click()
    await page.locator('text=Submit').click()

    await expect(page.locator(`text=${vacation.name}`)).toBeVisible()
  })

  test('Update vacation', async () => {
    await page.getByRole('listitem').first().getByRole('button').click()
    await page.getByTestId('edit-button').first().click()
    const dialog = page.locator('.q-dialog').last()
    await dialog.isVisible()
    await dialog.getByLabel('Name').fill('UpdatedVacation')
    await dialog.locator('text=Submit').click()
    await delay(100)
    await expect(page.getByText('UpdatedVacation').first()).toBeVisible()
  })

  test('Delete vacation', async () => {
    await page.getByRole('listitem').first().getByRole('button').click()
    await page.getByTestId('delete-button').first().click()
    const dialog = page.locator('.q-dialog').last()
    await dialog.isVisible()
    await dialog.locator('text=Ok').click()

    await expect(page.getByText('UpdatedVacation')).toHaveCount(0)
  })
})

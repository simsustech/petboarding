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
  test('Create vacation', async () => {
    await page.goto('/admin/configuration/vacations')
    await page.waitForLoadState('networkidle')

    await page.locator('#fabAdd').click()

    await page.getByLabel('Name').fill(vacation.name)

    await page.locator('.q-date__calendar-item--in').first().click()
    await page
      .locator('.q-date__navigation > div:nth-child(3) > .q-btn')
      .click()
    await page.locator('.q-date__calendar-item--in').first().click()

    await page.locator('text=Submit').click()

    await expect(page.locator(`text=${vacation.name}`)).toBeVisible()
  })

  test('Update vacation', async () => {
    await page.getByRole('listitem').last().getByRole('button').click()
    await page.getByTestId('edit-button').last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await page.getByLabel('Name').fill('UpdatedVacation')
    await dialog.locator('text=Submit').click()
    await delay(100)
    await expect(page.getByText('UpdatedVacation').first()).toBeVisible()
  })

  test('Delete vacation', async () => {
    await page.getByRole('listitem').last().getByRole('button').click()
    await page.getByTestId('delete-button').last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await dialog.locator('text=Ok').click()

    await expect(page.getByText('UpdatedVacation')).toHaveCount(0)
  })
})

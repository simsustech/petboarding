import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { initializeAndLogin } from '../setup'

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
  page = await initializeAndLogin({ browser, email, password })

  await expect(
    page
      .getByRole('tab', { name: 'Administrator' })
      .or(page.getByText('Administrator').locator(':scope.q-item__label'))
  ).toBeVisible()
})

test.describe('Periods', async () => {
  test('Pagination: 12 seeded items across 2 pages', async () => {
    await page.goto('/admin/periods')
    await page.waitForLoadState('networkidle')

    const pagination = page.locator('.q-pagination')
    await expect(pagination).toBeVisible()

    // 12 items, 10 per page — Period 10 is last on page 1
    await expect(page.getByText('Period 10').first()).toBeVisible()
    await expect(page.getByText('Period 11').first()).not.toBeVisible()

    // Navigate to page 2
    await pagination.locator('button').last().click()
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Period 11').first()).toBeVisible()
    await expect(page.getByText('Period 10').first()).not.toBeVisible()

    // Navigate back to page 1
    await pagination.locator('button').first().click()
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Period 10').first()).toBeVisible()
  })

  test('Create period', async () => {
    await page.goto('/admin/periods')
    await page.waitForLoadState('networkidle')

    await page.locator('#fabAdd').click()

    // Pick a range as: click a day, advance a month, click the end. Gate on the cell
    // (not the month label, which re-renders first) so from!==to and the range sticks.
    const dayCell = page.locator('.q-date__calendar-item--in').first()
    const dayCellLabel = dayCell.locator('button')
    await dayCell.click()
    const startCellLabel = await dayCellLabel.getAttribute('aria-label')
    await page
      .locator('.q-date__navigation > div:nth-child(3) > .q-btn')
      .click()
    // Gate on the cell we are about to click: it must belong to the new month.
    await expect(dayCellLabel).not.toHaveAttribute(
      'aria-label',
      startCellLabel!
    )

    await dayCell.click()
    await page.getByLabel('Comments').fill(`${period.comments}`)
    await page.locator('text=Submit').click()

    await expect(page.locator(`text=${period.comments}`)).toBeVisible()
  })

  test('Update period', async () => {
    // Target the period this spec created — not the last seeded row — so the
    // Update/Delete pair cleans up after itself instead of mutating seed data.
    await page
      .getByRole('listitem')
      .filter({ hasText: period.comments })
      .getByRole('button')
      .first()
      .click()
    await page.getByTestId('edit-button').last().click()
    const dialog = page.locator('.q-dialog').last()
    await dialog.isVisible()
    await dialog.getByLabel('Comments').fill('UpdatedComments')
    await dialog.locator('text=Submit').click()
    await delay(100)
    await expect(page.getByText('UpdatedComments').first()).toBeVisible()
  })

  test('Delete period', async () => {
    await page
      .getByRole('listitem')
      .filter({ hasText: 'UpdatedComments' })
      .getByRole('button')
      .first()
      .click()
    await page.getByTestId('delete-button').last().click()
    const dialog = page.locator('.q-dialog').last()
    await dialog.isVisible()
    await dialog.locator('text=Ok').click()

    await expect(page.getByText('UpdatedComments')).toHaveCount(0)
  })
})

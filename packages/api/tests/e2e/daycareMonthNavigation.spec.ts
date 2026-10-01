import { test, expect } from '@playwright/test'
import { initializePage, login } from './setup'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

test('daycare form jumps to the clicked adjacent month and tracks the day', async ({
  browser
}) => {
  test.setTimeout(240000)
  const page = await initializePage({ browser })
  await login({ page, email: 'test1@petboarding.app', password: 'qjiNWdT8L' })

  await page.goto('/account/daycare')
  await page.waitForLoadState('load')
  await delay(4000)

  await page.getByRole('button', { name: 'Add' }).first().click()
  await delay(1000)

  // pick a pet so the calendar, the hint and the selection appear
  await page.locator('.q-select').first().click()
  await delay(500)
  await page.getByRole('option').first().click()
  await page.keyboard.press('Escape')
  await delay(500)

  await expect(
    page.locator('text=Click a day to select it').first()
  ).toBeVisible()

  // the dialog teleports to the end of <body>, so its title is the LAST
  // match — the page's inline calendar sits behind the dialog
  const titles = page.locator('text=/Daycare - \\w+ \\d{4}/')
  const title = titles.last()
  const before = await title.textContent()

  // an enabled adjacent-month day in the grid (they render dimmed)
  const outside = page.locator(
    '.q-calendar-month__day.q-outside button:not([disabled])'
  )
  expect(await outside.count(), 'enabled adjacent-month days').toBeGreaterThan(
    0
  )
  await outside.first().click({ timeout: 15000 })
  await delay(750)

  // the calendar moved to the month that was clicked…
  expect(await title.textContent()).not.toBe(before)
  // …and the clicked day is selected and shows in the chip row
  await expect(page.locator('.q-chip').first()).toBeVisible()
})

test('agenda moves between periods with prev, next and today', async ({
  browser
}) => {
  test.setTimeout(240000)
  const page = await initializePage({ browser })
  await login({ page, email: 'admin@petboarding.app', password: 'qjiNWdT8L' })

  // the seeded bookings live in the week of 2024-01-01
  await page.goto('/employee/agenda/2024-01-01')
  await page.waitForLoadState('load')
  await delay(5000)

  const label = page.locator('text=/\\d{1,2} \\S{3}.*\\d{1,2} \\S{3}/').first()
  await expect(label).toBeVisible({ timeout: 20000 })
  // count()-guarded read: the agenda swaps to its empty state when the period has no bookings.
  const readLabel = async () =>
    (await label.count()) > 0 ? await label.textContent() : null
  const before = (await readLabel()) || ''

  await page
    .getByRole('button', { name: 'Next', exact: true })
    .first()
    .click({ timeout: 15000 })
  await delay(750)
  const afterNext = (await readLabel()) || ''
  expect(afterNext).not.toBe(before)

  await page
    .getByRole('button', { name: 'Previous', exact: true })
    .first()
    .click({ timeout: 15000 })
  await delay(750)
  expect((await readLabel()) || '').toBe(before)

  // Today jumps to the current week (no seed bookings there), so the label no longer
  // shows the original period — use count() to avoid blocking on a detached element.
  await page
    .getByRole('button', { name: 'Today' })
    .first()
    .click({ timeout: 15000 })
  await delay(750)
  const afterToday = await readLabel()
  expect(afterToday).not.toBe(before)
})

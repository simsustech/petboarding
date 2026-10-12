import { test, expect } from '@playwright/test'
import { initializePage, login } from './setup'

test('daycare form jumps to the clicked adjacent month and tracks the day', async ({
  browser
}) => {
  test.setTimeout(240000)
  const page = await initializePage({ browser })
  await login({ page, email: 'test1@petboarding.app', password: 'qjiNWdT8L' })

  await page.goto('/account/daycare')
  // The FAB renders only once the pets query returns — wait for it instead of
  // the fixed 4s sleep it replaced.
  await page.locator('#fabAdd').waitFor({ state: 'visible', timeout: 15000 })
  await page.locator('#fabAdd').click()

  // Pick a pet so the calendar, the hint and the selection appear. Every click
  // below auto-waits for its target, so the old fixed sleeps are gone.
  const petSelect = page.locator('.q-select').first()
  await petSelect.waitFor({ state: 'visible', timeout: 15000 })
  await petSelect.click()
  await page.getByRole('option').first().click()
  await page.keyboard.press('Escape')

  await expect(
    page.locator('text=Click a day to select it').first()
  ).toBeVisible()

  // the dialog teleports to the end of <body>, so its title is the LAST
  // match — the page's inline calendar sits behind the dialog
  const titles = page.locator('text=/Daycare - \\w+ \\d{4}/')
  const title = titles.last()
  await expect(title).toBeVisible({ timeout: 15000 })
  const before = await title.textContent()

  // an enabled adjacent-month day in the grid (they render dimmed)
  const outside = page.locator(
    '.q-calendar-month__day.q-outside button:not([disabled])'
  )
  await expect
    .poll(async () => await outside.count(), { timeout: 10000 })
    .toBeGreaterThan(0)
  await outside.first().click({ timeout: 15000 })

  // the calendar moved to the month that was clicked…
  await expect
    .poll(async () => await title.textContent(), { timeout: 10000 })
    .not.toBe(before)
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

  const label = page.locator('text=/\\d{1,2} \\S{3}.*\\d{1,2} \\S{3}/').first()
  // The old 5s sleep was redundant with this wait.
  await expect(label).toBeVisible({ timeout: 20000 })
  // count()-guarded read: the agenda swaps to its empty state when the period
  // has no bookings.
  const readLabel = async () =>
    (await label.count()) > 0 ? await label.textContent() : null
  const before = (await readLabel()) || ''

  await page
    .getByRole('button', { name: 'Next', exact: true })
    .first()
    .click({ timeout: 15000 })
  await expect.poll(readLabel, { timeout: 10000 }).not.toBe(before)

  await page
    .getByRole('button', { name: 'Previous', exact: true })
    .first()
    .click({ timeout: 15000 })
  await expect.poll(readLabel, { timeout: 10000 }).toBe(before)

  // Today jumps to the current week (no seed bookings there), so the label no
  // longer shows the original period — the poll tolerates the empty state.
  await page
    .getByRole('button', { name: 'Today' })
    .first()
    .click({ timeout: 15000 })
  await expect.poll(readLabel, { timeout: 10000 }).not.toBe(before)
})

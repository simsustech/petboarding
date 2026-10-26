import { test, expect } from '@playwright/test'
import { initializePage, login } from './setup'

/**
 * Regression for the reported production error "done is not a function (in
 * 'done')" when a customer submitted daycare dates.
 *
 * The customer path has exactly one visible submit affordance: the `type="submit"`
 * button inside `DaycareForm`'s own `<q-form>` (the dialog's header submit is
 * hidden with `:display="true"` on `/account/daycare`). So this test must click
 * *that* button — the dialog header button would exercise a different code path.
 */
test('customer submits daycare dates through the form submit button', async ({
  browser
}) => {
  test.setTimeout(240000)
  const page = await initializePage({ browser })
  await login({ page, email: 'test1@petboarding.app', password: 'qjiNWdT8L' })

  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(String(error)))

  await page.goto('/account/daycare')
  const fab = page.locator('#fabAdd')
  await fab.waitFor({ state: 'visible', timeout: 15000 })
  // The FAB carries the "seek attention" pulse while the customer has no daycare
  // dates, which makes Playwright's stability check never settle, and the app's
  // global loading backdrop can briefly sit on top of it.
  await page
    .locator('.q-loading__backdrop')
    .waitFor({ state: 'detached', timeout: 15000 })
    .catch(() => {})
  await fab.click({ force: true })

  // Pick a pet so the calendar and the submit button become usable.
  const petSelect = page.locator('.q-select').first()
  await petSelect.waitFor({ state: 'visible', timeout: 15000 })
  await petSelect.click()
  await page.getByRole('option').first().click()
  await page.keyboard.press('Escape')

  // The dialog's calendar — scoped to `.q-dialog` because the page behind it
  // renders its own (non-interactive) calendar.
  // The form's own validation gates the submit: without the terms checkbox the
  // `else` branch runs instead (`done(false)`).
  await page
    .getByRole('checkbox', { name: /terms and conditions/i })
    .last()
    .check()

  const day = page.locator(
    '.q-dialog .q-calendar-month__day button:not([disabled])'
  )
  await expect
    .poll(async () => await day.count(), { timeout: 20000 })
    .toBeGreaterThan(0)
  await day.first().click()

  await expect(page.locator('text=1 date selected').last()).toBeVisible({
    timeout: 15000
  })

  const submit = page.getByRole('button', { name: /Add daycare/ }).last()
  await expect(submit).toBeEnabled({ timeout: 15000 })
  await submit.click()

  // The reported symptom: the parent's `done()` call throws because the form
  // emitted the QForm event payload instead of `{ data, done }`.
  await expect(
    page.locator('.q-notification', { hasText: 'is not a function' })
  ).toHaveCount(0, { timeout: 15000 })

  await expect(page.locator('text=Daycare dates added').last()).toBeVisible({
    timeout: 15000
  })

  expect(
    pageErrors.filter((error) => error.includes('is not a function'))
  ).toEqual([])
})

import { test, expect } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * Header title spot-check (the unit guard in `src/router/titles.test.ts` walks the
 * whole route tree; this one proves the rendered string, not just the data):
 * `/admin/bookings` showed the site name (`Petboarding`) and `/information` a
 * blank header, because `meta.lang` was missing / the language key had no `title`
 * (audit: `admin-bookings.png`, `information.png`).
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }

test('header title names the current page', async ({ browser }) => {
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })

  // The md3 layout's header title is not a `.q-toolbar-title`; assert the text
  // the user actually reads in the bar.
  const headerTitle = page.locator('.q-header').first()

  await page.goto('/admin/bookings')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  expect((await headerTitle.innerText()).trim()).toBe('Bookings')

  await page.goto('/information')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  expect((await headerTitle.innerText()).trim()).toBe('Information')

  await page.goto('/admin/configuration/vacations')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  expect((await headerTitle.innerText()).trim()).toBe('Vacations')
})

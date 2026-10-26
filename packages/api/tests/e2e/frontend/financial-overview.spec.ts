import { test, expect } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * `/admin/financial/overview` groups the unpaid bookings of the last 90 days; with
 * none (the seeded state) the page read as broken rather than empty, so it now says
 * why the list is empty.
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }

test('financial overview explains an empty list', async ({ browser }) => {
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })

  await page.goto('/admin/financial/overview')
  await page.waitForLoadState('networkidle')

  // The session-creation redirect settles on `/user`; navigating before it lands gets
  // overridden by the app's own push, so wait for the route to stick first.
  await expect(page).toHaveURL(/financial\/overview/, { timeout: 10000 })
  await page.waitForTimeout(2000)

  // The page keeps its own header ...
  await expect(page.getByText('Unpaid bookings of last 90 days.')).toBeVisible()
  // ... and says why the list is empty.
  await expect(
    page.getByText('No unpaid bookings in the last 90 days.')
  ).toBeVisible()
})

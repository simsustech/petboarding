import { test, expect } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * `/account/*` for an account without a customer profile — the seeded admin.
 *
 * Before the fix every `user.*` query threw BAD_REQUEST, so each page raised a red
 * "BAD_REQUEST" toast and rendered nothing (captured in
 * `test-results/frontend-audit/desktop/admin-account-pets.png` and the request log's
 * `user.getPets`/`user.getBookings`/`user.getCustomerDaycareSubscriptions`/
 * `user.getDaycareDates` 400s). The profileless state is empty, not broken:
 *
 *   - no error toast,
 *   - `/account/customer` says what to do instead of rendering blank,
 *   - and a customer *with* a profile still gets real data (no over-emptying).
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }
const CUSTOMER = { email: 'test1@petboarding.app', password: 'qjiNWdT8L' }

const PROFILELESS_ROUTES = [
  '/account/customer',
  '/account/pets',
  '/account/bookings',
  '/account/daycare',
  '/account/contactpeople'
]

test.describe('profileless account pages', () => {
  test('render empty states without error toasts', async ({ browser }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    for (const route of PROFILELESS_ROUTES) {
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)
      await expect(
        page.locator('.q-notification', { hasText: 'BAD_REQUEST' }),
        `${route} must not raise a BAD_REQUEST toast`
      ).toHaveCount(0)
    }

    // The customer page guides instead of rendering blank.
    await page.goto('/account/customer')
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByText('Please enter your customer details first.')
    ).toBeVisible({ timeout: 10000 })
  })

  test('a seeded customer still sees their own data', async ({ browser }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: CUSTOMER.email, password: CUSTOMER.password })

    await page.goto('/account/pets')
    await page.waitForLoadState('networkidle')
    // Seeded pet 1 (customer 1 ↔ account 1, seeds/test.ts:54 names pets `name<n>`).
    await expect(page.getByText('name1').first()).toBeVisible({
      timeout: 10000
    })

    await page.goto('/account/bookings')
    await page.waitForLoadState('networkidle')
    await expect(
      page.locator('.q-notification', { hasText: 'BAD_REQUEST' })
    ).toHaveCount(0)
  })
})

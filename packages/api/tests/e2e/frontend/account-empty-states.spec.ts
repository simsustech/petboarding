import { test, expect, type Page } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * `/account/*` for the seeded admin (no customer profile): the profileless state is
 * empty, not broken — no error toast, `/account/customer` guides instead of rendering
 * blank, and a customer *with* a profile still gets real data.
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

/**
 * Observe the admin-procedure traffic MainLayout's count queries generate, at the HTTP
 * boundary: no `/trpc/admin.*` response may be 401, and an admin still receives both
 * counts.
 */
const trackAdminTraffic = (page: Page) => {
  const unauthorized: string[] = []
  const countsReceived = new Set<string>()
  page.on('response', async (res) => {
    const url = res.url()
    if (!url.includes('/trpc/admin.')) return
    if (res.status() === 401) {
      unauthorized.push(url)
      return
    }
    // Read the batch items, not the HTTP code: tRPC answers 200 (all ok) or 207 (mixed).
    if (res.status() !== 200 && res.status() !== 207) return
    let items: unknown
    try {
      items = JSON.parse(await res.text())
    } catch {
      return
    }
    const list = Array.isArray(items) ? items : [items]
    const procs = decodeURIComponent(
      url.split('/trpc/')[1]?.split('?')[0] ?? ''
    ).split(',')
    procs.forEach((proc, i) => {
      const item = list[i] as { result?: unknown } | undefined
      if (!item || item.result === undefined) return
      if (proc === 'admin.getBookingsCount') countsReceived.add('bookings')
      if (proc === 'admin.getDaycareCount') countsReceived.add('daycare')
    })
  })
  return { unauthorized, countsReceived }
}

test.describe('profileless account pages', () => {
  test('render empty states without error toasts', async ({ browser }) => {
    const page = await initializePage({ browser })
    const { unauthorized, countsReceived } = trackAdminTraffic(page)
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
      await expect(
        page.locator('.q-notification', { hasText: 'UNAUTHORIZED' }),
        `${route} must not raise an UNAUTHORIZED toast`
      ).toHaveCount(0)
    }

    // The customer page guides instead of rendering blank.
    await page.goto('/account/customer')
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByText('Please enter your customer details first.')
    ).toBeVisible({ timeout: 10000 })
    // Let the async response bodies above settle before reading the collector.
    await page.waitForTimeout(500)

    expect(unauthorized, 'no /trpc/admin.* response may be 401').toEqual([])
    expect(
      [...countsReceived].sort(),
      "an administrator's watch path still delivers both counts"
    ).toEqual(['bookings', 'daycare'])
  })

  test('a seeded customer still sees their own data', async ({ browser }) => {
    const page = await initializePage({ browser })
    const { unauthorized } = trackAdminTraffic(page)
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
    expect(
      unauthorized,
      'a customer session must not draw 401s from admin procedures'
    ).toEqual([])
  })
})

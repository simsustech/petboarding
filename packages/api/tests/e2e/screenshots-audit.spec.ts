import { test, expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { initializePage, login } from './setup'

/**
 * Frontend visual audit capture: every renderable route in
 * packages/app/src/router/routes.ts (minus the OAuth redirects) at desktop
 * (1440x900) and mobile (375x812), fullPage, in a fresh English context, plus a set
 * of interaction flows that only OPEN UI and close with Escape (nothing submitted).
 *
 * /account/* is shot twice: as admin (no seed → empty state) and as
 * test1@petboarding.app (seeded customer 1 → real content).
 *
 * Run (test stack up, default base URL https://petboarding.localhost):
 *   cd packages/api
 *   PLAYWRIGHT_ALLOW_SCREENSHOTS=1 pnpm exec playwright test \
 *     tests/e2e/screenshots-audit.spec.ts --reporter=list
 *
 * Screenshots land in packages/api/test-results/frontend-audit/<viewport>/.
 */

const OUT = 'test-results/frontend-audit'

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }
const CUSTOMER = { email: 'test1@petboarding.app', password: 'qjiNWdT8L' }

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812 }
] as const

const today = new Date().toISOString().slice(0, 10)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Routes any logged-in admin session can render, in routes.ts order. */
const ADMIN_ROUTES: [string, string][] = [
  // MainLayout — public pages
  ['/', 'home'],
  ['/availability', 'availability'],
  ['/information', 'information'],
  ['/user', 'user'],
  ['/_audit-not-a-route', 'error404'],

  // Admin
  ['/admin', 'admin-home'],
  ['/admin/financial', 'admin-financial'],
  ['/admin/financial/overview', 'admin-financial-overview'],
  ['/admin/financial/bookings', 'admin-financial-bookings'],
  ['/admin/accounts', 'admin-accounts'],
  ['/admin/bookings', 'admin-bookings'],
  ['/admin/daycare', 'admin-daycare'],
  ['/admin/occupancy', 'admin-occupancy'],
  ['/admin/announcements', 'admin-announcements'],
  ['/admin/periods', 'admin-periods'],
  ['/admin/configuration', 'admin-configuration'],
  ['/admin/configuration/categories', 'admin-config-categories'],
  ['/admin/configuration/services', 'admin-config-services'],
  ['/admin/configuration/openingtimes', 'admin-config-openingtimes'],
  ['/admin/configuration/integrations', 'admin-config-integrations'],
  [
    '/admin/configuration/daycaresubscriptions',
    'admin-config-daycaresubscriptions'
  ],
  ['/admin/configuration/buildings', 'admin-config-buildings'],
  ['/admin/configuration/kennels', 'admin-config-kennels'],
  ['/admin/configuration/documents', 'admin-config-documents'],
  ['/admin/configuration/vacations', 'admin-config-vacations'],
  // The drawer's Vacations item links here (MainLayout.vue:353) but routes.ts
  // only defines /admin/configuration/vacations — capture the target the nav
  // actually leads to so the drift is visible in the audit.
  ['/admin/vacations', 'admin-vacations-drawer-target'],

  // Employee
  ['/employee', 'employee-home'],
  ['/employee/overview', 'employee-overview'],
  ['/employee/agenda', 'employee-agenda'],
  ['/employee/customers', 'employee-customers'],
  ['/employee/customers/1', 'employee-customer-detail'],
  ['/employee/pets', 'employee-pets'],
  ['/employee/pets/2', 'employee-pet-detail'],
  ['/employee/bookings', 'employee-bookings'],
  ['/employee/bookings/1', 'employee-booking-detail'],
  ['/employee/labels/pets/2', 'employee-labels-pets'],
  ['/employee/labels/bookings/1', 'employee-labels-bookings'],
  ['/employee/kennellayout', 'employee-kennellayout'],

  // Print layout
  ['/print/kennellayout', 'print-kennellayout'],
  [`/print/overview/${today}`, 'print-overview'],
  ['/print/pets/2', 'print-pets-labels'],
  ['/print/bookings/1', 'print-bookings-labels'],
  ['/print/termsandconditions', 'print-termsandconditions'],
  ['/print/privacypolicy', 'print-privacypolicy']
]

/** Account routes — admin has no seeded customer profile (empty states). */
const ADMIN_ACCOUNT_ROUTES: [string, string][] = [
  ['/account', 'admin-account-home'],
  ['/account/customer', 'admin-account-customer'],
  ['/account/contactpeople', 'admin-account-contactpeople'],
  ['/account/pets', 'admin-account-pets'],
  ['/account/bookings', 'admin-account-bookings'],
  ['/account/daycare', 'admin-account-daycare']
]

/** Same routes as test1 (seeded customer 1) → real content. */
const CUSTOMER_ACCOUNT_ROUTES: [string, string][] = [
  ['/account', 'account-home'],
  ['/account/customer', 'account-customer'],
  ['/account/contactpeople', 'account-contactpeople'],
  ['/account/pets', 'account-pets'],
  ['/account/bookings', 'account-bookings'],
  ['/account/daycare', 'account-daycare']
]

/** Routes that render calendars/charts and need longer to settle. */
const SLOW = /agenda|kennellayout|occupancy|overview/

/** Apply the requested viewport, then log in at that width (login works at 375px now). */
async function loginAtViewport(
  page: Page,
  email: string,
  password: string,
  viewport: { width: number; height: number }
) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height })
  await login({ page, email, password })
}

async function shoot(page: Page, routes: [string, string][], viewport: string) {
  for (const [route, slug] of routes) {
    await page.goto(route)
    await page
      .waitForLoadState('networkidle', { timeout: 8000 })
      .catch(() => {})
    await delay(SLOW.test(route) ? 4000 : 2000)
    await Promise.race([
      page.screenshot({
        path: `${OUT}/${viewport}/${slug}.png`,
        fullPage: true
      }),
      delay(15000)
    ])
  }
}

// Not serial: one failing capture must not skip the other viewports (workers: 1).

for (const viewport of VIEWPORTS) {
  test(`admin routes — ${viewport.name}`, async ({ browser }) => {
    test.setTimeout(600000)
    const page = await initializePage({ browser })
    await loginAtViewport(page, ADMIN.email, ADMIN.password, viewport)
    await shoot(page, ADMIN_ROUTES, viewport.name)
    await Promise.race([page.context().close(), delay(5000)])
  })

  test(`admin account routes (empty state) — ${viewport.name}`, async ({
    browser
  }) => {
    test.setTimeout(300000)
    const page = await initializePage({ browser })
    await loginAtViewport(page, ADMIN.email, ADMIN.password, viewport)
    await shoot(page, ADMIN_ACCOUNT_ROUTES, viewport.name)
    await Promise.race([page.context().close(), delay(5000)])
  })

  test(`customer account routes (test1) — ${viewport.name}`, async ({
    browser
  }) => {
    test.setTimeout(300000)
    const page = await initializePage({ browser })
    await loginAtViewport(page, CUSTOMER.email, CUSTOMER.password, viewport)
    await shoot(page, CUSTOMER_ACCOUNT_ROUTES, viewport.name)
    await Promise.race([page.context().close(), delay(5000)])
  })

  test(`interaction flows — ${viewport.name}`, async ({ browser }) => {
    // 180s: the mobile half (23 routes + flows) needs more than the default.
    test.setTimeout(180000)
    const page = await initializePage({ browser })
    await loginAtViewport(page, ADMIN.email, ADMIN.password, viewport)
    // Cap every screenshot: an uncapped page.screenshot() on a stuck page waits out the budget.
    const shot = (slug: string) =>
      Promise.race([
        page.screenshot({ path: `${OUT}/${viewport.name}/flow-${slug}.png` }),
        delay(10000)
      ])

    const headerButtons = page.locator('header button')
    // User menu = the only round header button that isn't the mobile drawer toggle.
    const userMenuButton = page.locator(
      'header button.q-btn--round:not([aria-label=Menu])'
    )

    // At 375px the header buttons are pointer-blocked, so click when it lands and fall back
    // to a DOM dispatch so the shot still exists.
    const menuAfter = async (locator: Locator) => {
      const menu = page.locator('.q-menu').last()
      try {
        await locator.click({ timeout: 4000 })
        await expect(menu).toBeVisible({ timeout: 4000 })
      } catch {
        await Promise.race([locator.dispatchEvent('click'), delay(4000)])
        await expect(menu).toBeVisible({ timeout: 4000 })
      }
    }
    const clickOrDispatch = async (locator: Locator) => {
      try {
        await locator.click({ timeout: 4000 })
        return 'click'
      } catch {
        await Promise.race([locator.dispatchEvent('click'), delay(4000)])
        return 'dispatch'
      }
    }

    // 1. Overflow menu (language select + dark mode toggle live inside it)
    await page.goto('/admin/bookings')
    await page
      .waitForLoadState('networkidle', { timeout: 8000 })
      .catch(() => {})
    await delay(2000)
    await clickOrDispatch(headerButtons.last())
    await menuAfter(headerButtons.last())
    await delay(300)
    await shot('overflow-menu')
    await page.keyboard.press('Escape')
    await delay(400)

    // 2. User menu (My account / Sign out)
    await expect(userMenuButton).toBeVisible({ timeout: 5000 })
    await clickOrDispatch(userMenuButton)
    await menuAfter(userMenuButton)
    await delay(300)
    await shot('user-menu')
    await page.keyboard.press('Escape')
    await delay(400)

    // 3. Search overlay (desktop only — AccountsTable lives in the table view)
    if (viewport.name === 'desktop') {
      await page.goto('/admin/accounts')
      await page
        .waitForLoadState('networkidle', { timeout: 8000 })
        .catch(() => {})
      await delay(2000)
      await Promise.race([
        (async () => page.getByTestId('search-button').click())(),
        delay(8000)
      ])
      await delay(800)
      await shot('search-overlay')
      await page.keyboard.press('Escape')
      await delay(400)
    }

    // 4. Booking approval menu — open only, Escape before any Approve/Reject.
    if (viewport.name === 'desktop') {
      await page.goto('/admin/bookings')
      await page
        .waitForLoadState('networkidle', { timeout: 8000 })
        .catch(() => {})
      await delay(2000)
      // Seed-independent: any pending booking that exposes the approval button.
      const approvalButton = page
        .locator('.q-expansion-item [data-testid="booking-approval-button"]')
        .first()
      await expect(approvalButton).toBeVisible({ timeout: 15000 })
      await approvalButton.click({ timeout: 5000 })
      await delay(800)
      await expect(page.getByText('Approve booking')).toBeVisible()
      await shot('booking-approval-menu')
      await page.keyboard.press('Escape')
      await page.keyboard.press('Escape')
      await delay(400)
    }

    // 5. Pet edit dialog — open only, Escape without submitting.
    if (viewport.name === 'desktop') {
      await page.goto('/employee/pets/2')
      await page
        .waitForLoadState('networkidle', { timeout: 8000 })
        .catch(() => {})
      await delay(2000)
      await Promise.race([
        (async () => page.getByTestId('edit-button').first().click())(),
        delay(8000)
      ])
      await delay(800)
      await expect(page.locator('.q-dialog').last()).toBeVisible({
        timeout: 10000
      })
      await shot('pet-edit-dialog')
      await page.keyboard.press('Escape')
      await delay(400)
    }

    // 6. Navigation drawer: mobile = overlay open, desktop = mini rail expanded.
    await Promise.race([
      clickOrDispatch(page.getByLabel('Menu').first()),
      delay(8000)
    ])
    await delay(800)
    await Promise.race([
      shot(viewport.name === 'mobile' ? 'drawer-open' : 'drawer-expanded'),
      delay(10000)
    ])
    await page.keyboard.press('Escape')
    await delay(400)

    await Promise.race([page.context().close(), delay(5000)])
  })

  test(`customer FAB create dialog — ${viewport.name}`, async ({ browser }) => {
    test.setTimeout(180000)
    const page = await initializePage({ browser })
    await loginAtViewport(page, CUSTOMER.email, CUSTOMER.password, viewport)
    await page.goto('/account/pets')
    await page
      .waitForLoadState('networkidle', { timeout: 8000 })
      .catch(() => {})
    await delay(2000)
    // #fabAdd is the desktop rail FAB; on mobile the create button is the id-less sticky FAB.
    const fab =
      viewport.name === 'desktop'
        ? page.locator('#fabAdd')
        : page.locator('.q-page-sticky .q-btn').first()
    await fab.waitFor({ timeout: 10000 })
    await fab.click()
    await delay(800)
    await expect(page.locator('.q-dialog').last()).toBeVisible({
      timeout: 10000
    })
    await Promise.race([
      page.screenshot({
        path: `${OUT}/${viewport.name}/flow-customer-pet-create-dialog.png`
      }),
      delay(10000)
    ])
    await page.keyboard.press('Escape')
    await Promise.race([page.context().close(), delay(5000)])
  })
}

import { test, expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { initializePage, login } from './setup'

/**
 * Frontend visual audit capture.
 *
 * Shoots every renderable route in packages/app/src/router/routes.ts (minus the
 * OAuth redirects) at desktop (1440x900) and mobile (375x812), fullPage, in a
 * fresh English browser context, plus a fixed set of key interaction flows.
 *
 *   /account/* is shot twice: once as admin (no seeded customer profile →
 *   empty state) and once as test1@petboarding.app (seeded customer 1 → real
 *   content).
 *
 * Flows only OPEN UI state (menus/dialogs) and close again with Escape —
 * nothing is submitted, per the no-manual-mutation rule.
 *
 * Run (test stack up, default base URL https://petboarding.localhost):
 *   cd packages/api
 *   PLAYWRIGHT_ALLOW_SCREENSHOTS=1 pnpm exec playwright test \
 *     tests/e2e/screenshots-audit.spec.ts --reporter=list
 *
 * Screenshots land in packages/api/test-results/frontend-audit/<viewport>/.
 *
 * Selector provenance (all observed in the repo, none invented):
 *   - search button        data-testid="search-button"  (AccountsTable.vue:20)
 *   - booking approval     data-testid="booking-approval-button"
 *                                                          (bookings.spec.ts:36)
 *   - pet edit             data-testid="edit-button"
 *                            (employee/pets.spec.ts:31 — on /employee/pets/2)
 *   - account FAB          #fabAdd                      (account.spec.ts:83)
 *   - drawer toggle        aria-label="Menu"             (Md3Layout.vue:10,44)
 *   - overflow menu        header button last            (screenshots-admin.spec.ts:21)
 *   - user menu            header round button minus the mobile Menu toggle
 *                            (MainLayout.vue:6; Md3Layout.vue:5-12 prepends a
 *                             round aria-label="Menu" button on small screens)
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

/**
 * Log in at desktop width, then apply the requested viewport.
 *
 * At 375px the header's Login affordance is pointer-blocked — probed 2026-09-23:
 * `text=Login` resolves to the header button and the home card's item, and both
 * have an overlaying element at their centre (the drawer container's row covers
 * the header one). Capturing mobile therefore logs in at desktop width first;
 * the mobile layout is what the screenshots then exercise.
 */
async function loginAtViewport(
  page: Page,
  email: string,
  password: string,
  viewport: { width: number; height: number }
) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email, password })
  await page.setViewportSize({
    width: viewport.width,
    height: viewport.height
  })
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

// Not serial: a single failing capture must not skip the remaining viewports
// (workers: 1 already keeps the runs sequential).

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
    // Was 300000: the mobile half (23 routes + flows) legitimately needs more.
    test.setTimeout(180000)
    const page = await initializePage({ browser })
    await loginAtViewport(page, ADMIN.email, ADMIN.password, viewport)
    // Every screenshot in this test is capped: an uncapped page.screenshot() on a
    // stuck page waits out the whole test budget (that is what the 180s timeouts
    // showed on the Pets page).
    const shot = (slug: string) =>
      Promise.race([
        page.screenshot({ path: `${OUT}/${viewport.name}/flow-${slug}.png` }),
        delay(10000)
      ])

    const headerButtons = page.locator('header button')
    // User menu = the only round header button that isn't the mobile drawer
    // toggle (Md3Layout.vue:5-12 prepends a round aria-label Menu button on
    // small screens; Quasar renders the round prop as .q-btn--round; the
    // overflow button is flat).
    const userMenuButton = page.locator(
      'header button.q-btn--round:not([aria-label=Menu])'
    )

    // At 375px the header's buttons are pointer-blocked (the drawer container's
    // row covers them — probed 2026-09-23; asserted in the frontend specs). The
    // capture records the defect but still opens the menu so the shot exists:
    // a real click when it lands, a DOM dispatch otherwise.
    // Probe 2026-09-24: a plain click opens the menu (aria-expanded flips, .q-menu
    // renders), but in sweep runs it intermittently does not — so check, then retry
    // through a DOM dispatch before failing.
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

    // 4. Booking approval menu — open the menu only, Escape before any
    //    Approve/Reject selection (no-manual-mutation rule).
    if (viewport.name === 'desktop') {
      await page.goto('/admin/bookings')
      await page
        .waitForLoadState('networkidle', { timeout: 8000 })
        .catch(() => {})
      await delay(2000)
      // Seed-independent: any pending booking that exposes the approval button.
      // The old `hasText: 'name5'` precondition drifted when the default filter
      // stopped listing bookings 1-7 (only the February booking renders).
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

    // 5. Pet edit dialog — open only, Escape without submitting. The edit
    //    button lives on the pet detail page (employee/pets.spec.ts:31).
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
    // The rail FAB #fabAdd renders in the drawer MINI template with gt-sm
    // (Md3Layout.vue:49-51 + NavigationRailFabs.vue:5-7) — desktop only. On
    // mobile the create button is the id-less sticky FAB (lines 41-55), the
    // only button inside the q-page-sticky outlet.
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

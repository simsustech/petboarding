import { test, expect, type Page } from '@playwright/test'
import { initializePage, login } from './setup'

/**
 * Dark-mode visual capture. Dark is a second styling path: Quasar switches on
 * `body.body--dark`, which the preset's wind4 fragment maps wind4's `dark:` variant
 * to, and the app extensions' CSS ships only from the preset — so this run proves
 * their dark tokens resolve rather than falling back to light values.
 *
 * Run (test stack up):
 *   cd packages/api
 *   PLAYWRIGHT_ALLOW_SCREENSHOTS=1 pnpm exec playwright test \
 *     tests/e2e/screenshots-dark.spec.ts --reporter=list
 *
 * Screenshots land in packages/api/test-results/frontend-audit-dark/<viewport>/.
 */

const OUT = 'test-results/frontend-audit-dark'

// Same accounts the light sweep uses (screenshots-audit.spec.ts) — the seeded
// test users, not invented ones.
const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }
const CUSTOMER = { email: 'test1@petboarding.app', password: 'qjiNWdT8L' }

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812 }
]

/** Routes worth a dark check: the shells, token-heavy pages, and every view the
 *  app extensions style (calendar month/agenda/mini, markdown). */
const ROUTES: [string, string][] = [
  ['/', 'home'],
  ['/user', 'user'],
  ['/information', 'information'],
  ['/availability', 'availability'],
  ['/admin', 'admin-home'],
  ['/admin/occupancy', 'admin-occupancy'],
  ['/admin/bookings', 'admin-bookings'],
  ['/admin/accounts', 'admin-accounts'],
  ['/admin/daycare', 'admin-daycare'],
  ['/admin/config/openingtimes', 'admin-config-openingtimes'],
  ['/admin/config/documents', 'admin-config-documents'],
  ['/admin/configuration', 'admin-configuration'],
  ['/admin/financial/overview', 'admin-financial-overview'],
  ['/employee', 'employee-home'],
  ['/employee/agenda', 'employee-agenda'],
  ['/employee/bookings', 'employee-bookings'],
  ['/employee/kennellayout', 'employee-kennellayout'],
  ['/employee/overview', 'employee-overview'],
  ['/account/bookings', 'account-bookings'],
  ['/account/pets', 'account-pets'],
  ['/print/privacypolicy', 'print-privacypolicy'],
  ['/print/termsandconditions', 'print-termsandconditions'],
  ['/print/overview', 'print-overview']
]

/**
 * Turn dark on. Preferred path is the real toggle (what a user does); the fallback
 * is the `body--dark` class Quasar's Dark plugin sets, which is what the CSS keys
 * off — including this preset's wind4 `dark:` mapping (`.body--dark`). Print routes
 * have no layout at all, so the toggle is unreachable there by design.
 */
async function setDark(page: Page) {
  const isDark = () =>
    page.evaluate(() => document.body.classList.contains('body--dark'))
  if (await isDark()) return
  const menuButton = page.locator('.q-btn:has(.i-mdi-more-vert)').first()
  if (await menuButton.count()) {
    try {
      await menuButton.click({ timeout: 3000 })
      const toggle = page.locator('.q-menu .q-toggle').last()
      await toggle.waitFor({ state: 'visible', timeout: 5000 })
      await toggle.click({ timeout: 3000 })
      await page.keyboard.press('Escape')
    } catch {
      await page.evaluate(() => document.body.classList.add('body--dark'))
    }
  } else {
    await page.evaluate(() => document.body.classList.add('body--dark'))
  }
  await expect.poll(isDark, { timeout: 8000 }).toBe(true)
}

/**
 * Log in at desktop width, then apply the requested viewport — at 375px the
 * header's Login affordance is pointer-blocked by the drawer container's row
 * (probed 2026-09-23; see the note in screenshots-audit.spec.ts). The mobile
 * layout is still what the captures exercise, only the sign-in is desktop-sized.
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

for (const viewport of VIEWPORTS) {
  test(`dark: admin + employee + account routes — ${viewport.name}`, async ({
    browser
  }) => {
    // 23 routes × slowMo + networkidle exceeds the 30s default.
    test.setTimeout(600000)
    const page = await initializePage({ browser })
    await loginAtViewport(page, ADMIN.email, ADMIN.password, viewport)
    await setDark(page)
    for (const [route, slug] of ROUTES) {
      await page.goto(route, { waitUntil: 'networkidle' }).catch(() => {})
      await setDark(page)
      await page.screenshot({
        path: `${OUT}/${viewport.name}/${slug}.png`,
        fullPage: true,
        animations: 'disabled'
      })
    }
  })

  test(`dark: customer account routes — ${viewport.name}`, async ({
    browser
  }) => {
    test.setTimeout(300000)
    const page = await initializePage({ browser })
    await loginAtViewport(page, CUSTOMER.email, CUSTOMER.password, viewport)
    await setDark(page)
    for (const [route, slug] of ROUTES.filter(
      ([r]) => r.startsWith('/account') || r === '/'
    )) {
      await page.goto(route, { waitUntil: 'networkidle' }).catch(() => {})
      await setDark(page)
      await page.screenshot({
        path: `${OUT}/${viewport.name}/customer-${slug}.png`,
        fullPage: true,
        animations: 'disabled'
      })
    }
  })
}

import { test } from '@playwright/test'
import { initializePage, login } from './setup'

/**
 * Grid captures the route audit misses: the employee pets grid only renders
 * cards once ids are selected, and the audit visits it empty (`/employee/pets`)
 * and with a single pet (`/employee/pets/2`) — never with a wrapped grid, which
 * is where the card margins/gutters show.
 *
 * Named `screenshots-*` so the default suite ignores it (testIgnore) and
 * `PLAYWRIGHT_ALLOW_SCREENSHOTS=1` opts in.
 *
 *   cd packages/api
 *   PLAYWRIGHT_ALLOW_SCREENSHOTS=1 pnpm exec playwright test \
 *     tests/e2e/screenshots-grids.spec.ts --reporter=list
 *
 * Output: test-results/frontend-audit-grids/<viewport>/
 */

const OUT = 'test-results/frontend-audit-grids'
const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 }
] as const

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

for (const viewport of VIEWPORTS) {
  test(`grids — ${viewport.name}`, async ({ browser }) => {
    test.setTimeout(300000)
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height
    })

    // Three pets → the grid wraps at narrow widths and the gutters are visible.
    await page.goto('/employee/pets/1/2/3')
    await page
      .waitForLoadState('networkidle', { timeout: 8000 })
      .catch(() => {})
    await delay(3000)
    await page.screenshot({
      path: `${OUT}/${viewport.name}/pets-grid-3.png`,
      fullPage: true
    })

    // The customer's own pets grid (col-12 col-md-4 cards on a q-col-gutter row).
    await page.goto('/employee/customers')
    await page
      .waitForLoadState('networkidle', { timeout: 8000 })
      .catch(() => {})
    await delay(2500)
    await page.screenshot({
      path: `${OUT}/${viewport.name}/customers.png`,
      fullPage: true
    })

    await page.context().close()
  })
}

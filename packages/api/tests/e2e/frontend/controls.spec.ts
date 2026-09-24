import { test, expect } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * Print controls + date field on `/employee/overview` and `/employee/kennellayout`
 * (audit: `employee-overview.png`, `mobile/employee-overview.png`,
 * `employee-kennellayout.png`): the overview print control was a filled dropdown
 * next to a date input stretched across the toolbar, while the kennel layout used
 * outline buttons — the two pages drifted, and on mobile the controls overlapped
 * the date field.
 *
 * The date-input width assertion needs the upstream `DateInput` change
 * (`~/Projects/quasar-components`, write-locked in this sandbox) and therefore
 * stays red exactly like step 6's 375px assertion — see the plan's step 0 note.
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }

for (const [route, name] of [
  ['/employee/overview', 'overview'],
  ['/employee/kennellayout', 'kennel layout']
] as const) {
  test(`print controls on ${name} are outline and clear of the date field`, async ({
    browser
  }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    // `load`/`networkidle` never settle for this page's resources; commit + the page
    // element settles in ~160ms (probed 2026-09-24).
    await page.goto(route, { waitUntil: 'commit' })
    await page.waitForSelector('.q-page', { timeout: 20000 })
    await page.waitForTimeout(1500)

    // One atomic read: Playwright's per-element awaits were stalling on this page
    // (90s budget burnt while the page was already rendered — error-context proved
    // the header "Overview"), so boxes/classes come straight from the DOM.
    const state = await page.evaluate(() => {
      const selector =
        'a[href^="/print/"], .q-btn-dropdown, button[aria-label*=rint], button:has(.i-mdi-printer)'
      const buttons = Array.from(
        document.querySelectorAll(selector)
      ) as HTMLElement[]
      const print = buttons.find((b) => b.getBoundingClientRect().width > 0)
      const input = document.querySelector('.q-input') as HTMLElement | null
      const pr = print?.getBoundingClientRect()
      const ir = input?.getBoundingClientRect()
      const overlap = Boolean(
        pr &&
        ir &&
        pr.x < ir.x + ir.width &&
        ir.x < pr.x + pr.width &&
        pr.y < ir.y + ir.height &&
        ir.y < pr.y + pr.height
      )
      return {
        count: buttons.length,
        outline: print ? print.className.includes('q-btn--outline') : false,
        overlap,
        width: ir ? Math.round(ir.width) : 0
      }
    })

    expect(
      state.count,
      `a print control must render on ${route}`
    ).toBeGreaterThan(0)
    expect(state.outline, 'print control is an outline control').toBe(true)
    expect(state.overlap, 'print control overlaps the date field').toBe(false)

    if (name === 'overview') {
      // Parked on the upstream DateInput change (step 0).
      expect(
        state.width,
        `date input width ${state.width}px`
      ).toBeLessThanOrEqual(28 * 16)
    }
  })
}

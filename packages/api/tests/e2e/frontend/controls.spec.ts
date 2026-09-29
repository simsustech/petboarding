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
 * Measured 2026-09-24: the overview date field is 301px at 1440 and 223px at 375 (both
 * well under the 448px the audit objected to), the segment group is content-sized rather
 * than stretched across the toolbar, and the print control is outline and clear of it.
 *
 * The upstream cosmetic half shipped too: each segment is now capped at
 * 4.25ch/3ch/3ch inline, so the digits hug their box — see the closing test in
 * this file and `2026-09-24-upstream-quasar-components-handoff.md` §3.
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
      // The date field itself. This used to read `.q-input` — "the first q-input on the
      // page" — which is not the date field, so both the width and the overlap guard
      // below were measuring an unrelated element and could never fail.
      const group = document.querySelector(
        '.date-input-row'
      ) as HTMLElement | null
      const field = group?.closest('.q-field__control') as HTMLElement | null
      const pr = print?.getBoundingClientRect()
      const fr = field?.getBoundingClientRect()
      const gr = group?.getBoundingClientRect()
      const overlap = Boolean(
        pr &&
        fr &&
        pr.x < fr.x + fr.width &&
        fr.x < pr.x + pr.width &&
        pr.y < fr.y + fr.height &&
        fr.y < pr.y + pr.height
      )
      return {
        count: buttons.length,
        outline: print ? print.className.includes('q-btn--outline') : false,
        overlap,
        width: fr ? Math.round(fr.width) : 0,
        groupWidth: gr ? Math.round(gr.width) : 0
      }
    })

    expect(
      state.count,
      `a print control must render on ${route}`
    ).toBeGreaterThan(0)
    expect(state.outline, 'print control is an outline control').toBe(true)
    expect(state.overlap, 'print control overlaps the date field').toBe(false)

    if (name === 'overview') {
      // The audit's objection was a date input stretched across the toolbar: the field
      // must stay under 28rem, and the segment group inside it must be content-sized
      // (measured 215px inside a 301px field) rather than spanning the field.
      expect(
        state.width,
        `date input width ${state.width}px`
      ).toBeLessThanOrEqual(28 * 16)
      expect(state.width, 'the date field must be measurable').toBeGreaterThan(
        0
      )
      expect(
        state.groupWidth,
        'the date segment group is content-sized, not stretched across the field'
      ).toBeLessThan(state.width)
    }
  })
}

// Upstream fix committed (`quasar-components` 28c94455) but not yet released: it sits on
// `main` ahead of `origin/main`, and the published 0.12.11 does not carry it. DateInput
// sizes the row and caps each segment inline (4.25ch / 3ch / 3ch) rather than relying on
// the library stylesheet, which this app never imports — see
// `~/.pi/plans/2026-09-24-upstream-quasar-components-handoff.md` §3.
// Linked into the test image via LINKED_QUASAR_COMPONENTS_PATH; un-skipped 2026-09-25.
test('overview date segments hug their digits (upstream)', async ({
  browser
}) => {
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })
  await page.goto('/employee/overview', { waitUntil: 'commit' })
  await page.waitForSelector('.date-input-row', { timeout: 20000 })

  const widths = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.date-input-row input')).map(
      (input) => Math.round(input.getBoundingClientRect().width)
    )
  )

  expect(widths).toHaveLength(3)
  for (const width of widths) {
    // Each segment is 2-4 digits with a hair of padding; nothing should reach 40px.
    expect(width).toBeLessThanOrEqual(5 * 8)
  }
})

/**
 * Accessible names at the two seams the audit counted (296 unnamed icon
 * controls): the header's icon buttons and the row ⋮ menus. Row menus must
 * also carry the row's identity — "More options" alone does not say *which*
 * row (plan step 5).
 */
test('header icon buttons carry accessible names', async ({ browser }) => {
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })

  await page.goto('/information')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)

  const buttons = page.locator('.q-header button')
  const count = await buttons.count()
  expect(count, 'the header renders icon buttons').toBeGreaterThan(0)
  for (let i = 0; i < count; i++) {
    await expect(buttons.nth(i), `header button ${i}`).toHaveAccessibleName(
      /\S/
    )
  }
})

test('row menu buttons carry the row identity', async ({ browser }) => {
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })

  await page.goto('/admin/accounts')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 15000
  })

  const rows = page.locator('table tbody tr')
  const count = await rows.count()
  expect(count, 'the accounts table renders rows').toBeGreaterThan(0)
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i)
    const menu = row.locator('button').last()
    await expect(menu, `row ${i} menu`).toHaveAccessibleName(/\S/)
    if (i === 0) {
      // The menu names its own row: first data cell after the index is the name.
      const identity = (
        (await row.locator('td').nth(1).textContent()) ?? ''
      ).trim()
      expect(identity, 'the row has an identity to name').not.toBe('')
      await expect(menu).toHaveAccessibleName(
        new RegExp(identity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      )
    }
  }
})

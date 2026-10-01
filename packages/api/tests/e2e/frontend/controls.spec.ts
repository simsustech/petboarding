import { test, expect } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * Print controls + date field on `/employee/overview` and `/employee/kennellayout`.
 * The two pages had drifted (a filled dropdown vs outline buttons) and overlapped the
 * date field on mobile; this pins the outline control, its clearance from the date
 * field, and the field's content-sized segment group.
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

    // `load`/`networkidle` never settle here; commit + wait for `.q-page`.
    await page.goto(route, { waitUntil: 'commit' })
    await page.waitForSelector('.q-page', { timeout: 20000 })
    await page.waitForTimeout(1500)

    // One atomic DOM read: per-element awaits were stalling on this page.
    const state = await page.evaluate(() => {
      const selector =
        'a[href^="/print/"], .q-btn-dropdown, button[aria-label*=rint], button:has(.i-mdi-printer)'
      const buttons = Array.from(
        document.querySelectorAll(selector)
      ) as HTMLElement[]
      const print = buttons.find((b) => b.getBoundingClientRect().width > 0)
      // Read the real date field's wrapper (`.q-input` measured an unrelated element).
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
      // The field stays under 28rem with a content-sized segment group, not a stretched input.
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

// Upstream DateInput fix (quasar-components) sizes the row and caps each segment inline;
// linked into the test image via LINKED_QUASAR_COMPONENTS_PATH.
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
 * Accessible names at the header's icon buttons and the row ⋮ menus, which must carry
 * the row's identity — not just "More options".
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

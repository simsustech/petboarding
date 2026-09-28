import { test, expect } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * Layout and overlay polish (audit + this session's probes):
 *   - at 375px the drawer container's row covers the header's buttons, so Login /
 *     overflow / user menu take no clicks (probed: elementFromPoint returns
 *     `div.row` from `q-drawer-container`) — the reason the mobile capture needed
 *     a dispatch fallback;
 *   - drawer labels clip (`Administratc`);
 *   - the notify default position must keep toasts out of the footer;
 *   - month grids need a horizontal-scroll affordance (clipped in `admin-daycare.png`);
 *   - the pet legend must fit its container at both viewports.
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }

/**
 * At 375px the drawer container's row covers the header's Login affordance (the
 * 14e defect this file asserts), so signing in at 1440 first and then resizing is
 * the pattern the capture specs already use.
 */
async function loginAtMobile(
  page: import('@playwright/test').Page,
  email: string,
  password: string
) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email, password })
  await page.setViewportSize({ width: 375, height: 812 })
}

test('header controls are hittable at 375px', async ({ browser }) => {
  const page = await initializePage({ browser })
  await loginAtMobile(page, ADMIN.email, ADMIN.password)
  await page.goto('/admin/bookings')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  const buttons = page.locator('.q-header button')
  const count = await buttons.count()
  expect(count, 'the header renders its controls').toBeGreaterThan(0)

  const blocked: string[] = []
  for (let i = 0; i < count; i++) {
    const button = buttons.nth(i)
    const info = await button.evaluate((el: Element) => {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return { empty: true }
      const top = document.elementFromPoint(
        rect.x + rect.width / 2,
        rect.y + rect.height / 2
      )
      const hittable = Boolean(
        top && (top === el || el.contains(top) || top.contains(el))
      )
      return {
        empty: false,
        hittable,
        label:
          el.getAttribute('aria-label') ?? el.textContent?.trim() ?? `#${i}`
      }
    })
    if (!info.empty && !info.hittable) blocked.push(String(info.label))
  }
  expect(blocked, `header controls blocked: ${blocked.join(', ')}`).toEqual([])
})

test('drawer labels do not clip', async ({ browser }) => {
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })
  await page.goto('/admin/bookings')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  // The audit saw `Administrato` clipped in the desktop mini-rail. Measure every
  // visible rail/drawer label: text must not be cut off inside its own box.
  const clipped = await page.evaluate(() => {
    const labels = Array.from(
      document.querySelectorAll('.q-drawer .q-item__label')
    ) as HTMLElement[]
    return labels
      .filter((el) => el.offsetWidth > 0 && el.scrollWidth > el.clientWidth + 1)
      .map(
        (el) =>
          `${el.textContent?.trim()} (${el.scrollWidth}>${el.clientWidth})`
      )
  })
  expect(clipped, `clipped drawer labels: ${clipped.join(', ')}`).toEqual([])
})

test('toasts stay out of the footer', async ({ browser }) => {
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })

  // Deterministic, read-only trigger: `/configuration` failing is the path
  // `loadConfiguration` notifies on (src/configuration.ts). Nothing is submitted.
  await page.route('**/configuration*', (route) =>
    route.fulfill({ status: 500, body: '' })
  )
  // The toast lives ~5s: look for it immediately instead of after networkidle+3s,
  // which used to outlive it (probed: /configuration IS fetched on every boot).
  await page.goto('/admin/bookings', { waitUntil: 'commit' })
  const toast = page.locator('#q-notify .q-notification').first()
  await expect(toast, 'the configuration failure surfaces a toast').toBeVisible(
    {
      timeout: 10000
    }
  )

  const [toastBox, footerBox, viewport] = await Promise.all([
    toast.boundingBox(),
    page
      .locator('.q-footer')
      .first()
      .boundingBox()
      .catch(() => null),
    page.evaluate(() => window.innerHeight)
  ])
  expect(toastBox).toBeTruthy()
  expect(toastBox!.y + toastBox!.height / 2).toBeLessThan(viewport / 2)
  if (footerBox) {
    expect(toastBox!.y + toastBox!.height).toBeLessThanOrEqual(footerBox.y + 1)
  }
})

test('month grid scrolls horizontally instead of clipping', async ({
  browser
}) => {
  const page = await initializePage({ browser })
  await loginAtMobile(page, ADMIN.email, ADMIN.password)
  await page.goto('/admin/daycare')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(3000)

  const state = await page.evaluate(() => {
    const scroller =
      (document.querySelector(
        '.q-calendar-month__body'
      ) as HTMLElement | null) ??
      (document.querySelector('.q-calendar-month') as HTMLElement | null)
    if (!scroller) return { found: false }
    const cs = getComputedStyle(scroller)
    return {
      found: true,
      overflowX: cs.overflowX,
      shadow: cs.boxShadow
    }
  })

  expect(state.found, 'the month grid renders').toBe(true)
  const s = state as { overflowX: string; shadow: string }
  const scrollable = s.overflowX === 'auto' || s.overflowX === 'scroll'
  const hasAffordance = s.shadow !== 'none' && s.shadow !== ''
  expect(
    scrollable || hasAffordance,
    `overflow-x=${s.overflowX} box-shadow=${s.shadow}`
  ).toBe(true)
})

test('pet legend fits its container at both viewports', async ({ browser }) => {
  const page = await initializePage({ browser })
  await login({ page, email: ADMIN.email, password: ADMIN.password })

  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 812 })
    await page.goto('/employee/kennellayout')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2500)

    const over = await page.evaluate(() => {
      const rows = Array.from(
        document.querySelectorAll('.q-page .row')
      ) as HTMLElement[]
      return rows
        .filter((el) => el.scrollWidth > el.clientWidth + 1)
        .map((el) => `${el.className}: ${el.scrollWidth}>${el.clientWidth}`)
    })
    expect(over, `overflowing rows at ${width}px: ${over.join(' | ')}`).toEqual(
      []
    )
  }
})

/**
 * Reported 2026-09-28: "on petlabels the search bar and the search button are
 * not aligned". The preset emitted `.q-field`/`.q-select` with
 * `flex-direction: column`, but the root's children are `__before`, `__inner`,
 * `__after` — siblings. `PetSelect` always forwards a `#before` slot, so Quasar
 * renders the empty marginal and it stacked ABOVE the inner: the field grew to
 * 112px, the control's centre fell 28px below the print button's, and the
 * toolbar grew with it. Preset fix: `field-root-lays-out-as-row` changeset.
 */
test('the labels search field sits on the toolbar centre line', async ({
  browser
}) => {
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })
  await page.goto('/employee/labels/pets', { waitUntil: 'commit' })
  await page.waitForSelector('.q-page .q-field__control', { timeout: 20000 })
  await page.waitForTimeout(1200)

  const state = await page.evaluate(() => {
    const field = document.querySelector('.q-page .q-field') as HTMLElement
    const control = field.querySelector('.q-field__control') as HTMLElement
    const button = field.parentElement?.querySelector('.q-btn') ?? null
    const centre = (el: Element) => {
      const rect = el.getBoundingClientRect()
      return rect.y + rect.height / 2
    }
    return {
      direction: getComputedStyle(field).flexDirection,
      fieldH: Math.round(field.getBoundingClientRect().height),
      controlH: Math.round(control.getBoundingClientRect().height),
      delta: button ? Math.round(centre(button) - centre(control)) : null
    }
  })

  // One row: no marginal stacked above the control (was 112 vs 56).
  expect(
    state.fieldH,
    `the field is ${state.fieldH}px for a ${state.controlH}px control (direction=${state.direction})`
  ).toBeLessThanOrEqual(state.controlH + 1)
  // The button and the input share a centre line (was 28px apart).
  expect(
    Math.abs(state.delta ?? 0),
    `print button is ${state.delta}px off the search field's centre`
  ).toBeLessThanOrEqual(1)
})

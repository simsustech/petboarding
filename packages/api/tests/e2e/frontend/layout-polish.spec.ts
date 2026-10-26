import { test, expect } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * Layout and overlay polish (audit + probes): the app bar's reachability against
 * an open drawer (ADR 0007's amendment), the notify position vs the
 * footer, the month grids' horizontal-scroll affordance, and the pet legend fitting
 * its container at both viewports.
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }

/** Sign in at 1440, then resize — at 375px the drawer covers the header's Login affordance. */
async function loginAtMobile(
  page: import('@playwright/test').Page,
  email: string,
  password: string
) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email, password })
  await page.setViewportSize({ width: 375, height: 812 })
}

/**
 * Which of the app bar's buttons the pointer actually reaches: `elementFromPoint`
 * at each one's centre. Scoped to the header of the layout that owns the drawer —
 * both carry `.q-header` wherever the shell is nested.
 */
const headerControlHits = async (page: import('@playwright/test').Page) => {
  // A Quasar loading backdrop would answer the probe instead of the layout, and
  // the app shows one after every navigation — wait it out before measuring.
  await page
    .waitForSelector('.q-loading__backdrop', {
      state: 'detached',
      timeout: 15_000
    })
    .catch(() => undefined)
  return page.evaluate(() => {
    const layout = document.querySelector('.q-drawer')?.closest('.q-layout')
    const buttons = Array.from(
      layout?.querySelectorAll('.q-header button') ?? []
    ) as HTMLElement[]
    const hittable: string[] = []
    const blocked: string[] = []
    let checked = 0
    for (const [i, el] of buttons.entries()) {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) continue
      checked++
      const hit = document.elementFromPoint(
        rect.x + rect.width / 2,
        rect.y + rect.height / 2
      )
      const reached = Boolean(
        hit && (hit === el || el.contains(hit) || hit.contains(el))
      )
      const label =
        el.getAttribute('aria-label') ?? el.textContent?.trim() ?? `#${i}`
      if (reached) hittable.push(label)
      else {
        // Name what is on top: the assertion's message has to diagnose itself.
        const over = hit
          ? `${hit.tagName.toLowerCase()}.${String(hit.className)
              .split(' ')
              .slice(0, 2)
              .join('.')}`
          : 'nothing (outside the viewport)'
        blocked.push(`${label} <- ${over}`)
      }
    }
    return { checked, hittable, blocked }
  })
}

/** The drawer closes by translating off to the left, so its box tells the state. */
const drawerIsOpen = (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const drawer = document.querySelector('.q-drawer')
    return drawer ? drawer.getBoundingClientRect().right > 1 : false
  })

const openDrawer = async (page: import('@playwright/test').Page) => {
  if (await drawerIsOpen(page)) return
  await page.locator('button[aria-label="Menu"]').first().click()
  await page.waitForFunction(
    () => {
      const drawer = document.querySelector('.q-drawer')
      return !!drawer && drawer.getBoundingClientRect().right > 1
    },
    undefined,
    { timeout: 10_000 }
  )
}

const closeDrawer = async (page: import('@playwright/test').Page) => {
  if (!(await drawerIsOpen(page))) return
  await page.locator('[aria-label="Close"]').first().click()
  await page.waitForFunction(
    () => {
      const drawer = document.querySelector('.q-drawer')
      return !drawer || drawer.getBoundingClientRect().right <= 1
    },
    undefined,
    { timeout: 10_000 }
  )
}

/**
 * ADR 0007, amended 2026-10-05: the overlay drawer sits above both marginals —
 * `.q-drawer--on-top` 3000 and its scrim 2999 against `.q-header` 2000 — so while
 * the drawer is open the app bar behind it is dimmed and yields the pointer, and
 * is reachable again the moment it shuts.
 *
 * This is the same rule `quasar-testing-harness/tests/md3-layout.spec.ts`
 * asserts against the shell itself. Both flip the gate this test used to be —
 * "header controls are hittable at 375px" pinned the opposite ordering, which is
 * exactly what the amendment reversed.
 *
 * Goes red until `unocss-preset-quasar` is bumped past the changeset that ships
 * the amendment; the installed 0.6.0 still has the drawer at 1500.
 */
test('an open drawer owns the pointer over the header at 375px', async ({
  browser
}) => {
  const page = await initializePage({ browser })

  // Sign in at 1440, then resize — at 375px the drawer is open and its scrim
  // owns the pointer, so the header's Login affordance is not clickable there.
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })

  const desktop = await headerControlHits(page)
  expect(desktop.checked, 'the header renders its controls').toBeGreaterThan(0)
  expect(
    desktop.blocked,
    `header controls blocked without a drawer: ${desktop.blocked.join(', ')}`
  ).toEqual([])

  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/admin/bookings')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  // Drive both states instead of trusting the default: the rule is about the
  // drawer, not about where the app happens to start.
  await openDrawer(page)
  const open = await headerControlHits(page)
  expect(open.checked, 'the header renders its controls').toBeGreaterThan(0)
  expect(
    open.hittable,
    `reachable behind the open drawer: ${open.hittable.join(', ')}`
  ).toEqual([])

  await closeDrawer(page)
  const shut = await headerControlHits(page)
  expect(
    shut.blocked,
    `still blocked with the drawer shut: ${shut.blocked.join(', ')}`
  ).toEqual([])
})

test('drawer labels do not clip', async ({ browser }) => {
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })
  await page.goto('/admin/bookings')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  // Measure every visible rail/drawer label: text must not be cut off in its box.
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
 * Reported: on pet labels the search bar and print button were misaligned — the preset
 * emitted `.q-field`/`.q-select` with `flex-direction: column`, but the field's children
 * are siblings, so `PetSelect`'s `#before` marginal stacked above the inner and the field
 * grew to 112px. Preset fix: `field-root-lays-out-as-row`.
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

/**
 * The mini-rail label truncates with a single-line ellipsis (never a layout resize), so
 * its tab content's scrollWidth must fit its clientWidth.
 */
test('rail label boxes do not clip at 1440', async ({ browser }) => {
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })
  await page.goto('/admin/bookings')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  const clipped = await page.evaluate(() => {
    const boxes = Array.from(
      document.querySelectorAll('.navigation-rail .q-tab__content')
    ) as HTMLElement[]
    return boxes
      .filter((el) => el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1)
      .map(
        (el) =>
          `${el.textContent?.trim()} (${el.scrollWidth}>${el.clientWidth})`
      )
  })
  expect(clipped, `clipped rail labels: ${clipped.join(', ')}`).toEqual([])
})

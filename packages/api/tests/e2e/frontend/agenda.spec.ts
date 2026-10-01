import { test, expect } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * Agenda calendar UX pass guards (plan 2026-09-30), one test per finding:
 *
 * Step 1 — `quiet week keeps its controls`: a quiet period used to swap the whole
 * AgendaComponent for one sentence (`AgendaPage.vue`'s `v-if="!emptyAgenda"`), so
 * the date picker, Status filter, Day/Week toggle, prev/next/Today and all 7
 * weekday headers vanished and the page landed on today's week. Red here means
 * the empty state regressed to a page-level swap: the agenda must keep its chrome
 * and show the quiet message inside the grid instead.
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }

test('quiet week keeps its controls', async ({ browser }) => {
  const page = await initializePage({ browser })
  await login({ page, email: ADMIN.email, password: ADMIN.password })

  // Deterministic quiet period: no seed data exists in 2030.
  await page.goto('/employee/agenda/2030-01-01')
  await page.waitForLoadState('networkidle')

  // The quiet-period message is visible…
  await expect(
    page.getByText('No bookings or daycare this week.')
  ).toBeVisible()

  // …and the grid still renders its 7 weekday headers.
  const weekdays = page.locator('.q-calendar-agenda__head--weekday')
  await expect(weekdays).toHaveCount(7)
  for (let i = 0; i < 7; i++) {
    await expect(weekdays.nth(i)).toBeVisible()
  }

  // The toolbar keeps every control.
  await expect(
    page.locator('.q-field__label').filter({ hasText: /^Status$/ })
  ).toBeVisible()
  await expect(
    page.locator('.q-field__label').filter({ hasText: /^Date$/ })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Day', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Week', exact: true })
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Previous' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Next' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Today' })).toBeVisible()

  // Navigation still works from a quiet period: Next moves the range label.
  const range = page.locator('div.text-subtitle1.text-weight-medium')
  const before = (await range.textContent())?.trim()
  expect(before, 'the range label starts non-empty').toBeTruthy()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect
    .poll(async () => (await range.textContent())?.trim(), {
      timeout: 10000
    })
    .not.toBe(before)
})

/**
 * Step 2 — `grid fills the page`: the agenda grid used to be 258px tall inside an
 * 850px page (~590px dead space) because the outer `q-scroll-area` was sized from
 * content via a resize observer. Red here means the grid stopped filling its
 * page-height column.
 */
test('grid fills the page', async ({ browser }) => {
  const page = await initializePage({ browser })
  await login({ page, email: ADMIN.email, password: ADMIN.password })
  await page.setViewportSize({ width: 1280, height: 900 })

  await page.goto('/employee/agenda/2030-01-01')
  await page.waitForLoadState('networkidle')

  const pageBox = await page.locator('.q-page').boundingBox()
  const gridBox = await page.locator('.q-calendar-agenda').boundingBox()
  expect(pageBox, 'the page renders').toBeTruthy()
  expect(gridBox, 'the grid renders').toBeTruthy()
  const gap = pageBox!.y + pageBox!.height - (gridBox!.y + gridBox!.height)
  expect(
    gap,
    `grid bottom sits ${Math.round(gap)}px above the page bottom`
  ).toBeLessThanOrEqual(24)
})

/**
 * Step 2 — `mobile reachability`: the week's horizontal scroll needs an affordance
 * (`lt-md` swipe hint) and the fill-height grid must keep its last day row above
 * the fixed 80px `q-footer` — everything stays reachable on a phone.
 */
test('mobile reachability', async ({ browser }) => {
  const page = await initializePage({ browser })
  await login({ page, email: ADMIN.email, password: ADMIN.password })
  await page.setViewportSize({ width: 412, height: 915 })

  await page.goto('/employee/agenda/2030-01-01')
  await page.waitForLoadState('networkidle')

  // The week overflows the phone's width; the swipe hint announces it.
  await expect(
    page.getByText('Swipe to see the rest of the week.')
  ).toBeVisible()

  // The page itself scrolls (the library's internal scroll must not trap it)…
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
  )
  await page.waitForTimeout(300)

  // …and the last day row ends above the fixed footer.
  const lastRow = page.locator('.q-calendar-agenda__day').last()
  const footer = page.locator('.q-footer')
  const rowBox = await lastRow.boundingBox()
  const footerBox = await footer.boundingBox()
  expect(rowBox, 'the day rows render').toBeTruthy()
  expect(footerBox, 'the mobile footer renders').toBeTruthy()
  expect(
    rowBox!.y + rowBox!.height,
    'the last day row must not sit under the footer'
  ).toBeLessThanOrEqual(footerBox!.y)
})

/**
 * Step 3 — `zero counts are silent`: every cell used to render `Bookings 0` +
 * `Daycare 0` with two separators even when both were 0 (finding 3). Red here
 * means empty cells are noisy again. A day with data must keep its non-zero
 * count and its chips.
 */
test('zero counts are silent', async ({ browser }) => {
  const page = await initializePage({ browser })
  await login({ page, email: ADMIN.email, password: ADMIN.password })
  await page.setViewportSize({ width: 1280, height: 900 })

  await page.goto('/employee/agenda/2024-01-01')
  await page.waitForLoadState('networkidle')

  // Quiet cells render no zero labels…
  await expect(page.getByText('Bookings 0')).toHaveCount(0)
  await expect(page.getByText('Daycare 0')).toHaveCount(0)

  // …while a day with data keeps its count and its chips.
  await expect(page.getByText('Bookings 1').first()).toBeVisible()
  await expect(page.getByText('name2').first()).toBeVisible()
})

/**
 * Step 4 — `legend lives behind a button`: both legends plus the 9-entry block
 * used to render inline and push the grid below the fold on a phone (finding 4).
 * Red here means the legends are back inline. The Last-name toggle must stay
 * outside the menu.
 */
test('legend lives behind a button', async ({ browser }) => {
  const page = await initializePage({ browser })
  await login({ page, email: ADMIN.email, password: ADMIN.password })
  await page.setViewportSize({ width: 1280, height: 900 })

  await page.goto('/employee/agenda/2030-01-01')
  await page.waitForLoadState('networkidle')

  // The Last-name toggle stays inline, no menu needed.
  await expect(page.getByText('Last name')).toBeVisible()

  // Legend entries are not on the page until the button opens them.
  await expect(page.getByText('Appointment')).toBeHidden()
  await expect(page.getByText('In heat')).toBeHidden()

  await page.getByRole('button', { name: 'Legend' }).click()
  await expect(page.getByText('Appointment')).toBeVisible()
  await expect(page.getByText('In heat')).toBeVisible()
})

/**
 * Step 5 — `day view lays its content on a readable measure`: the day band used
 * to run its content full-width (1174px measured) with the chips as 12em islands
 * and no centred measure (finding 5). Red here means the 48rem centred container
 * is gone. The name guard keeps chip names readable. (Amended 2026-10-01: the
 * plan's original `chip wider than 12em` clause was unachievable — PetChip's
 * `max-width: 12em` is kept through step 6.)
 */
test('day view lays content on a readable measure', async ({ browser }) => {
  const page = await initializePage({ browser })
  await login({ page, email: ADMIN.email, password: ADMIN.password })
  await page.setViewportSize({ width: 1280, height: 900 })

  // A day with a booking.
  await page.goto('/employee/agenda/2024-01-02')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Day', exact: true }).click()
  await page.waitForTimeout(1000)

  // The day's content sits on a readable measure, centred in the band.
  const geo = await page.evaluate(() => {
    const col = document
      .querySelector('.q-calendar-agenda__day')
      ?.getBoundingClientRect()
    const list = document
      .querySelector('.q-calendar-agenda__day .q-list')
      ?.getBoundingClientRect()
    if (!col || !list) return null
    return {
      width: list.width,
      leftGap: list.x - col.x,
      rightGap: col.right - list.right
    }
  })
  expect(geo, 'the day column renders its content').toBeTruthy()
  expect(
    geo!.width,
    `day content is ${Math.round(geo!.width)}px wide`
  ).toBeLessThanOrEqual(48 * 16 + 24)
  expect(
    geo!.width,
    `day content uses the measure — ${Math.round(geo!.width)}px is a content hug, not 48rem`
  ).toBeGreaterThanOrEqual(48 * 16 - 24)
  expect(
    Math.abs(geo!.leftGap - geo!.rightGap),
    'the day content is centred in the band'
  ).toBeLessThanOrEqual(4)

  // The chip's name stays readable (never clipped).
  const clipped = await page.evaluate(() => {
    const chip = document.querySelector('.q-calendar-agenda__day .q-chip')
    if (!chip) return null
    const nameDiv = [...chip.querySelectorAll('div')].find(
      (d) => d.children.length === 0 && d.textContent.trim().startsWith('name')
    )
    if (!nameDiv) return null
    return nameDiv.scrollWidth > nameDiv.clientWidth + 1
  })
  expect(clipped, 'the day renders a pet chip').not.toBe(null)
  expect(clipped, 'the chip name is not clipped').toBe(false)
})

/**
 * Step 6 — `badges do not overlap the name`: the badge set (food / medicines /
 * vaccinations / pet alerts / #badge) used to float at `top: -10px` over the
 * chip's label — on the seeded stays chips all 3 badges intersect the name's box
 * (probed: 5 of 6 alert chips hit). Red here means badges paint over the name
 * again. Every alert chip must keep its badges and an unclipped name.
 */
test('badges do not overlap the name', async ({ browser }) => {
  const page = await initializePage({ browser })
  await login({ page, email: ADMIN.email, password: ADMIN.password })
  await page.setViewportSize({ width: 1280, height: 900 })

  await page.goto('/employee/agenda/2024-01-01')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  const report = await page.evaluate(() => {
    const hits = (a: DOMRect, b: DOMRect) =>
      !(
        a.right < b.left ||
        a.left > b.right ||
        a.bottom < b.top ||
        a.top > b.bottom
      )
    const out: { overlap: boolean; clipped: boolean }[] = []
    for (const chip of document.querySelectorAll('.q-chip')) {
      const badges = [...chip.querySelectorAll('.q-badge')].filter(
        (b) => !b.className.includes('bg-transparent')
      )
      // A pet with an alert: pink (in heat), yellow (needs rest) or blue
      // (diabetic) — none of those colors is used by any other badge type.
      const hasAlert = badges.some((b) =>
        /bg-(pink|yellow|blue)/.test(b.className)
      )
      if (!hasAlert) continue
      const nameDiv = [...chip.querySelectorAll('div')].find(
        (d) => d.children.length === 0 && /^name/.test(d.textContent.trim())
      )
      if (!nameDiv) continue
      const nr = nameDiv.getBoundingClientRect()
      out.push({
        overlap: badges.some((b) => hits(b.getBoundingClientRect(), nr)),
        clipped: nameDiv.scrollWidth > nameDiv.clientWidth + 1
      })
    }
    return out
  })

  expect(report.length, 'the agenda renders pets with alerts').toBeGreaterThan(
    0
  )
  expect(
    report.filter((r) => r.overlap).length,
    'no alert chip paints badges over its name'
  ).toBe(0)
  expect(
    report.filter((r) => r.clipped).length,
    'no alert chip clips its name'
  ).toBe(0)
})

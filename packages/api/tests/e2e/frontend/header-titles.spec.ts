import { test, expect } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * Header title spot-check: the unit guard in `src/router/titles.test.ts` walks the
 * whole route tree; this one proves the rendered string.
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }

const ROUTES: [route: string, title: string][] = [
  ['/admin/bookings', 'Bookings'],
  ['/information', 'Information'],
  ['/admin/configuration/vacations', 'Vacations']
]

test('header title names the current page, with one h1 per route', async ({
  browser
}) => {
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })

  // The md3 header title is not a `.q-toolbar-title`; assert the text the user reads in the bar.
  const headerTitle = page.locator('.q-header').first()

  for (const [route, expected] of ROUTES) {
    await page.goto(route)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    expect((await headerTitle.innerText()).trim(), route).toBe(expected)

    // Exactly one h1 per visited route (the audit found 0 on 43/43 routes).
    const h1s = page.locator('h1')
    await expect(h1s, `${route} must render exactly one h1`).toHaveCount(1)
    // textContent, not innerText: the h1 is visually hidden (sr-only).
    expect(
      ((await h1s.textContent()) ?? '').trim(),
      `${route} h1 carries the mapped route title`
    ).toBe(expected)

    // Heading order has no jumps (the audit found none today — keep it that way).
    const jumps = await page.evaluate(() => {
      const levels = Array.from(
        document.querySelectorAll('h1,h2,h3,h4,h5,h6')
      ).map((el) => Number(el.tagName[1]))
      const problems: string[] = []
      let prev = 0
      for (const level of levels) {
        if (prev > 0 && level > prev + 1) problems.push(`h${prev} → h${level}`)
        prev = level
      }
      return problems
    })
    expect(jumps, `${route} heading order must not skip levels`).toEqual([])
  }
})

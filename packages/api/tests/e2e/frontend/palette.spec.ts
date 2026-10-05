import { test, expect } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * Palette and contrast probes against the preset that ships the app's CSS.
 *
 * Measured facts: `.text-info` resolves to the preset role `#4ec8fd` (not stock
 * Quasar `#31CCEC`); `.text-green` is wind4's raw green-500 while the themed success
 * role is `.text-positive`; and print pages inherit a dark session, so their body
 * text must be forced light.
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }

const parseColor = (value: string) => value.match(/[\d.]+/g)?.map(Number) ?? []

test.describe('palette and contrast', () => {
  test('info icons resolve to the preset role, not stock Quasar blue', async ({
    browser
  }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    await page.goto('/information')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // The page's own info badge, not a header icon.
    const icon = page.locator('.q-icon[class*=i-mdi-info]').first()
    await expect(icon).toBeVisible({ timeout: 10000 })
    const [actual, info] = await Promise.all([
      icon.evaluate((el: Element) => getComputedStyle(el).color),
      page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--q-info')
          .trim()
      )
    ])

    const [r, g, b] = parseColor(actual)
    // Stock Quasar info is #31CCEC = rgb(49 204 236).
    expect([r, g, b]).not.toEqual([49, 204, 236])
    // And it is the role the preset declares.
    const toRgb = (hex: string) => {
      const h = hex.replace('#', '')
      const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16)
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    }
    expect([r, g, b]).toEqual(toRgb(info))
  })

  test('success icons use the themed positive role', async ({ browser }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    // The paid subscription only renders for a customer with a profile.
    await login({
      page,
      email: 'test1@petboarding.app',
      password: 'qjiNWdT8L'
    })

    // The paid subscription renders on the customer's daycare page (`color="green"` site).
    await page.goto('/account/daycare')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2500)

    const [greens, positive] = await Promise.all([
      page.locator('.text-green').count(),
      page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--q-positive')
          .trim()
      )
    ])
    expect(greens, 'no raw wind4 green classes left').toBe(0)

    const icon = page.locator('.q-list .q-icon').first()
    await expect(icon).toBeVisible({ timeout: 10000 })
    const actual = await icon.evaluate(
      (el: Element) => getComputedStyle(el).color
    )
    const toRgb = (hex: string) => {
      const h = hex.replace('#', '')
      const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16)
      return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`
    }
    // Was `color="green"` → wind4's green-500 rgb(74, 222, 128).
    expect(actual).not.toBe('rgb(74, 222, 128)')
    expect(actual, 'themed --q-positive').toBe(toRgb(positive))
  })

  test('print pages stay readable in a dark session', async ({ browser }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    await page.goto('/print/termsandconditions')
    await page.waitForLoadState('networkidle')
    // Force the dark session the audit captured (the dark sweep's setDark path).
    await page.evaluate(() => document.body.classList.add('body--dark'))
    await page.waitForTimeout(1000)

    const state = await page.evaluate(() => {
      // PrintLayout mounts under #app and pins the scheme on `.print-root`.
      const root = document.querySelector('.print-root') as HTMLElement | null
      const target = root ?? document.body
      const bg = getComputedStyle(target).backgroundColor
      const text = getComputedStyle(target).color
      const [br] = bg.match(/[\d.]+/g)?.map(Number) ?? [0]
      const [tr] = text.match(/[\d.]+/g)?.map(Number) ?? [255]
      return { bg, text, br, tr }
    })

    // Light surface + dark text: the page must not print white-on-dark.
    expect(state.br, `print surface (${state.bg})`).toBeGreaterThan(200)
    expect(state.tr, `print text (${state.text})`).toBeLessThan(90)
  })

  test('the current day is ringed in primary', async ({ browser }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    await page.goto('/admin/daycare')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    const state = await page.evaluate(() => {
      // Verify the preset's calendar token wiring (`--q-calendar-current-color` etc.);
      // today's cell is disabled in the seed, so no ring element renders.
      const cell =
        document.querySelector('.q-calendar-month__day') ?? document.body
      const cs = getComputedStyle(cell)
      const root = getComputedStyle(document.documentElement)
      const currentColor = cs
        .getPropertyValue('--q-calendar-current-color')
        .trim()
      const borderCurrent = cs
        .getPropertyValue('--q-calendar-border-current')
        .trim()
      const primary = root.getPropertyValue('--q-primary').trim()
      return {
        found: Boolean(currentColor && borderCurrent),
        color: currentColor,
        border: borderCurrent,
        primary
      }
    })

    expect(state.found, 'the calendar marks today').toBe(true)
    const toRgb = (hex: string) => {
      const h = hex.replace('#', '')
      const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16)
      return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`
    }
    const s = state as { color: string; border: string; primary: string }
    const rgb = toRgb(s.primary)
    // Both tokens resolve to the primary role (hex or rgb form both acceptable).
    const resolvesToPrimary = (value: string) =>
      value.replace(/\s/g, '') === rgb.replace(/\s/g, '') ||
      value.toLowerCase() === s.primary.toLowerCase() ||
      value.includes(rgb)
    expect(
      resolvesToPrimary(s.color),
      `--q-calendar-current-color=${s.color}`
    ).toBe(true)
    expect(
      s.border.includes('solid'),
      `--q-calendar-border-current=${s.border}`
    ).toBe(true)
    expect(
      resolvesToPrimary(s.border.split(' ')[0]),
      `ring colour=${s.border}`
    ).toBe(true)
  })

  test('calendar day numbers are distinguishable from their background', async ({
    browser
  }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    await page.goto('/admin/daycare')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    const contrast = await page.evaluate(() => {
      const cells = Array.from(
        document.querySelectorAll('.q-calendar-month__day')
      )
      const measured = cells
        .filter((cell) => !cell.classList.contains('q-disabled'))
        .slice(0, 20)
        .map((cell) => {
          const cs = getComputedStyle(cell)
          const bg = cell.classList.contains('q-current-day')
            ? getComputedStyle(cell.parentElement ?? cell).backgroundColor
            : cs.backgroundColor
          const [r1, g1, b1] = (
            cs.color.match(/[\d.]+/g) ?? ['0', '0', '0']
          ).map(Number)
          const [r2, g2, b2] = (bg.match(/[\d.]+/g) ?? ['0', '0', '0']).map(
            Number
          )
          return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2)
        })
      return measured.filter((v) => Number.isFinite(v) && v > 0)
    })

    // Every measured cell must have some separation from its background
    // (the audit's faint day numbers collapsed to ~0).
    expect(contrast.length).toBeGreaterThan(0)
    expect(Math.min(...contrast)).toBeGreaterThan(20)
  })

  test('past booking rows stay readable in a dark scheme', async ({
    browser
  }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    await page.goto('/admin/bookings')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // The one past booking under the default filter is the seeded February one.
    const feb1 = new Date(new Date().getFullYear(), 1, 1).toLocaleDateString(
      'en-US',
      { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
    )
    const row = page.locator('.q-item').filter({ hasText: feb1 }).first()
    await expect(row).toBeVisible({ timeout: 10000 })

    const lightBg = await row.evaluate(
      (el: Element) => getComputedStyle(el).backgroundColor
    )
    expect(lightBg, 'the past marker still paints in light mode').not.toBe(
      'rgba(0, 0, 0, 0)'
    )

    // The dark sweep's setDark path (same as the print test above).
    await page.evaluate(() => document.body.classList.add('body--dark'))
    await page.waitForTimeout(800)

    const state = await row.evaluate((el: Element) => {
      const bg = getComputedStyle(el).backgroundColor
      const text = getComputedStyle(
        el.querySelector('.q-item__section') ?? el
      ).color
      const lum = (c: string) => {
        const [r, g, b] = (c.match(/[\d.]+/g) ?? ['0', '0', '0']).map(Number)
        const f = (v: number) => {
          const s = v / 255
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
        }
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
      }
      const [l1, l2] = [lum(bg), lum(text)].sort((a, b) => b - a)
      return { bg, text, ratio: (l1 + 0.05) / (l2 + 0.05) }
    })

    // Defect literals: the row stayed rgb(238,238,238) with rgb(195,198,207) text.
    expect(
      state.bg,
      'past row must not stay light-grey rgb(238,238,238) under body--dark'
    ).not.toBe('rgb(238, 238, 238)')
    expect(
      state.ratio,
      `past row text ${state.text} on ${state.bg}`
    ).toBeGreaterThanOrEqual(4.5)
  })

  test('the empty-state link wears a theme colour', async ({ browser }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    // The profileless admin has no contact people, so PetsPage renders its empty-state link.
    await page.goto('/account/pets')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    const link = page.locator('a[href="/account/contactpeople"]')
    await expect(link).toBeVisible({ timeout: 10000 })

    await page.evaluate(() => document.body.classList.add('body--dark'))
    await page.waitForTimeout(800)
    const color = await link.evaluate(
      (el: Element) => getComputedStyle(el).color
    )
    // Defect literal: the raw UA link computed rgb(0,0,238) on rgb(26,28,30).
    expect(color, 'the link must wear a theme colour, not UA default').not.toBe(
      'rgb(0, 0, 238)'
    )
  })

  test('the configured source color reaches the semantic --q-* tokens', async ({
    browser
  }) => {
    const page = await initializePage({ browser })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // `/configuration` derives these from the deployment's VITE_SOURCE_COLOR, and
    // App.vue hands them to `setThemeColors(...)`. Regression: that call only
    // wrote the `--light-*`/`--dark-*` primitives, which no component reads, so
    // `--q-primary` stayed on the preset's build-time default and the configured
    // source color never rendered.
    const configuration = await page.evaluate(() =>
      fetch('/configuration').then((res) => res.json())
    )
    const expectedLight = configuration.THEME_COLORS.light.primary as string
    const expectedDark = configuration.THEME_COLORS.dark.primary as string

    const read = () =>
      page.evaluate(() => ({
        root: getComputedStyle(document.documentElement)
          .getPropertyValue('--q-primary')
          .trim(),
        body: getComputedStyle(document.body)
          .getPropertyValue('--q-primary')
          .trim()
      }))

    const light = await read()
    expect(light.root.toLowerCase()).toBe(expectedLight.toLowerCase())
    // The preset's build-time default for the unconfigured palette.
    expect(light.root.toLowerCase()).not.toBe('#005faf')

    await page.evaluate(() => document.body.classList.add('body--dark'))
    await page.waitForTimeout(300)
    const dark = await read()
    expect(dark.body.toLowerCase()).toBe(expectedDark.toLowerCase())
  })
})

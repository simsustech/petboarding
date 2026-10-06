import { test, expect } from '@playwright/test'
import { initializePage } from '../setup'

/**
 * The 404 used to render `fullscreen` with oversized digits and a faded subtitle,
 * overflowing 375px. It now renders in the shell at a clamped size and full contrast.
 */

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812 }
] as const

for (const viewport of VIEWPORTS) {
  test(`404 renders in the shell at ${viewport.name}`, async ({ browser }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height
    })

    await page.goto('/_audit-not-a-route')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    await expect(page.getByText('404', { exact: true })).toBeVisible({
      timeout: 10000
    })

    // In the shell, not fullscreen: the app chrome is present.
    await expect(page.locator('.q-header')).toBeVisible()
    await expect(page.locator('.q-page-container')).toBeVisible()

    // Fits the viewport.
    const overflow = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      inner: window.innerWidth
    }))
    expect(overflow.scroll).toBeLessThanOrEqual(overflow.inner)

    // Readable: the subtitle is no longer 40% opacity.
    const subtitle = page.locator('.text-h2').first()
    const opacity = await subtitle.evaluate(
      (el: Element) => getComputedStyle(el).opacity
    )
    expect(opacity).toBe('1')

    // The CTA uses the primary role rather than a hard-coded blue, as a flat
    // button (see Error404Page.vue for why it is not filled: Quasar's own
    // `.q-btn { background-color: transparent }` is loaded after the preset's
    // utilities and only loses in dark mode).
    const button = page.locator('.q-page .q-btn').first()
    const measured = await button.evaluate((el: Element) => ({
      label: getComputedStyle(el).color,
      primary: getComputedStyle(document.body)
        .getPropertyValue('--q-primary')
        .trim()
    }))
    const toRgb = (hex: string) => {
      const h = hex.trim().replace('#', '')
      const full =
        h.length === 3
          ? h
              .split('')
              .map((c) => c + c)
              .join('')
          : h
      const n = parseInt(full || '000000', 16)
      return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`
    }
    expect(
      toRgb(measured.primary),
      'CTA label must use the primary colour'
    ).toBe(measured.label)
  })
}

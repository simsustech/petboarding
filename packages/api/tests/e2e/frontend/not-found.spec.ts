import { test, expect } from '@playwright/test'
import { initializePage } from '../setup'

/**
 * The 404 page rendered `fullscreen` (own layout, no header/footer) with `30vh`
 * digits and a 40% opacity subtitle, which overflowed 375px and was near-invisible
 * (observed in `frontend-audit/mobile/error404.png` + `desktop/error404.png`).
 * It now renders in the shell, at a clamped size, full contrast, with the primary
 * CTA — and the dead `<scirpt>` block is gone.
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

    // The CTA uses the primary role rather than a hard-coded blue.
    const button = page.locator('.q-page .q-btn').first()
    const [bg, primary] = await Promise.all([
      button.evaluate((el: Element) => getComputedStyle(el).color),
      page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue(
          '--q-primary'
        )
      )
    ])
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
    expect(toRgb(primary), 'CTA label must use the primary colour').toBe(bg)
  })
}

import { test, expect } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * `/availability` opens with an empty range, so Quasar's q-date header would render
 * two em-dashes; the card shows a hint instead and drops back to real dates once a
 * range is chosen.
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }

test.describe('availability range header', () => {
  test('explains an empty range instead of showing two dashes', async ({
    browser
  }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    await page.goto('/availability')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const header = page.locator('.q-date__header').first()
    await expect(header).toBeVisible({ timeout: 10000 })

    // The dashes are hidden in CSS and the hint is `::after` content, so assert computed style.
    const state = await page.evaluate(() => {
      const visibleDash = (selector: string) => {
        const el = document.querySelector(selector)
        if (!el) return false
        const shown = getComputedStyle(el).display !== 'none'
        return shown && (el.textContent ?? '').includes('—')
      }
      const h = document.querySelector('.q-date__header')
      return {
        dashShown:
          visibleDash('.q-date__header-title-label') ||
          visibleDash('.q-date__header-subtitle'),
        after: h ? getComputedStyle(h, '::after').content : 'none',
        emptyClass: Boolean(document.querySelector('.range-empty'))
      }
    })

    expect(state.emptyClass, 'the card marks an empty range').toBe(true)
    expect(state.dashShown, 'no em-dash placeholder is rendered').toBe(false)
    expect(state.after).toContain('Select arrival and departure')
  })

  // Fixme: every day in the seeded window is disabled, so the populated CSS branch is
  // unreachable without a seed with an open availability window.
  test.fixme('shows the real dates once a range is selected', async ({
    browser
  }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    await page.goto('/availability')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Pick any two selectable days in the rendered month grid.
    const days = page.locator('.q-date__day:not(.q-date__day--disabled)')
    const first = days.first()
    await expect(first).toBeVisible({ timeout: 10000 })
    await first.click()
    await page.waitForTimeout(300)
    const second = days.nth(3)
    if (await second.isVisible()) await second.click()
    await page.waitForTimeout(500)

    // The hint only exists while the range is empty.
    await expect(page.getByText('Select arrival and departure')).toHaveCount(0)
  })
})

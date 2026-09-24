import { test, expect } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * `/availability` opens with an empty range `{from:'', to:''}`, so Quasar's q-date
 * header renders two em-dashes where the selected range should be (observed in
 * `frontend-audit/desktop/availability.png`, and probed live: `.q-date__header-title-label`
 * and `.q-date__header-subtitle` both contain `—`). The card now says what is
 * expected instead, and drops back to real dates once a range is chosen.
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

    // CSS hides the two placeholder labels and prints the hint as ::after content,
    // so both assertions have to read computed style — the dashes are still in
    // textContent (hidden), and pseudo-element text is invisible to getByText.
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

  // Measured 2026-09-24: every `.q-date__day` in the seeded window carries
  // `q-date__day--disabled`, so the populated branch of the CSS cannot be reached
  // without changing the seed (periods/bookings block the calendar). Left as an
  // explicit fixme rather than a passing-but-empty assertion; needs a seed with an
  // open availability window to run.
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

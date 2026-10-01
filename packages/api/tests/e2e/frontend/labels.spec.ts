import { test, expect } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * Stock labels (62×100 mm boxes, `VITE_LABEL_WIDTH/HEIGHT`, minus 4mm padding) fit
 * their box and read correctly: the full name is not truncated in code, a "no
 * medicines" status is captioned rather than a bare red ✕, and empty rows are gone.
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }

/** 62×100mm at 96dpi is 234.5×378px; the component renders width-4mm/high-4mm. */
const BOX = { maxWidth: 62 * (96 / 25.4) + 2, maxHeight: 100 * (96 / 25.4) + 2 }

test.describe('stock labels fit their box and read correctly', () => {
  test('pet label shows the full name, a captioned medicines status and no empty row', async ({
    browser
  }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    await page.goto('/employee/labels/pets/2')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    const label = page.locator('.label').first()
    await expect(label).toBeVisible({ timeout: 10000 })

    // Full name — the hard-coded `truncate(..., 12)` used to cut it in code.
    await expect(label).toContainText('name2 lastName2')
    // No bare red ✕ for "no medicines"; the status is carried by text.
    await expect(label.locator('.i-mdi-close')).toHaveCount(0)
    // Seeded pet 2 has no particularities: no dangling empty row.
    await expect(
      label.locator('.q-field__label', { hasText: 'Particularities' })
    ).toHaveCount(0)
  })

  test('printed pet label stays inside the 62x100mm box', async ({
    browser
  }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    await page.goto('/print/pets/2')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    const label = page.locator('.label').first()
    await expect(label).toBeVisible({ timeout: 10000 })
    const box = await label.boundingBox()
    expect(box, 'label box should render').toBeTruthy()
    expect(box!.width).toBeLessThanOrEqual(BOX.maxWidth)
    expect(box!.height).toBeLessThanOrEqual(BOX.maxHeight)

    // Content fits the box rather than spilling out of it.
    const overflow = await label.evaluate((el) => ({
      vertical: el.scrollHeight - el.clientHeight,
      horizontal: el.scrollWidth - el.clientWidth
    }))
    expect(overflow.vertical).toBeLessThanOrEqual(2)
    expect(overflow.horizontal).toBeLessThanOrEqual(2)
  })

  test('booking label hides the empty Services row', async ({ browser }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    await page.goto('/print/bookings/1')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    const label = page.locator('.label').first()
    await expect(label).toBeVisible({ timeout: 10000 })
    // Booking 1 is seeded without services: the row (and its lone `-`) is gone.
    await expect(
      label.locator('.q-field__label', { hasText: 'Services' })
    ).toHaveCount(0)
    const box = await label.boundingBox()
    expect(box!.width).toBeLessThanOrEqual(BOX.maxWidth)
    expect(box!.height).toBeLessThanOrEqual(BOX.maxHeight)
  })
})

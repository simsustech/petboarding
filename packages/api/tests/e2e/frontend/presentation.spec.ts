import { test, expect } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * Presentation strings & hygiene: config lists without a section header, the account
 * customer card's missing identity line, `1 Months` grammar, and raw `->` in the
 * customer detail booking range.
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }
const CUSTOMER = { email: 'test1@petboarding.app', password: 'qjiNWdT8L' }

const LISTS = [
  ['/admin/configuration/categories', 'Categories'],
  ['/admin/configuration/openingtimes', 'Opening times'],
  ['/admin/configuration/services', 'Services'],
  ['/admin/configuration/documents', 'Documents']
] as const

test('config lists open with a section header', async ({ browser }) => {
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })

  for (const [route, title] of LISTS) {
    await page.goto(route)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const header = page
      .locator('.q-list .q-item-label, .q-list .q-item__label')
      .filter({ hasText: new RegExp(`^${title}$`) })
      .first()
    await expect(
      header,
      `${route} must open with a "${title}" section header`
    ).toBeVisible({ timeout: 10000 })
  }
})

test('account customer card identifies the customer', async ({ browser }) => {
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: CUSTOMER.email, password: CUSTOMER.password })

  await page.goto('/account/customer')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2500)

  // Seeded customer 1 (account 1): firstName1 / lastName1.
  const card = page.locator('.q-card, .q-page').first()
  const text = (await card.innerText()).replace(/\s+/g, ' ')
  expect(
    text,
    `customer card must name the customer: ${text.slice(0, 120)}`
  ).toContain('firstName1')
})

test('daycare subscription validity is grammatical', async ({ browser }) => {
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })

  await page.goto('/admin/configuration/daycaresubscriptions')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2500)

  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ')
  expect(body, 'no "1 Months"').not.toContain('1 Months')
  expect(body, 'singular "1 month"').toMatch(/\b1 month\b/i)
})

test('customer detail renders a typographic range, no raw arrows', async ({
  browser
}) => {
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })

  await page.goto('/employee/customers/1')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(3000)

  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ')
  expect(body, 'no raw "->" arrows').not.toContain('->')
  expect(body, 'em/en dash present instead').toMatch(/\d{4} [–-] /)
})

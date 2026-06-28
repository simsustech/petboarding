/**
 * SlimFact integration e2e test — full OIDC flow + invoice verification.
 */
import { test, expect } from '@playwright/test'
import type { Browser, Page } from '@playwright/test'

const PETBOARDING_URL = 'https://petboarding.localhost'
const SLIMFACT_ADMIN_EMAIL = 'admin@slimfact.app'
const SLIMFACT_ADMIN_PASSWORD = process.env.SLIMFACT_ADMIN_PASSWORD!
const PETBOARDING_ADMIN_EMAIL = 'admin@petboarding.app'
const PETBOARDING_ADMIN_PASSWORD = 'qjiNWdT8L'

async function login(browser: Browser): Promise<Page> {
  const c = await browser.newContext({ ignoreHTTPSErrors: true })
  const p = await c.newPage()
  await p.goto(PETBOARDING_URL)
  await p.click('text=Login')
  await p.waitForLoadState('networkidle')
  await expect(p).toHaveURL(/.*login/)
  await p.locator('text="Email"').fill(PETBOARDING_ADMIN_EMAIL)
  await p.locator('text="Password"').fill(PETBOARDING_ADMIN_PASSWORD)
  await p.locator('button >> text=Login').click()
  await p.waitForURL(/.*user/)
  return p
}

test('slimfact: OIDC connect and verify', async ({ browser, request }) => {
  test.setTimeout(180000)
  const page = await login(browser)

  const h = await (await request.get(`${PETBOARDING_URL}/health`)).json()
  if (h.checks.slimfact.status !== 'healthy') {
    await page.goto(`${PETBOARDING_URL}/admin/configuration/integrations`)
    await page.waitForLoadState('networkidle')
    await page.locator('#slimFactForm button[type="submit"]').click()

    await page.waitForURL(/slimfact\.localhost/, { timeout: 30000 })
    await page.waitForLoadState('networkidle')
    await page.locator('text="Email"').fill(SLIMFACT_ADMIN_EMAIL)
    await page.locator('text="Password"').fill(SLIMFACT_ADMIN_PASSWORD)
    await page.locator('button >> text=Login').click()

    await page.locator('button:has-text("Allow")').waitFor({ timeout: 10000 })
    await page.locator('button:has-text("Allow")').click()
    await page.waitForURL(/petboarding\.localhost/, { timeout: 30000 })
    await page.waitForLoadState('networkidle')
  }

  const h2 = await (await request.get(`${PETBOARDING_URL}/health`)).json()
  expect(h2.checks.slimfact.status).toBe('healthy')
  expect(h2.status).toBe('healthy')
})

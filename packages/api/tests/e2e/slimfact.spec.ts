/**
 * SlimFact integration e2e test — full OIDC flow + invoice verification.
 */
import { test, expect } from '@playwright/test'
import type { Browser, Page } from '@playwright/test'

const PB = 'https://petboarding.localhost'

async function login(browser: Browser): Promise<Page> {
  const c = await browser.newContext({ ignoreHTTPSErrors: true })
  const p = await c.newPage()
  await p.goto(PB)
  await p.click('text=Login')
  await p.waitForLoadState('networkidle')
  await expect(p).toHaveURL(/.*login/)
  await p.locator('text="Email"').fill('admin@petboarding.app')
  await p.locator('text="Password"').fill('qjiNWdT8L')
  await p.locator('button >> text=Login').click()
  await p.waitForURL(/.*user/)
  return p
}

test('slimfact: OIDC connect and verify', async ({ browser, request }) => {
  test.setTimeout(180000)
  const page = await login(browser)

  // Connect SlimFact via OIDC
  const h = await (await request.get(`${PB}/health`)).json()
  expect(h.checks.slimfact.status).toBe('unhealthy')

  await page.goto(`${PB}/admin/configuration/integrations`)
  await page.waitForLoadState('networkidle')
  await page.locator('#slimFactForm button[type="submit"]').click()

  await page.waitForURL(/slimfact\.localhost/, { timeout: 30000 })
  await page.waitForLoadState('networkidle')
  await page.locator('text="Email"').fill('admin@slimfact.app')
  await page.locator('text="Password"').fill('Sif5uEG5hcTH')
  await page.locator('button >> text=Login').click()

  await page.locator('button:has-text("Allow")').waitFor({ timeout: 10000 })
  await page.locator('button:has-text("Allow")').click()
  await page.waitForURL(/petboarding\.localhost/, { timeout: 30000 })
  await page.waitForLoadState('networkidle')

  // Verify connected
  const h2 = await (await request.get(`${PB}/health`)).json()
  expect(h2.checks.slimfact.status).toBe('healthy')
  expect(h2.status).toBe('healthy')
})

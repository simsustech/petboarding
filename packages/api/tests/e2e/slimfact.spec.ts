/**
 * SlimFact integration e2e test — full OIDC flow + invoice verification.
 */
import { test, expect } from '@playwright/test'
import type { Browser, Page } from '@playwright/test'

// SlimFact not available in CI
test.skip(!!process.env.CI, 'Requires SlimFact service')

// Allow the NetBird-reachable host to be used when the ingress is the only
// route to the stack (the E2E base URL overrides the .localhost default).
const PETBOARDING_URL =
  process.env.PETBOARDING_E2E_BASE_URL ?? 'https://petboarding.localhost'
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
    // The authorize endpoint redirects to /interaction/login — wait for
    // the actual login form before filling credentials.
    await page
      .locator('text="Email"')
      .waitFor({ state: 'visible', timeout: 30000 })
    await page.locator('text="Email"').fill(SLIMFACT_ADMIN_EMAIL)
    await page.locator('text="Password"').fill(SLIMFACT_ADMIN_PASSWORD)
    await page.locator('button >> text=Login').click()

    // After login the consent page may auto-approve (no Allow button) or
    // show an explicit Allow/Grant button.
    const allowOrGrant = page
      .locator('button:has-text("Allow")')
      .or(page.locator('button:has-text("Grant")'))
    await allowOrGrant
      .first()
      .waitFor({ timeout: 15000 })
      .catch(() => {})
    if (
      await allowOrGrant
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await allowOrGrant.first().click()
    }
    await page.waitForURL(/petboarding\.localhost/, { timeout: 30000 })
    await page.waitForLoadState('networkidle')
  }

  const h2 = await (await request.get(`${PETBOARDING_URL}/health`)).json()
  expect(h2.checks.slimfact.status).toBe('healthy')
  expect(h2.status).toBe('healthy')
})

test.describe('Booking approve/reject (SlimFact connected)', async () => {
  test('Approve a pending booking with SlimFact invoice', async ({
    browser
  }) => {
    test.setTimeout(120000)
    const page = await login(browser)

    await page.goto(`${PETBOARDING_URL}/admin/bookings`)
    await page.waitForLoadState('networkidle')
    // `networkidle` can settle before the bookings tRPC list resolves, so wait
    // for the list itself before asserting on rows.
    await expect(page.locator('.q-expansion-item').first()).toBeVisible({
      timeout: 30000
    })
    await page.waitForTimeout(1000)

    // Booking #6 (PENDING, pet "name5", CURRENT_YEAR dates).
    // Select by the approval button itself rather than `.filter({hasText}).first()`:
    // each booking renders nested `.q-expansion-item` children (History, Costs),
    // so a text filter matches several nodes and `.first()` is ambiguous.
    const approvalButton = page
      .locator('.q-expansion-item')
      .filter({ hasText: 'name5' })
      .locator('[data-testid="booking-approval-button"]')
      .first()
    await expect(approvalButton).toBeVisible({ timeout: 15000 })
    await approvalButton.click()
    await page.getByText('Approve booking').click()

    const dialog = page.locator('.q-dialog').last()
    await expect(dialog).toBeVisible({ timeout: 10000 })
    await dialog.locator('button').filter({ hasText: 'Send' }).click()
    await expect(dialog).not.toBeVisible({ timeout: 15000 })

    // Navigate to the employee booking detail page to verify the SlimFact invoice
    await page.goto(`${PETBOARDING_URL}/employee/bookings/6`)
    await page.waitForLoadState('networkidle')

    // The InvoiceButton component renders with aria-label "Open bill or invoice."
    // It only appears when invoiceUuid is set, confirming SlimFact created the invoice.
    const invoiceLink = page.getByTestId('invoice-button')
    await expect(invoiceLink).toBeVisible({ timeout: 10000 })
  })

  test('Reject a pending booking with SlimFact connected', async ({
    browser
  }) => {
    test.setTimeout(120000)
    const page = await login(browser)

    await page.goto(`${PETBOARDING_URL}/admin/bookings`)
    await page.waitForLoadState('networkidle')

    // Booking #8 (PENDING, pet "name2", CURRENT_YEAR dates)
    const bookingItem = page
      .locator('.q-expansion-item')
      .filter({
        hasText: 'name2'
      })
      .first()
    await expect(bookingItem).toBeVisible({ timeout: 5000 })

    const approvalButton = bookingItem.locator(
      '[data-testid="booking-approval-button"]'
    )
    await expect(approvalButton).toBeVisible({ timeout: 5000 })
    await approvalButton.click()
    await page.getByText('Reject booking').click()

    const dialog = page.locator('.q-dialog').last()
    await expect(dialog).toBeVisible({ timeout: 10000 })
    await dialog.locator('button').filter({ hasText: 'Send' }).click()
    await expect(dialog).not.toBeVisible({ timeout: 15000 })
  })
})

test.describe('Daycare subscription double-submit race', () => {
  // Regression test for the 2026-09-11 incident: two concurrent
  // createCustomerDaycareSubscription calls created two SlimFact bills and
  // orphaned the paid one. Requires a fresh-enough DB (seed:test) plus a
  // working Mollie test key in SlimFact (addPaymentToInvoice must succeed).
  // Run with: PLAYWRIGHT_SLIMFACT=1 pnpm run test:e2e tests/e2e/slimfact.spec.ts
  // Against remapped ports set PETBOARDING_E2E_BASE_URL=https://petboarding.localhost:8443
  test('concurrent purchases link a single bill', async ({
    browser,
    request
  }) => {
    test.skip(!!process.env.CI, 'Requires SlimFact service')
    test.setTimeout(180000)
    const BASE = process.env.PETBOARDING_E2E_BASE_URL ?? PETBOARDING_URL
    const c = await browser.newContext({ ignoreHTTPSErrors: true })
    const p = await c.newPage()
    // test1@petboarding.app (account 1) has both admin role AND a customer
    // record — required by createCustomerDaycareSubscription.
    await p.goto(BASE)
    await p.click('text=Login')
    await p.waitForLoadState('networkidle')
    await expect(p).toHaveURL(/.*login/)
    await p.locator('text="Email"').fill('test1@petboarding.app')
    await p.locator('text="Password"').fill('qjiNWdT8L')
    await p.locator('button >> text=Login').click()
    await p.waitForURL(/.*user/, { timeout: 60000 })

    // Capture the Bearer token from the app's own authenticated tRPC
    // traffic — guaranteed to be the token the API accepts.
    const tokenPromise = p.waitForRequest(
      (req) => req.url().includes('/trpc/') && !!req.headers()['authorization'],
      { timeout: 60000 }
    )
    await p.goto(`${BASE}/account/daycare`)
    await p.waitForLoadState('networkidle')
    const authedRequest = await tokenPromise
    const token = (authedRequest.headers()['authorization'] as string).replace(
      'Bearer ',
      ''
    )
    expect(token).toBeTruthy()
    const authHeaders = { Authorization: `Bearer ${token}` }
    const trpc = async (path: string, input: unknown) => {
      const res = await request.post(`${BASE}/trpc/${path}?batch=1`, {
        headers: authHeaders,
        data: { '0': input }
      })
      const body = await res.text()
      // Surface the server-side error body so a 4xx/5xx is diagnosable
      // instead of just "expect(received).toBeTruthy()".
      expect(res.ok(), `tRPC ${path} -> ${res.status()}: ${body}`).toBeTruthy()
      return JSON.parse(body)[0]
    }

    // Pick an effectiveDate that cannot collide with an existing OPEN
    // subscription so reruns on a seeded DB stay valid.
    const listRes = await request.get(
      `${BASE}/trpc/user.getCustomerDaycareSubscriptions?batch=1&input=${encodeURIComponent(
        JSON.stringify({ '0': { json: null } })
      )}`,
      { headers: authHeaders }
    )
    // tRPC v11 returns the superjson envelope for GET queries
    // (`result.data.json`) but unwrapped JSON for batch POST bodies.
    // Normalise both so this helper stays correct either way.
    const unwrap = (entry: any) =>
      entry?.result?.data?.json ?? entry?.result?.data
    const existing: Array<{ expirationDate: string }> =
      unwrap((await listRes.json())[0]) ?? []
    const today = new Date().toISOString().slice(0, 10)
    const maxExpiration = existing
      .map((s) => s.expirationDate)
      .sort()
      .at(-1)
    const effectiveDate =
      maxExpiration && maxExpiration >= today
        ? new Date(new Date(`${maxExpiration}T00:00:00Z`).getTime() + 86400000)
            .toISOString()
            .slice(0, 10)
        : today
    const input = { daycareSubscriptionId: 1, effectiveDate }

    const [first, second] = await Promise.all([
      trpc('user.createCustomerDaycareSubscription', input),
      trpc('user.createCustomerDaycareSubscription', input)
    ])
    expect(unwrap(first)).toBeDefined()
    expect(unwrap(second)).toBeDefined()
    const firstData = unwrap(first)
    const secondData = unwrap(second)
    const firstSub = firstData.customerDaycareSubscription
    const secondSub = secondData.customerDaycareSubscription
    // Both racers must end up on the same row linked to the same bill:
    // pre-fix they carried two different invoiceUuids (last-write-wins).
    expect(secondSub.id).toBe(firstSub.id)
    expect(firstSub.invoiceUuid).toBeTruthy()
    expect(secondSub.invoiceUuid).toBe(firstSub.invoiceUuid)
    // A repeated purchase must resume the pending checkout instead of
    // minting a duplicate payment (pending plan decision 2026-09-11).
    expect(secondData.checkoutUrl).toBe(firstData.checkoutUrl)
    await c.close()
  })

  test('webhook with unknown bill uuid still answers 200', async ({
    request
  }) => {
    test.skip(!!process.env.CI, 'Requires SlimFact service')
    const BASE = process.env.PETBOARDING_E2E_BASE_URL ?? PETBOARDING_URL
    const res = await request.post(`${BASE}/webhook/slimfact`, {
      data: { uuid: '00000000-0000-0000-0000-000000000000' }
    })
    // The orphan-bill log.error (setup.ts) must never break the webhook reply.
    expect(res.status()).toBe(200)
  })
})

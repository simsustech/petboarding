import { test, expect } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * The seeded documents are what the print routes render. Two defects, both visible
 * in the audit captures:
 *
 *   - `/print/termsandconditions` showed the heading and nothing else, because the
 *     seed's `content` was the literal string `# Terms and conditions`
 *     (`seeds/test.ts:348`) — the renderer was fine, the content was empty.
 *   - `/print/privacypolicy` put the product name in the H1 and the document title in
 *     a body line, so the page's heading read "Petboarding".
 *
 * Provenance: `test-results/frontend-audit/desktop/print-termsandconditions.png`.
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }

test.describe('seeded documents render as documents', () => {
  test('terms and conditions has a body, privacy policy is headed correctly', async ({
    browser
  }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    await page.goto('/print/termsandconditions')
    await page.waitForLoadState('networkidle')
    const terms = page.locator('body')
    // The heading alone is not a document: assert clauses the seed must carry.
    await expect(terms).toContainText('Terms and conditions')
    await expect(terms).toContainText('1. Bookings')
    await expect(terms).toContainText('2. Payment')
    await expect(terms).toContainText('3. Cancellation')
    // The Dutch section ships with the English one for this document.
    await expect(terms).toContainText('Algemene voorwaarden')

    await page.goto('/print/privacypolicy')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1').first()).toHaveText('Privacy policy')
    await expect(page.locator('body')).toContainText(
      'Petboarding collects the following information'
    )
  })
})

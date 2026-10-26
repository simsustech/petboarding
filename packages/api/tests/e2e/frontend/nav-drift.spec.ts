import { test, expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * Nav drift: the drawer's Vacations item pointed at `/admin/vacations`, which no
 * route defines. The item sits inside two collapsed groups, so the test opens them
 * like a user and asserts the href before clicking through.
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }

/** Open a QExpansionItem by its header unless it already reports expanded. */
async function expandGroup(page: Page, group: Locator) {
  const header = group.locator('.q-item').first()
  if ((await header.getAttribute('aria-expanded')) === 'true') return
  await header.click()
  await page.waitForTimeout(500)
}

test('drawer Vacations item links to the route that exists', async ({
  browser
}) => {
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })

  const drawer = page.locator('.q-drawer')
  // The desktop rail starts mini; the toggle expands it into the nav list.
  if (!(await drawer.locator('.q-expansion-item').count())) {
    await page.getByLabel('Menu').first().click()
    await page.waitForTimeout(600)
  }

  await expandGroup(
    page,
    drawer
      .locator('.q-expansion-item')
      .filter({ hasText: 'Administrator' })
      .first()
  )
  await expandGroup(
    page,
    drawer
      .locator('.q-expansion-item')
      .filter({ hasText: 'Configuration' })
      .first()
  )

  const vacationsItem = drawer.locator('a.q-item', { hasText: 'Vacations' })
  // The nav markup is rendered into more than one drawer template, so only the
  // href is asserted on the DOM; the click goes through the item's own handler.
  await expect(vacationsItem.first()).toHaveAttribute(
    'href',
    '/admin/configuration/vacations'
  )

  await vacationsItem.first().dispatchEvent('click')
  await expect(page).toHaveURL(/\/admin\/configuration\/vacations$/)
  // The 404 page is the failure mode this guards against.
  await expect(page.locator('.q-page')).not.toContainText('404')
})

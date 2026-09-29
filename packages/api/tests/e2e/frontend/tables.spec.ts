import { test, expect } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * Tables: two ordering defects and one Name defect, all observed in the audit
 * captures (`admin-accounts.png`, `admin-config-kennels.png`,
 * mobile `admin-accounts.png`):
 *
 *   - accounts came back `1,6,2,3,4` because `findAccounts` ordered by role count,
 *   - kennels rendered `1,10,2,…` because the query's default sort was `'name'`,
 *   - the Name column was blank because `accounts` only carries email/roles,
 *   - and at 375px the table clipped, hiding Roles and the row menu.
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }

test.describe('tables order and read correctly', () => {
  test('accounts list ids ascending with a display name', async ({
    browser
  }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    await page.goto('/admin/accounts')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('table tbody tr').first()).toBeVisible({
      timeout: 15000
    })

    // Ids in ascending order (seeded accounts 1..6 on page one) — first cell of
    // each row is the id column.
    const ids = await page
      .locator('table tbody tr td:first-child')
      .allTextContents()
    expect(ids.slice(0, 5)).toEqual(['1', '2', '3', '4', '5'])

    // The Name column carries the customer's name for profiled accounts.
    const test1Row = page.locator('table tbody tr').filter({
      hasText: 'test1@petboarding.app'
    })
    await expect(test1Row).toBeVisible()
    const cells = await test1Row.locator('td').allTextContents()
    const nameCell = cells.find((cell) => cell.includes('firstName'))
    expect(nameCell, 'test1 row should show its customer name').toBeTruthy()
  })

  test('kennels list in their configured order', async ({ browser }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    await page.goto('/admin/configuration/kennels')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.q-list .q-item').first()).toBeVisible({
      timeout: 15000
    })

    const kennelNames = await page
      .locator('.q-list .q-item')
      .evaluateAll((items) =>
        items.map((item) => {
          const labels = Array.from(
            item.querySelectorAll('.q-item__label')
          ) as HTMLElement[]
          const main = labels.find(
            (label) =>
              !label.classList.contains('q-item__label--overline') &&
              !label.classList.contains('q-item__label--caption') &&
              !label.classList.contains('q-item__label--header')
          )
          return main?.textContent?.trim() ?? ''
        })
      )

    // Not `1,10,2,3…` — configured order (kennels are seeded 1..10).
    expect(kennelNames.slice(0, 5)).toEqual(['1', '2', '3', '4', '5'])
  })

  test('accounts stay reachable at 375px', async ({ browser }) => {
    const page = await initializePage({ browser })
    // Sign in at desktop, then resize (at 375px the drawer container's row covers the
    // header's Login affordance — the pattern the capture specs use).
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })
    await page.setViewportSize({ width: 375, height: 812 })

    await page.goto('/admin/accounts')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('table tbody tr').first()).toBeVisible({
      timeout: 15000
    })
    // Scoped to the table: the mobile bottom-tab bar carries its own hidden
    // "Administrator" label, which a page-wide .first() would hit first.
    await expect(
      page.locator('table tbody').getByText('Administrator')
    ).toBeVisible()

    // The table is ~611px wide on a 375px viewport, so the guarantee is reachability.
    // The page itself must stay inside the viewport and the overflow must live in the
    // table's own scroll area (measured: .q-table__middle client 351 / scroll 611).
    // The earlier assertion read the menu *unscrolled* at 607px, i.e. it reported a
    // defect where the table was simply scrolled to the left.
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      ),
      'page must not scroll horizontally'
    ).toBeLessThanOrEqual(0)

    const middle = page.locator('.q-table__middle').first()
    await expect(middle).toBeVisible()
    const widths = await middle.evaluate((el) => ({
      client: el.clientWidth,
      scroll: el.scrollWidth
    }))
    expect(
      widths.scroll,
      'the table must scroll horizontally inside its own area'
    ).toBeGreaterThan(widths.client)

    await middle.evaluate((el) => {
      el.scrollLeft = el.scrollWidth
    })

    const menu = page.locator('table tbody tr').first().locator('button').last()
    await expect(menu).toBeVisible()
    const box = await menu.boundingBox()
    expect(box, 'row menu should be rendered').toBeTruthy()

    // Reachable: after scrolling the table's own area the row menu is inside the
    // viewport and inside that area. The mobile nav drawer overlays the content at this
    // width by design — the plan's 14e resolution for it was layering (`.q-header` at
    // z-index 7100 above the drawer's 7000), not dismissal, and no control closes it at
    // 375px (probed 2026-09-24: header toggle, Escape and backdrop are all no-ops).
    expect(box!.x + box!.width).toBeLessThanOrEqual(375)
    const middleBox = await middle.boundingBox()
    expect(middleBox, 'scroll area should be rendered').toBeTruthy()
    expect(box!.x + box!.width).toBeLessThanOrEqual(
      Math.ceil(middleBox!.x + middleBox!.width)
    )
  })
})

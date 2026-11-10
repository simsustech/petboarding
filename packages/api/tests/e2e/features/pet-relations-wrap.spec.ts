import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { initializeAndLogin } from '../setup'

const email = 'admin@petboarding.app'
const password = 'qjiNWdT8L'

let page: Page

// The rating-grouped name list in PetCard's relations dialog is a
// `q-item__label`, and the app's unocss preset gives that class
// `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`
// (dist/ssr/client/assets/unocss-*.css). On a phone that turned a group of
// related pets into "name4, nam…", i.e. a hidden pet in the one dialog whose
// job is to show them. The label now carries the same
// `whitespace-normal overflow-visible` pair as the alert-window label, and this
// spec pins the computed style at a 390px viewport.
//
// Fixture note: seeds/test.ts gives every rating group at most ONE name
// (petRelations: (3,4) r3, (1,5) r8, (3,5) r1, (1,4) r10), so no group is long
// enough to actually overflow at 390px and a rendered-wrap assertion cannot be
// made without restructuring the seed. What is asserted is the property that
// makes wrapping possible instead of the wrapped result.
test.describe('Pet relations dialog keeps every related pet name readable', () => {
  test.beforeAll(async ({ browser }) => {
    page = await initializeAndLogin({ browser, email, password })

    await expect(
      page
        .getByRole('tab', { name: 'Employee' })
        .or(page.getByText('Employee').locator(':scope.q-item__label'))
    ).toBeVisible({ timeout: 15000 })
  })

  test('the rating-grouped names label wraps instead of ellipsizing at 390px', async () => {
    // Pet 1 (name1) is the richest fixture subject: relations with pet 4 (r10)
    // and pet 5 (r8), i.e. two rating groups. Pet 2 is deliberately avoided —
    // deceased-pet-relations.spec.ts pins its relations select.
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/employee/pets/1')
    await page.waitForLoadState('networkidle')

    const relationsItem = page.locator('.q-item', {
      hasText: 'Relations with other pets'
    })
    await relationsItem.waitFor({ state: 'attached', timeout: 15000 })

    await relationsItem.locator('button').first().click({ force: true })
    const relationsDialog = page.locator('.q-dialog').last()
    await expect(relationsDialog).toBeVisible({ timeout: 10000 })

    const namesLabels = relationsDialog.locator(
      '[data-testid="pet-relations-names"]'
    )
    if ((await namesLabels.count()) === 0) {
      // Same seed-dependent guard convention as kennelLayout.spec.ts:111-114.
      test.skip(true, 'pet 1 has no rated relations — fixture regression')
      return
    }

    // The two seeded groups are both rendered (r10 → name4, r8 → name5).
    await expect(namesLabels.filter({ hasText: 'name4' })).toHaveCount(1)
    await expect(namesLabels.filter({ hasText: 'name5' })).toHaveCount(1)

    const measured = await namesLabels.evaluateAll((labels) =>
      labels.map((label) => {
        const style = getComputedStyle(label)
        return {
          text: label.textContent ?? '',
          whiteSpace: style.whiteSpace,
          overflowX: style.overflowX,
          scrollWidth: label.scrollWidth,
          clientWidth: label.clientWidth
        }
      })
    )

    for (const label of measured) {
      // The property that lets a long group wrap — and the one the preset broke.
      expect(
        label.whiteSpace,
        `"${label.text}" must wrap, not stay on one line`
      ).toBe('normal')
      // `text-overflow: ellipsis` stays declared on the class but is inert once
      // overflow is visible — asserting on the property would pin the cascade
      // rather than the clipping.
      expect(
        label.overflowX,
        `"${label.text}" must not be clipped horizontally`
      ).not.toBe('hidden')
      // Today's single-name groups fit; this keeps the assertion honest about
      // what it can prove: the label is not already clipping its own text.
      expect(
        label.scrollWidth,
        `"${label.text}" is clipped: scrollWidth ${label.scrollWidth} > clientWidth ${label.clientWidth}`
      ).toBeLessThanOrEqual(label.clientWidth + 1)
    }

    // The dialog slides in with a scaled transform, and getBoundingClientRect is
    // measured through it: a mid-animation label reads ~5px tall and would make
    // any height comparison meaningless. Wait for the panel to settle, then use
    // layout metrics (scrollHeight) rather than rects.
    await expect(relationsDialog.locator('.q-dialog__inner')).toHaveCSS(
      'transform',
      'none'
    )

    // The seeded groups each hold one name, so lengthening the label in the DOM
    // is what proves the mobile symptom is gone: a long group must grow taller
    // (wrap) instead of scrolling sideways (clip). Before the fix this measured
    // one line of height and scrollWidth > clientWidth.
    const wrapping = await namesLabels.first().evaluate((label) => {
      const lineHeight =
        parseFloat(getComputedStyle(label).lineHeight) ||
        parseFloat(getComputedStyle(label).fontSize) * 1.2
      const heightBefore = label.scrollHeight
      label.textContent =
        'Penn van der Berg, Smokey, name1, Lisa de Vries, Rex, Bella, Charlie, Maximus'
      return {
        lineHeight,
        heightBefore,
        heightAfter: label.scrollHeight,
        scrollWidth: label.scrollWidth,
        clientWidth: label.clientWidth
      }
    })
    expect(
      wrapping.heightAfter,
      `a long name group must wrap: ${wrapping.heightAfter}px is not more than ${wrapping.heightBefore}px`
    ).toBeGreaterThan(wrapping.heightBefore)
    expect(wrapping.heightAfter).toBeGreaterThanOrEqual(
      wrapping.lineHeight * 1.5
    )
    expect(
      wrapping.scrollWidth,
      `the wrapped group still clips: scrollWidth ${wrapping.scrollWidth} > clientWidth ${wrapping.clientWidth}`
    ).toBeLessThanOrEqual(wrapping.clientWidth + 1)
  })
})

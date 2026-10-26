import { expect, test } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * The pet Food field is a composite (four sub-inputs) inside one `q-field`. Its grey
 * filled control used to render 88px tall — a stacked-label band plus a row of nested
 * `q-field`s that were themselves 56px — against 56px for every sibling input, so the
 * grey band overran its grid row. This pins the composite's control height to a
 * sibling's, measured at the same seam the audit used (`page.evaluate` bounding boxes).
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }

test('pet form: food field control matches a sibling control height', async ({
  browser
}) => {
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })

  // `load`/`networkidle` never settle on this page; commit + wait for `.q-page`.
  await page.goto('/employee/pets/2', { waitUntil: 'commit' })
  await page.waitForSelector('.q-page', { timeout: 20000 })
  await page.waitForTimeout(1500)

  // The edit dialog holds the PetForm (use-food) that renders the food field.
  await page.locator('[data-testid="edit-button"]').first().click()
  await page.waitForSelector('.pet-food-input', { timeout: 20000 })
  await page.waitForTimeout(500)

  // One atomic DOM read: per-element awaits stall on this page.
  const { foodH, siblingH } = await page.evaluate(() => {
    const food = document.querySelector(
      '.pet-food-input > .q-field__inner > .q-field__control'
    ) as HTMLElement | null
    // The sibling `Medicines` input is the reference filled control in the same grid.
    const sibling = (
      Array.from(document.querySelectorAll('.q-field')) as HTMLElement[]
    ).find(
      (el) =>
        !el.classList.contains('pet-food-input') &&
        el.querySelector('.q-field__label')?.textContent?.includes('Medicines')
    )
    const siblingControl = sibling?.querySelector(
      ':scope > .q-field__inner > .q-field__control'
    ) as HTMLElement | null
    return {
      foodH: food ? Math.round(food.getBoundingClientRect().height) : -1,
      siblingH: siblingControl
        ? Math.round(siblingControl.getBoundingClientRect().height)
        : -1
    }
  })

  expect(foodH, 'the food control must be measurable').toBeGreaterThan(0)
  expect(siblingH, 'the sibling control must be measurable').toBeGreaterThan(0)
  expect(
    Math.abs(foodH - siblingH),
    `food control ${foodH}px must match sibling control ${siblingH}px`
  ).toBeLessThanOrEqual(1)
  expect(
    foodH,
    `food control ${foodH}px must not overrun the row`
  ).toBeLessThanOrEqual(60)
})

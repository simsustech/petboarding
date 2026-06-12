import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

import { initializeAndLogin } from './setup'

const email = 'admin@petboarding.app'
const password = 'qjiNWdT8L'

let page: Page

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  page = await initializeAndLogin({ browser, email, password })

  await expect(
    page
      .getByRole('tab', { name: 'Employee' })
      .or(page.getByText('Employee').locator(':scope.q-item__label'))
  ).toBeVisible()
})

test.describe('KennelLayout', () => {
  test.beforeEach(async () => {
    await page.goto('/employee/kennellayout/2024-01-02')
    await page.waitForLoadState('networkidle')
  })

  test('should display the kennel layout page with waitlist and buildings', async () => {
    await expect(
      page.locator('text="Drag and drop the pets into the kennels."')
    ).toBeVisible()

    await expect(page.locator('#waitlist')).toBeVisible()
    await expect(page.locator('.drop-target').first()).toBeVisible()
  })

  test('should drag a pet from waitlist into a kennel', async () => {
    const petsInWaitlist = page.locator(
      '#waitlist .q-chip, #waitlist [id^="pet"]'
    )
    const initialWaitlistCount = await petsInWaitlist.count()

    if (initialWaitlistCount === 0) {
      test.skip(true, 'No pets in waitlist for this date')
      return
    }

    const firstPet = petsInWaitlist.first()
    const petId = await firstPet.getAttribute('id')
    expect(petId).toBeTruthy()

    const targetKennel = page.locator('.drop-target[id^="kennel"]').first()
    await expect(targetKennel).toBeVisible()

    const petBox = await firstPet.boundingBox()
    const kennelBox = await targetKennel.boundingBox()
    expect(petBox).toBeTruthy()
    expect(kennelBox).toBeTruthy()

    await page.mouse.move(
      petBox!.x + petBox!.width / 2,
      petBox!.y + petBox!.height / 2
    )
    await page.mouse.down()
    await page.mouse.move(
      kennelBox!.x + kennelBox!.width / 2,
      kennelBox!.y + kennelBox!.height / 2,
      { steps: 20 }
    )
    await page.mouse.up()

    await page.waitForLoadState('networkidle')

    const petsInWaitlistAfter = page.locator(
      '#waitlist .q-chip, #waitlist [id^="pet"]'
    )
    expect(await petsInWaitlistAfter.count()).toBeLessThan(initialWaitlistCount)

    await expect(page.locator(`#waitlist #${petId}`)).toHaveCount(0)
  })

  test('should drag a pet from a kennel back to the waitlist', async () => {
    const petsInKennels = page.locator(
      '.drop-target[id^="kennel"] .q-chip, .drop-target[id^="kennel"] [id^="pet"]'
    )
    const existingPet = petsInKennels.first()

    if ((await existingPet.count()) === 0) {
      test.skip(true, 'No pets in kennels to drag back')
      return
    }

    const petId = await existingPet.getAttribute('id')
    expect(petId).toBeTruthy()

    const waitlist = page.locator('#waitlist')
    await expect(waitlist).toBeVisible()

    const petBox = await existingPet.boundingBox()
    const waitlistBox = await waitlist.boundingBox()
    expect(petBox).toBeTruthy()
    expect(waitlistBox).toBeTruthy()

    await page.mouse.move(
      petBox!.x + petBox!.width / 2,
      petBox!.y + petBox!.height / 2
    )
    await page.mouse.down()
    await page.mouse.move(
      waitlistBox!.x + waitlistBox!.width / 2,
      waitlistBox!.y + waitlistBox!.height / 2,
      { steps: 20 }
    )
    await page.mouse.up()

    await page.waitForLoadState('networkidle')

    await expect(page.locator(`#waitlist #${petId}`)).toBeVisible()
  })

  test('should change date and reload pets', async () => {
    const today = '2024-01-02'
    const tomorrow = '2024-01-03'

    const [Y, M, D] = tomorrow.split('-')

    await page.getByPlaceholder('DD').first().fill(D)
    await page.getByPlaceholder('MM').first().fill(M)
    await page.getByPlaceholder('YYYY').first().fill(Y)

    await page.waitForLoadState('networkidle')

    await expect(page.locator('#waitlist')).toBeVisible()
  })
})

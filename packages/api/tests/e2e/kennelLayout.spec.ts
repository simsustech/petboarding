import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

import { initializeAndLogin } from './setup'

const email = 'admin@petboarding.app'
const password = 'qjiNWdT8L'

let page: Page

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  const maxRetries = 5
  for (let i = 0; i < maxRetries; i++) {
    try {
      page = await initializeAndLogin({ browser, email, password })
      break
    } catch (e) {
      if (i === maxRetries - 1) throw e
      await new Promise((r) => setTimeout(r, 2000))
    }
  }

  await expect(
    page
      .getByRole('tab', { name: 'Employee' })
      .or(page.getByText('Employee').locator(':scope.q-item__label'))
  ).toBeVisible({ timeout: 15000 })
})

test.describe('KennelLayout', () => {
  test.beforeEach(async () => {
    await page.goto('/employee/kennellayout/2024-01-02')
    await page.waitForLoadState('networkidle')
    await expect(
      page.locator('text="Drag and drop the pets into the kennels."')
    ).toBeVisible({ timeout: 10000 })
    await expect(page.locator('#waitlist')).toBeVisible({ timeout: 10000 })
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

    await expect(petsInWaitlist.first()).toBeVisible({ timeout: 5000 })

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

  test('should keep pet on waitlist across a print-route server read after drag-to-waitlist', async () => {
    // Booking 2 / pet 2 is seeded with `bookingPetKennel.kennelId = 1`, putting
    // pet 2 in kennel 1 on 2024-01-02. Without the per-day override -> NULL
    // sentinel fix in `packages/api/src/repositories/kennel.ts`, dragging pet
    // 2 from kennel 1 back to the waitlist would only delete any forward
    // override rows and leave the read resolver falling back to the booking's
    // default kennel — so pet 2 would reappear in kennel 1 on the print
    // route (and on any fresh /employee reload), even though the opt-in
    // mutation was sent.
    await page.goto('/employee/kennellayout/2024-01-02')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#waitlist')).toBeVisible({ timeout: 10000 })

    const petInKennel = page.locator('.drop-target[id^="kennel"] [id="pet2"]')
    if ((await petInKennel.count()) === 0) {
      test.skip(
        true,
        'pet2 is not in any kennel on 2024-01-02 — bug cannot be reproduced'
      )
      return
    }

    const waitlist = page.locator('#waitlist')
    await expect(waitlist).toBeVisible()

    const petBox = await petInKennel.first().boundingBox()
    expect(petBox).toBeTruthy()
    const waitlistBox = await waitlist.boundingBox()
    expect(waitlistBox).toBeTruthy()

    // Drag pet 2 from anywhere in any kennel onto #waitlist.
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

    // Navigate to the print route — a fresh server read.
    await page.goto('/print/kennellayout/2024-01-02')
    await page.waitForLoadState('networkidle')

    // The print view (`packages/app/src/pages/print/KennelLayout.vue`)
    // renders pets waiting (kennelId === null) in the top row and pets
    // assigned to a kennel inside `#kennelN` containers. There is no
    // dedicated `#waitlist` id on the print route. To verify the fix:
    // assert pet2 is NOT present inside any `#kennelN` on the print
    // page. By construction that means pet2 lives in the waitlist row.
    const printKennelLocator = page.locator(
      '.q-col-gutter-md [id^="kennel"] #pet2'
    )
    await expect(printKennelLocator).toHaveCount(0, { timeout: 5000 })
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

  test('should keep today layout untouched when booking pet is dragged on a different day', async () => {
    // Go to "today" first (the beforeEach already does this at 2024-01-02).
    await page.goto('/employee/kennellayout/2024-01-02')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#waitlist')).toBeVisible({ timeout: 10000 })

    const petsInWaitlist = page.locator(
      '#waitlist .q-chip, #waitlist [id^="pet"]'
    )
    if ((await petsInWaitlist.count()) === 0) {
      test.skip(
        true,
        'No waitlist pets on 2024-01-02 to test per-day isolation'
      )
      return
    }

    // Drag the first waitlist pet into the first kennel on "today".
    const firstPet = petsInWaitlist.first()
    const petId = await firstPet.getAttribute('id')
    expect(petId).toBeTruthy()

    const todayKennel = page.locator('.drop-target[id^="kennel"]').first()
    await expect(todayKennel).toBeVisible()

    const petBox = await firstPet.boundingBox()
    const kennelBox = await todayKennel.boundingBox()

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

    // That same pet now lives inside the first kennel for "today". Two DOM
    // nodes share the `pet{id}` (an outer wrapper div and the inner chip),
    // so use the direct-child selector to refer to the kennel that contains it.
    const petInTodayKennel = page.locator(`#kennel1 > [id="${petId}"]`)
    await expect(petInTodayKennel).toBeVisible({ timeout: 5000 })

    // Switch to "tomorrow" (2024-01-03).
    await page.goto('/employee/kennellayout/2024-01-03')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#waitlist')).toBeVisible({ timeout: 10000 })

    // If the same pet is present tomorrow (overlapping booking), drag it to a DIFFERENT kennel.
    const tomorrowPet = page.locator(`[id="${petId}"]`)
    if ((await tomorrowPet.count()) > 0) {
      const targetKennel = page.locator('.drop-target[id^="kennel"]').nth(1) // second kennel
      if ((await targetKennel.count()) > 0) {
        const tPetBox = await tomorrowPet.first().boundingBox()
        const tKennelBox = await targetKennel.boundingBox()

        await page.mouse.move(
          tPetBox!.x + tPetBox!.width / 2,
          tPetBox!.y + tPetBox!.height / 2
        )
        await page.mouse.down()
        await page.mouse.move(
          tKennelBox!.x + tKennelBox!.width / 2,
          tKennelBox!.y + tKennelBox!.height / 2,
          { steps: 20 }
        )
        await page.mouse.up()
        await page.waitForLoadState('networkidle')
      }
    }

    // Switch BACK to "today" and confirm the pet is still in kennel 1, not affected by tomorrow's edit.
    await page.goto('/employee/kennellayout/2024-01-02')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#waitlist')).toBeVisible({ timeout: 10000 })

    const petAfter = page.locator(`#kennel1 > [id="${petId}"]`)
    await expect(petAfter).toBeVisible({ timeout: 5000 })
  })
})

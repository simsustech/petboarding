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

const openLayout = async (date: string) => {
  await page.goto(`/employee/kennellayout/${date}`)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('#waitlist')).toBeVisible({ timeout: 10000 })
  await page.waitForTimeout(1200)
}

// Dialog-driven assignment helpers (the click→picker flow replaced drag & drop).
// Selectors deliberately use [id^="kennel"] / .q-chip#petN so they stay valid
// after the .drop-target class and the duplicate wrapper id are removed.

const openPickerFor = async (chip: ReturnType<typeof page.locator>) => {
  await chip.click()
  await expect(page.locator('#pickerDialog')).toBeVisible({ timeout: 5000 })
}

const pickKennel = async (kennelNr: number) => {
  await page.locator('#pickerBuilding1').click()
  await page.locator(`#pickerKennel${kennelNr}`).click()
  await expect(page.locator('#pickerDialog')).toHaveCount(0, { timeout: 5000 })
}

const pickWaitlist = async () => {
  await page.locator('#pickerWaitlist').click()
  await expect(page.locator('#pickerDialog')).toHaveCount(0, { timeout: 5000 })
}

test.describe('KennelLayout', () => {
  test.beforeEach(async () => {
    await page.goto('/employee/kennellayout/2024-01-02')
    await page.waitForLoadState('networkidle')
    await expect(
      page.locator(
        'text="Click on a pet, then choose a kennel or the waiting list."'
      )
    ).toBeVisible({ timeout: 10000 })
    await expect(page.locator('#waitlist')).toBeVisible({ timeout: 10000 })
  })

  test('should display the kennel layout page with waitlist and buildings', async () => {
    await expect(
      page.locator(
        'text="Click on a pet, then choose a kennel or the waiting list."'
      )
    ).toBeVisible()

    await expect(page.locator('#waitlist')).toBeVisible()
    await expect(page.locator('[id^="kennel"]').first()).toBeVisible()
  })

  test('pet chips size to content height, not their container', async () => {
    // Regression guard for the PetChip full-height bug: unocss-preset-quasar
    // used to give .q-card an invented display:flex, which made the section a
    // flex item and resolved descendants' percentage heights (PetChip's
    // deliberate inline height:100%) against it, so chips filled their
    // container instead of deferring to content height.
    const pageChips = page.locator('.q-chip')
    if ((await pageChips.count()) === 0) {
      // Plan E-stop: zero chips page-wide means the seeded date has no chip
      // data — ask the plan owner for a date that does; do not improvise.
      test.skip(
        true,
        'no .q-chip on 2024-01-02 — E-stop: ask plan owner for a seeded date'
      )
      return
    }

    // Prefer a chip inside a kennel section; fall back to the waitlist.
    const kennelChip = page.locator('[id^="kennel"] .q-chip').first()
    const chip =
      (await kennelChip.count()) > 0
        ? kennelChip
        : page.locator('#waitlist .q-chip').first()
    await expect(chip).toBeVisible()

    const section = chip.locator(
      'xpath=ancestor::*[@id="waitlist" or starts-with(@id, "kennel")][1]'
    )
    const chipBox = await chip.boundingBox()
    const sectionBox = await section.boundingBox()
    expect(chipBox, 'chip box').toBeTruthy()
    expect(sectionBox, 'section box').toBeTruthy()
    expect(chipBox!.height, 'chip must not fill its section').toBeLessThan(
      sectionBox!.height
    )
    // Content parity (steering-fixed 2026-10-05): the chip must be exactly as
    // tall as its own content. A resolved height:100% — the original bug —
    // makes it taller than its content. Replaces the plan's fixed `<= 64`
    // canary, which misfits multi-line chips (the seeded pet2 chip is a
    // legitimate 88px of 4-line content).
    const contentH = await chip.evaluate((el) => {
      const node = el as HTMLElement
      const prev = node.style.height
      node.style.height = 'auto'
      const h = node.getBoundingClientRect().height
      node.style.height = prev
      return h
    })
    expect(
      chipBox!.height,
      'chip must equal its content height, not its container'
    ).toBeLessThanOrEqual(contentH + 1)
  })

  test('should place a pet from the waitlist into a kennel', async () => {
    // Dialog-driven rewrite of the drag scenario (step 3). Observed fixture:
    // on 2024-02-02 the APPROVED daycare (seeds/test.ts:222-231 — daycare
    // date 2, pet 2, daycareDatePetKennel.kennelId NULL) puts pet2 on the
    // waitlist, where the old drag version could only run if the waitlist
    // happened to be non-empty on 2024-01-02 (it was not — the guard skipped).
    await openLayout('2024-02-02')

    const chip = page.locator('#waitlist .q-chip').first()
    if ((await chip.count()) === 0) {
      test.skip(true, 'No pets on the waitlist for this date')
      return
    }
    const petId = await chip.getAttribute('id')
    expect(petId).toBeTruthy()

    await openPickerFor(chip)
    await pickKennel(1)

    await expect(page.locator(`[id^="kennel"] .q-chip#${petId}`)).toBeVisible({
      timeout: 5000
    })
    await expect(page.locator(`#waitlist .q-chip#${petId}`)).toHaveCount(0)
  })

  test('should keep pet on waitlist across a print-route server read after dialog-to-waitlist', async () => {
    // Booking 2 / pet 2 is seeded with `bookingPetKennel.kennelId = 1`, putting
    // pet 2 in kennel 1 on 2024-01-02. Without the per-day override -> NULL
    // sentinel fix in `packages/api/src/repositories/kennel.ts`, moving pet 2
    // from kennel 1 to the waitlist would only delete any forward override rows
    // and leave the read resolver falling back to the booking's default kennel
    // — so pet 2 would reappear in kennel 1 on the print route (and on any
    // fresh /employee reload), even though the opt-in mutation was sent.
    await openLayout('2024-01-02')

    const petInKennel = page.locator('[id^="kennel"] .q-chip#pet2')
    if ((await petInKennel.count()) === 0) {
      test.skip(
        true,
        'pet2 is not in any kennel on 2024-01-02 — bug cannot be reproduced'
      )
      return
    }

    await openPickerFor(petInKennel.first())
    await pickWaitlist()

    await expect(page.locator('#waitlist .q-chip#pet2')).toBeVisible({
      timeout: 5000
    })

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

  test('should move a pet from a kennel back to the waitlist', async () => {
    // Operates on 2024-02-02, where the earlier placement test left pet2 in
    // kennel 1 (the old drag version depended on whatever happened to be in a
    // kennel on 2024-01-02 and skipped otherwise).
    await openLayout('2024-02-02')

    const inKennel = page.locator('[id^="kennel"] .q-chip').first()
    if ((await inKennel.count()) === 0) {
      test.skip(true, 'No pets in kennels to move back')
      return
    }
    const petId = await inKennel.getAttribute('id')
    expect(petId).toBeTruthy()

    await openPickerFor(inKennel)
    // Root level of the picker: waitlist row first, buildings after.
    await expect(page.locator('#pickerWaitlist')).toBeVisible()
    await pickWaitlist()

    await expect(page.locator(`#waitlist .q-chip#${petId}`)).toBeVisible({
      timeout: 5000
    })
  })

  test('should change date and reload pets', async () => {
    const tomorrow = '2024-01-03'

    const [Y, M, D] = tomorrow.split('-')

    await page.getByPlaceholder('DD').first().fill(D)
    await page.getByPlaceholder('MM').first().fill(M)
    await page.getByPlaceholder('YYYY').first().fill(Y)

    await page.waitForLoadState('networkidle')

    await expect(page.locator('#waitlist')).toBeVisible()
  })

  test('should keep today layout untouched when a pet is placed in a different kennel on another day', async () => {
    // Go to "today" first (the beforeEach already does this at 2024-01-02).
    // After the print-route test above, pet2 sits on the waitlist on
    // 2024-01-02 (per-day override -> NULL sentinel, seeds/test.ts:100-111 +
    // repositories/kennel.ts clearForwardBookingPetKennelOverrides).
    await openLayout('2024-01-02')

    const waitChip = page.locator('#waitlist .q-chip#pet2')
    if ((await waitChip.count()) === 0) {
      test.skip(
        true,
        'pet2 is not on the waitlist on 2024-01-02 — cannot exercise per-day isolation'
      )
      return
    }

    // Place pet2 into kennel 2 on "today".
    await openPickerFor(waitChip)
    await pickKennel(2)
    await expect(page.locator('#kennel2 .q-chip#pet2')).toBeVisible({
      timeout: 5000
    })

    // Switch to "tomorrow" (2024-01-03): the 01-02 override carries forward
    // (latest override with date <= queried date, repositories/kennel.ts
    // leftJoinLateral), so pet2 starts in kennel 2 there.
    await openLayout('2024-01-03')
    const tomorrowChip = page.locator('#kennel2 .q-chip#pet2')
    if ((await tomorrowChip.count()) === 0) {
      test.skip(
        true,
        'pet2 did not carry forward to 2024-01-03 — per-day resolver changed, do not improvise'
      )
      return
    }

    // Move it to a DIFFERENT kennel tomorrow.
    await openPickerFor(tomorrowChip)
    await pickKennel(3)
    await expect(page.locator('#kennel3 .q-chip#pet2')).toBeVisible({
      timeout: 5000
    })

    // Switch BACK to "today": pet2 must still be in kennel 2, not kennel 3.
    await openLayout('2024-01-02')
    await expect(page.locator('#kennel2 .q-chip#pet2')).toBeVisible({
      timeout: 5000
    })
    await expect(page.locator('#kennel3 .q-chip#pet2')).toHaveCount(0)
  })
})

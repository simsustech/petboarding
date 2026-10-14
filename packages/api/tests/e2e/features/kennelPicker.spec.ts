import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { initializeAndLogin } from '../setup'

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
  ).toBeVisible({ timeout: 15000 })
})

test.describe('Kennel picker dialog', () => {
  test('tapping a chip opens the two-level picker at desktop and mobile widths', async () => {
    // The mobile-friendliness gate: the same tap→picker flow must work at a
    // phone viewport (375) where the old drag & drop never fired at all.
    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: 812 })
      // 2024-02-02, not the plan's 2024-01-02: on 01-02 the only chip is pet2
      // *inside* kennel 1 (observed), so #waitlist is empty there. On 02-02 the
      // approved daycare (seeds/test.ts:222-231 — daycare date 2 = APPROVED,
      // pet 2, daycareDatePetKennel without kennelId → NULL) puts pet2 on the
      // waitlist, which this test's selector requires.
      await page.goto('/employee/kennellayout/2024-02-02')
      await page.waitForLoadState('networkidle')
      await expect(page.locator('#waitlist')).toBeVisible({ timeout: 10000 })

      const chip = page.locator('#waitlist .q-chip').first()
      if ((await chip.count()) === 0) {
        // Seed-dependent guard, same convention as kennelLayout.spec.ts:111-114.
        // Observed fixture: daycare date 2 (APPROVED, pet 2) on 2024-02-02 with
        // daycareDatePetKennel.kennelId NULL → the chip must sit on the waitlist.
        test.skip(
          true,
          'no waitlist chips on 2024-02-02 — fixture regression, do not improvise'
        )
        return
      }

      // Click affordances: the chip must LOOK and BEHAVE clickable —
      // Quasar's q-chip--clickable cursor/hover class and keyboard activation.
      await expect(chip).toHaveClass(/q-chip--clickable/)
      await chip.focus()
      await page.keyboard.press('Enter')
      await expect(page.locator('#pickerDialog')).toBeVisible({ timeout: 5000 })
      await page.keyboard.press('Escape')
      await expect(page.locator('#pickerDialog')).toHaveCount(0, {
        timeout: 5000
      })

      await chip.click()
      await expect(page.locator('#pickerDialog')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('#pickerWaitlist')).toBeVisible()
      // The waitlist row is announced with its live count, not a bare label.
      await expect(page.locator('#pickerWaitlist')).toHaveAttribute(
        'aria-label',
        /Waiting list/
      )
      // Waitlist standout: timer-sand pill + live count (one waiting pet on
      // 2024-02-02 — the approved daycare); buildings carry a warehouse icon.
      await expect(
        page.locator('#pickerWaitlist .i-mdi-timer-sand')
      ).toBeVisible()
      await expect(page.locator('#pickerWaitlist')).toContainText('1')
      await expect(
        page.locator('#pickerBuilding1 .i-mdi-warehouse')
      ).toBeVisible()
      await expect(page.locator('#pickerBuilding1')).toBeVisible()

      // Level 2: building row → kennel rows (seed: one building, 10 kennels,
      // seeds/test.ts:494-505).
      await page.locator('#pickerBuilding1').click()
      await expect(page.locator('#pickerKennel1')).toBeVisible()
      await expect(page.locator('#pickerKennel10')).toBeVisible()

      // Back returns to the root level (waitlist + buildings).
      await page.locator('[aria-label="Back"]').click()
      await expect(page.locator('#pickerWaitlist')).toBeVisible()
      await expect(page.locator('#pickerBuilding1')).toBeVisible()

      await page.keyboard.press('Escape')
      await expect(page.locator('#pickerDialog')).toHaveCount(0, {
        timeout: 5000
      })
    }
  })

  test('occupant chips carry the rating colour across every seeded window', async () => {
    // Seeded windows (seeds/test.ts bookings 9–16 + petRelations):
    //   Mar pet3(k1)+pet4(k2) r3 orange | Apr pet1(k3)+pet5(waitlist) r8 green
    //   May pet5(k1)+pet3(k2) r1 red     | Jun pet4(k1)+pet1(k2) r10 emerald
    // Occupants render as the SAME PetChip + :class colour system the layout
    // page uses; the rating is surfaced in the chip's overline. Pet 2 is
    // deliberately uninvolved: deceased-pet-relations.spec.ts pins its
    // relations dialog select.
    const windows = [
      {
        date: '2024-03-01',
        chip: '[id^="kennel"] .q-chip#pet3',
        kennel: 2,
        selfKennel: 1,
        name: 'name4',
        color: 'bg-orange-500',
        rating: '3',
        band: 'Fair'
      },
      {
        date: '2024-04-01',
        chip: '#waitlist .q-chip#pet5',
        kennel: 3,
        name: 'name1',
        color: 'bg-green-400',
        rating: '8',
        band: 'Good'
      },
      {
        date: '2024-05-01',
        chip: '[id^="kennel"] .q-chip#pet5',
        kennel: 2,
        name: 'name3',
        color: 'bg-red-600',
        rating: '1',
        band: 'Poor'
      },
      {
        date: '2024-06-01',
        chip: '[id^="kennel"] .q-chip#pet4',
        kennel: 2,
        name: 'name1',
        color: 'bg-emerald-600',
        rating: '10',
        band: 'Great'
      }
    ]

    await page.setViewportSize({ width: 1440, height: 812 })
    for (const w of windows) {
      await page.goto(`/employee/kennellayout/${w.date}`)
      await page.waitForLoadState('networkidle')
      await expect(page.locator('#waitlist')).toBeVisible({ timeout: 10000 })

      const chip = page.locator(w.chip).first()
      if ((await chip.count()) === 0) {
        // Same seed-dependent guard convention as kennelLayout.spec.ts:111-114.
        test.skip(
          true,
          `chip ${w.chip} missing on ${w.date} — seed fixture regression`
        )
        return
      }

      await chip.click()
      await expect(page.locator('#pickerDialog')).toBeVisible({ timeout: 5000 })
      await page.locator('#pickerBuilding1').click()

      const row = page.locator(`#pickerKennel${w.kennel}`)
      await expect(row).toBeVisible()
      const occupantChip = row.locator('.q-chip').first()
      await expect(occupantChip).toBeVisible()
      // Compact occupant chip: identity + rating only — no food line (the full
      // page line) and no bare `2x` fragment, which read as an unexplained
      // multiplier. The food BADGE still signals extra feeding where it matters.
      await expect(row).not.toContainText('gr.')
      await expect(row).not.toContainText('2x')
      await expect(
        row.locator('.i-mdi-camera'),
        'camera icon must not appear in the picker rows'
      ).toHaveCount(0)
      // Self-describing rows: empty kennels say "Free", not just a numeral.
      await expect(
        page.locator('[id^="pickerKennel"]').filter({ hasText: 'Free' }).first()
      ).toBeVisible()
      // Level-2 header: kennel-count availability (plural-safe — a kennel may
      // hold several pets), plus the band legend.
      await expect(page.locator('#pickerSummary')).toContainText('of 10 free')
      await expect(page.locator('#pickerLegend')).toContainText('Poor')
      await expect(page.locator('#pickerLegend')).toContainText('Great')
      // EXACT class membership: a substring regex once masked the broken
      // `bg-bg-orange-500` produced by QBadge's ` bg-${color}` prefixing.
      expect(
        await occupantChip.evaluate(
          (el, color) => el.classList.contains(color),
          w.color
        ),
        `chip must carry the exact class ${w.color}`
      ).toBe(true)
      await expect(occupantChip).toContainText(w.name)
      // The rating is a number + band word — never colour or number alone.
      await expect(occupantChip).toContainText(w.rating)
      await expect(occupantChip).toContainText(w.band)
      await expect(occupantChip).not.toContainText('Rating:')
      // The row itself stays neutral — colour lives on the chip.
      expect(
        await row.evaluate((el, color) => el.classList.contains(color), w.color)
      ).toBe(false)
      // Self-exclusion: the picked pet's own kennel shows no occupant chip.
      if (w.selfKennel) {
        await expect(
          page.locator(`#pickerKennel${w.selfKennel} .q-chip`)
        ).toHaveCount(0)
      }

      // Accessibility: rows are announced with the kennel and its state rather
      // than the occupant chip's raw text (which never said "kennel").
      await expect(page.locator(`#pickerKennel${w.kennel}`)).toHaveAttribute(
        'aria-label',
        new RegExp(w.name)
      )
      const freeRow = page
        .locator('[id^="pickerKennel"]')
        .filter({ hasText: 'Free' })
        .first()
      await expect(freeRow).toHaveAttribute('aria-label', /Free/)

      await page.keyboard.press('Escape')
      await expect(page.locator('#pickerDialog')).toHaveCount(0, {
        timeout: 5000
      })
    }
  })

  test('a kennel with more occupants than the cap shows a +N remainder', async () => {
    // Seeded Jul 2024 window: pets 1, 3, 4 and 5 all share kennel 1. The picker
    // excludes the pet being placed from that kennel's occupants, so opening from
    // pet 1 leaves three others: two chips plus a remainder. Four (not three)
    // occupants are needed for the remainder to appear at all — this is the
    // fixture's whole point.
    await page.setViewportSize({ width: 1440, height: 812 })
    await page.goto('/employee/kennellayout/2024-07-01')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#waitlist')).toBeVisible({ timeout: 10000 })

    // Open from pet 1 specifically (name1); `.first` could be any occupant.
    const chip = page
      .locator('[id^="kennel"] .q-chip')
      .filter({ hasText: 'name1' })
      .first()
    if ((await chip.count()) === 0) {
      test.skip(true, 'pet 1 not kennelled on 2024-07-01 — fixture regression')
      return
    }

    await chip.click()
    await expect(page.locator('#pickerDialog')).toBeVisible({ timeout: 5000 })
    await page.locator('#pickerBuilding1').click()

    const row = page.locator('#pickerKennel1')
    await expect(row).toBeVisible()
    // Three others remain, but at most the cap may be rendered.
    await expect(row.locator('.q-chip')).toHaveCount(2)
    // And the remainder is disclosed rather than silently dropped
    // (`moreOccupants` copy is '+{n} more').
    await expect(row).toContainText('+1 more')

    await page.keyboard.press('Escape')
    await expect(page.locator('#pickerDialog')).toHaveCount(0, {
      timeout: 5000
    })
  })

  test('the chip context menu keeps only "Open pet." once the kennel submenu is gone', async () => {
    // Plan step 6: the building→kennel submenu (PetKennelContextMenuItems) is
    // replaced by the picker dialog; the right-click menu must keep PetChip's
    // built-in "Open pet." item (en-US.ts:194) and list no buildings.
    await page.setViewportSize({ width: 1440, height: 812 })
    await page.goto('/employee/kennellayout/2024-02-02')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#waitlist')).toBeVisible({ timeout: 10000 })

    const chip = page.locator('#waitlist .q-chip').first()
    if ((await chip.count()) === 0) {
      test.skip(true, 'no waitlist chip on 2024-02-02 — fixture regression')
      return
    }

    await chip.click({ button: 'right' })
    const menu = page.locator('.q-menu')
    await expect(menu).toBeVisible({ timeout: 5000 })
    await expect(menu).toContainText('Open pet.')
    await expect(menu).not.toContainText('Main building')

    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0, { timeout: 5000 })
  })
})

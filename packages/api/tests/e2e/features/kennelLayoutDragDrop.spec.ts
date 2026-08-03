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

const openLayout = async (date: string) => {
  await page.goto(`/employee/kennellayout/${date}`)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('#waitlist')).toBeVisible({ timeout: 10000 })
  await page.waitForTimeout(1200)
}

const chipClasses = async () =>
  page.locator('.q-chip').evaluateAll((els) =>
    els.map((e) => ({
      id: (e as HTMLElement).id,
      cls: (e as HTMLElement).className
    }))
  )

test.describe('KennelLayout drag & drop regression', () => {
  test('dropping a chip onto a chip in a kennel does not throw a TypeError', async () => {
    // The reported crash: dropping a pet chip onto an occupied kennel threw
    // `TypeError: Cannot read properties of null (reading 'at')` inside onDrop.
    // The 4-level ancestor walk stopped on the `petN` row wrapper (which carries
    // the same id), and `"petN".match(/kennel(.*)/)` returned null. Dropping
    // onto the occupant chip's own text exercises that exact code path.
    const typeErrors: string[] = []
    page.on('console', (m) => {
      if (m.type() === 'error' && m.text().includes('TypeError')) {
        typeErrors.push(m.text())
      }
    })

    await openLayout('2024-01-02') // seeded: pet2 (approved booking) in kennel 1
    const chip = page.locator('.drop-target[id^="kennel"] .q-chip').first()
    if ((await chip.count()) === 0) {
      test.skip(true, 'No pet chip in any kennel for this date')
      return
    }
    await expect(chip).toBeVisible({ timeout: 5000 })

    // Real drag with movement, dropping back onto the occupant chip's center.
    const cb = (await chip.boundingBox())!
    const cx = cb.x + cb.width / 2
    const cy = cb.y + cb.height / 2
    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.mouse.move(cx + 80, cy, { steps: 10 })
    await page.mouse.move(cx, cy, { steps: 10 })
    await page.mouse.up()
    await page.waitForLoadState('networkidle')

    expect(
      typeErrors,
      `unexpected TypeError during drop: ${typeErrors}`
    ).toEqual([])
  })

  test('booking chips are blue and not recolored by alerts', async () => {
    // 2024-01-02: pet2 is the only approved booking, placed in kennel 1.
    await openLayout('2024-01-02')
    let chips = await chipClasses()
    if (chips.length === 0) {
      test.skip(true, 'No booking pet chips for this date')
      return
    }
    for (const c of chips) {
      expect(c.cls, `chip ${c.id} should be blue (booking)`).toContain(
        'bg-blue-2'
      )
      expect(c.cls).not.toContain('bg-yellow-2')
    }

    // 2024-01-05: pet2 is still booked and its `aggressive` alert is active.
    // The alert used to recolor the chip (bg-red-2); it must stay blue.
    await openLayout('2024-01-05')
    chips = await chipClasses()
    for (const c of chips) {
      expect(
        c.cls,
        `chip ${c.id} should stay blue despite the active alert`
      ).toContain('bg-blue-2')
      expect(c.cls).not.toContain('bg-red-2')
      expect(c.cls).not.toContain('bg-yellow-2')
    }
  })

  test('daycare chips are yellow', async () => {
    // 2024-02-02: daycare date 2 is approved for pet 2 (no booking overlap).
    await openLayout('2024-02-02')
    const chips = await chipClasses()
    if (chips.length === 0) {
      test.skip(true, 'No daycare pet chips for this date')
      return
    }
    for (const c of chips) {
      expect(c.cls, `chip ${c.id} should be yellow (daycare)`).toContain(
        'bg-yellow-2'
      )
      expect(c.cls).not.toContain('bg-blue-2')
    }
  })
})

import { test, expect } from '@playwright/test'

const email = 'admin@petboarding.app'
const password = 'qjiNWdT8L'

const login = async (page: any) => {
  await page.goto('/')
  await page.click('text=Login')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveURL(/.*login/)
  await page.locator('text="Email"').fill(email)
  await page.locator('text="Password"').fill(password)
  await page.locator('button >> text=Login').click()
  await page.waitForURL(/.*user/)
}

test.describe('PetItem on mobile viewport', () => {
  test('PetItem: q-rating in separate label below name, no overlap', async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await login(page)

    await page.goto('/employee/customers/2')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    await expect(page.getByText('name2').first()).toBeVisible({
      timeout: 10000
    })

    const result = await page.evaluate(() => {
      const qItems = document.querySelectorAll('.q-item')
      let petItem: Element | null = null
      for (const item of qItems) {
        if (item.querySelector('.q-rating')) {
          petItem = item
          break
        }
      }
      if (!petItem) return { found: false }

      // The name is now a direct text node in .q-item__label (first non-overline, non-caption)
      const allLabels = petItem.querySelectorAll('.q-item__label')
      let nameLabel: Element | null = null
      let ratingLabel: Element | null = null
      for (const label of allLabels) {
        if (label.classList.contains('q-item__label--overline')) continue
        if (label.classList.contains('q-item__label--caption')) continue
        if (label.querySelector('.q-rating')) {
          ratingLabel = label
        } else if (label.textContent?.trim()) {
          nameLabel = label
        }
      }

      if (!nameLabel || !ratingLabel) return { found: false }

      const name = nameLabel.getBoundingClientRect()
      const ratingEl = ratingLabel.querySelector('.q-rating')!
      const rating = ratingEl.getBoundingClientRect()

      // Name should be ABOVE rating (name ends before rating starts in y)
      const nameBottom = name.y + name.height
      const nameAboveRating = nameBottom <= rating.y

      // No visual overlap: they shouldn't share y-space
      const ratingBottom = rating.y + rating.height
      const yOverlap = name.y < ratingBottom && name.y + name.height > rating.y

      return {
        found: true,
        name: { x: name.x, y: name.y, w: name.width, h: name.height },
        rating: { x: rating.x, y: rating.y, w: rating.width, h: rating.height },
        nameAboveRating,
        yOverlap
      }
    })

    console.log('PetItem:', JSON.stringify(result, null, 2))
    if (result?.found) {
      expect(result.nameAboveRating).toBe(true)
      expect(result.yOverlap).toBe(false)
    }
  })

  test('PetCard: q-rating inline with name, no overlap on mobile', async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await login(page)

    await page.goto('/employee/pets/2')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    await expect(page.getByText('name2').first()).toBeVisible({
      timeout: 10000
    })

    const result = await page.evaluate(() => {
      const qCards = document.querySelectorAll('.q-card')
      let petCard: Element | null = null
      for (const card of qCards) {
        if (card.querySelector('.q-rating')) {
          petCard = card
          break
        }
      }
      if (!petCard) return { found: false }

      const nameSpan = petCard.querySelector('.row.q-pl-md span')
      const ratingEl = petCard.querySelector('.row.q-pl-md .q-rating')
      if (!nameSpan || !ratingEl) return { found: false }

      const name = nameSpan.getBoundingClientRect()
      const rating = ratingEl.getBoundingClientRect()

      const nameRight = name.x + name.width
      const ratingRight = rating.x + rating.width
      const nameBottom = name.y + name.height
      const ratingBottom = rating.y + rating.height

      const xOverlap = name.x < ratingRight && nameRight > rating.x
      const yOverlap = name.y < ratingBottom && nameBottom > rating.y
      const hasVisualOverlap = xOverlap && yOverlap

      return {
        found: true,
        name: { x: name.x, y: name.y, w: name.width, h: name.height },
        rating: { x: rating.x, y: rating.y, w: rating.width, h: rating.height },
        hasVisualOverlap
      }
    })

    console.log('PetCard:', JSON.stringify(result, null, 2))
    if (result?.found) {
      expect(result.hasVisualOverlap).toBe(false)
    }
  })
})

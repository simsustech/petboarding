import { test } from '@playwright/test'
import { initializePage, login } from './setup'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

test('pet-alerts-card', async ({ browser }) => {
  test.setTimeout(60000)
  const page = await initializePage({ browser })
  await login({ page, email: 'admin@petboarding.app', password: 'qjiNWdT8L' })

  await page.goto('/employee/pets/2')
  await page.waitForLoadState('networkidle')
  await delay(3000)

  // Scroll to the alerts section so it's in the viewport
  await page.locator('text=Alerts').first().scrollIntoViewIfNeeded()
  await delay(500)

  await page.screenshot({
    path: '../docs/public/screenshots/employee-pet-alerts.png',
    fullPage: false
  })
})

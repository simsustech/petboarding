import { test, expect } from '@playwright/test'
import { initializeAndLogin } from '../setup'

const email = 'admin@petboarding.app'
const password = 'qjiNWdT8L'

let page: any

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  page = await initializeAndLogin({ browser, email, password })

  await expect(
    page
      .getByRole('tab', { name: 'Employee' })
      .or(page.getByText('Employee').locator(':scope.q-item__label'))
  ).toBeVisible()
})

test.describe('Pet Alerts', async () => {
  test('should load the pet page without errors', async () => {
    await page.goto('/employee/pets/2')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('name2').first()).toBeVisible({
      timeout: 10000
    })
  })
})

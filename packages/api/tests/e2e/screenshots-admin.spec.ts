import { test } from '@playwright/test'
import { initializePage, login } from './setup'

const PAGES = [
  ['/employee/kennellayout', 'employee-kennellayout'],
  ['/employee/agenda', 'employee-agenda'],
  ['/admin/bookings', 'admin-bookings'],
  ['/admin/occupancy', 'admin-occupancy'],
  ['/admin/configuration/buildings', 'admin-config']
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function setup(browser, email, password) {
  const page = await initializePage({ browser })
  await login({ page, email, password })
  return page
}

async function switchLang(page, lang) {
  await page.locator('header button').last().click()
  await delay(500)
  await page
    .locator('.q-select')
    .filter({ hasText: /English|Nederlands/i })
    .first()
    .click()
  await delay(500)
  await page.getByRole('option', { name: lang }).click()
  await delay(1000)
  await page.keyboard.press('Escape')
  await delay(500)
}

async function snap(page, suffix) {
  for (const [r, n] of PAGES) {
    const w = n.includes('agenda') || n.includes('kennellayout') ? 4000 : 2000
    await page.goto(r)
    await page.waitForLoadState('networkidle')
    await delay(w)
    await page.screenshot({
      path: `../docs/public/screenshots/${suffix ? n + '-' + suffix : n}.png`,
      fullPage: false
    })
  }
}

test('en-desktop', async ({ browser }) => {
  test.setTimeout(60000)
  const page = await setup(browser, 'admin@petboarding.app', 'qjiNWdT8L')
  await switchLang(page, 'English')
  await snap(page, null)
})

test('nl-desktop', async ({ browser }) => {
  test.setTimeout(60000)
  const page = await setup(browser, 'admin@petboarding.app', 'qjiNWdT8L')
  await switchLang(page, 'Dutch')
  await snap(page, 'nl')
})

test('en-mobile', async ({ browser }) => {
  test.setTimeout(60000)
  const page = await setup(browser, 'admin@petboarding.app', 'qjiNWdT8L')
  await switchLang(page, 'English')
  await page.setViewportSize({ width: 375, height: 812 })
  await snap(page, 'mobile')
})

test('nl-mobile', async ({ browser }) => {
  test.setTimeout(60000)
  const page = await setup(browser, 'admin@petboarding.app', 'qjiNWdT8L')
  await switchLang(page, 'Dutch')
  await page.setViewportSize({ width: 375, height: 812 })
  await snap(page, 'nl-mobile')
})

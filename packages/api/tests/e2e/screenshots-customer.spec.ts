import { test } from '@playwright/test'
import { initializePage, login } from './setup'

const PAGES = [
  ['/', 'homepage'],
  ['/account/customer', 'customer-details'],
  ['/account/pets', 'customer-pets'],
  ['/account/bookings', 'customer-bookings']
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function setup(browser, email, password) {
  const page = await initializePage({ browser })
  await login({ page, email, password })
  await page.goto('/account/customer')
  await page.waitForLoadState('networkidle')
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
    await page.goto(r)
    await page.waitForLoadState('networkidle')
    await delay(2000)
    await page.screenshot({
      path: `../docs/public/screenshots/${suffix ? n + '-' + suffix : n}.png`,
      fullPage: false
    })
  }
}

test('en-desktop', async ({ browser }) => {
  test.setTimeout(60000)
  const page = await setup(browser, 'demo@petboarding.app', 'demodemo')
  await switchLang(page, 'English')
  await snap(page, null)
})

test('nl-desktop', async ({ browser }) => {
  test.setTimeout(60000)
  const page = await setup(browser, 'demo@petboarding.app', 'demodemo')
  await switchLang(page, 'Dutch')
  await snap(page, 'nl')
})

test('en-mobile', async ({ browser }) => {
  test.setTimeout(60000)
  const page = await setup(browser, 'demo@petboarding.app', 'demodemo')
  await switchLang(page, 'English')
  await page.setViewportSize({ width: 375, height: 812 })
  await snap(page, 'mobile')
})

test('nl-mobile', async ({ browser }) => {
  test.setTimeout(60000)
  const page = await setup(browser, 'demo@petboarding.app', 'demodemo')
  await switchLang(page, 'Dutch')
  await page.setViewportSize({ width: 375, height: 812 })
  await snap(page, 'nl-mobile')
})

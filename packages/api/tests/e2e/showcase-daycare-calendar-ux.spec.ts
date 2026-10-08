import { test } from '@playwright/test'
import { initializePage, login } from './setup'

/**
 * Showcase test for the daycare calendar UX improvements.
 * Captures before/after screenshots of /account/daycare page states.
 *
 * Before-state screenshots are taken by checking out the previous commit
 * in this branch (git stash for files only) — for now this template serves
 * as a placeholder where you can manually run after the dev server is up.
 *
 * Run with: PLAYWRIGHT_ALLOW_SCREENSHOTS=1 pnpm --filter=api test:e2e --grep=showcase-daycare
 */

const SHOWCASE_DIR = '../../showcase/daycare-calendar-ux/'
const SUFFIX = process.env.SHOWCASE_SUFFIX ?? 'after' // 'before' or 'after'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function captureAccount({
  browser,
  route,
  name,
  mobile = false
}: {
  browser: import('@playwright/test').Browser
  route: string
  name: string
  mobile?: boolean
}) {
  const page = await initializePage({ browser })
  await login({ page, email: 'test1@petboarding.app', password: 'qjiNWdT8L' })
  if (mobile) {
    await page.setViewportSize({ width: 375, height: 812 })
  } else {
    await page.setViewportSize({ width: 1440, height: 900 })
  }
  await page.goto(route)
  await page.waitForLoadState('networkidle')
  await delay(2000)
  await page.screenshot({
    path: `${SHOWCASE_DIR}${SUFFIX}/${name}.png`,
    fullPage: false
  })
  await page.close()
}

async function captureAdmin({
  browser,
  route,
  name
}: {
  browser: import('@playwright/test').Browser
  route: string
  name: string
}) {
  const page = await initializePage({ browser })
  await login({ page, email: 'admin@petboarding.app', password: 'qjiNWdT8L' })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(route)
  await page.waitForLoadState('networkidle')
  await delay(2000)
  await page.screenshot({
    path: `${SHOWCASE_DIR}${SUFFIX}/${name}.png`,
    fullPage: false
  })
  await page.close()
}

test('showcase-daycare: account empty (with pets)', async ({ browser }) => {
  test.setTimeout(60000)
  await captureAccount({
    browser,
    route: '/account/daycare',
    name: 'account-daycare-empty'
  })
})

test('showcase-daycare: account with dates (desktop)', async ({ browser }) => {
  test.setTimeout(60000)
  await captureAccount({
    browser,
    route: '/account/daycare',
    name: 'account-daycare-with-dates'
  })
})

test('showcase-daycare: account with dates (mobile)', async ({ browser }) => {
  test.setTimeout(60000)
  await captureAccount({
    browser,
    route: '/account/daycare',
    name: 'account-daycare-with-dates-mobile',
    mobile: true
  })
})

test('showcase-daycare: admin view', async ({ browser }) => {
  test.setTimeout(60000)
  await captureAdmin({
    browser,
    route: '/admin/daycare',
    name: 'admin-daycare'
  })
})

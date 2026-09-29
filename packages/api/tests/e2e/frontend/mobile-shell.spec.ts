import { test, expect, type Page } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * Mobile shell guard — 375×812.
 *
 * The preset replaces quasar.css (`disableSass: true`), and until the screen
 * breakpoints were restored it emitted the *component* size scale on Quasar's
 * reserved `--q-size-{xs,sm,md,lg,xl}` names (24/40/56px, no xs/xl). The Screen
 * plugin parses those declarations, so every viewport reported `xl`: the drawer
 * covered the page, its `q-scrollarea__content` intercepted pointer events
 * (the sticky FAB failed 340 click retries in the audit), and login was
 * impossible at 375px — the audit worked around it by logging in at 1440.
 *
 * Four assertions, all red before the breakpoint fix (audit evidence quoted in
 * the plan this spec came from), all guarding it now:
 *
 *   1. `$q.screen.name !== 'xl' && lt.sm === true` at 375px
 *   2. the drawer does not cover the content
 *   3. the sticky FAB passes `click({ trial: true })`
 *   4. login succeeds at 375px
 *
 * `$q` is read through the root instance (`#app`, verified — not `#q-app`).
 * If `#app` or the sticky FAB disappears this spec throws its E-stop message
 * rather than asserting a negative: a missing anchor is a question for the
 * plan owner, not a green test.
 */

// Same seeded credentials as screenshots-audit.spec.ts (ADMIN / CUSTOMER).
const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }
const CUSTOMER = { email: 'test1@petboarding.app', password: 'qjiNWdT8L' }

const MOBILE = { width: 375, height: 812 } as const

async function openAtMobile(page: Page) {
  await page.setViewportSize({ width: MOBILE.width, height: MOBILE.height })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
}

const screenState = (page: Page) =>
  page.evaluate(() => {
    const root = document.querySelector('#app')
    if (!root || !(root as any).__vue_app__) {
      throw new Error(
        'E-stop: #app (or its Vue app instance) is missing — ask, do not assert a negative'
      )
    }
    const $q = (root as any).__vue_app__.config.globalProperties.$q
    return { name: $q.screen.name as string, ltSm: $q.screen.lt.sm as boolean }
  })

test.describe('mobile shell at 375px', () => {
  test('$q.screen reports the phone breakpoint, not xl', async ({
    browser
  }) => {
    const page = await initializePage({ browser })
    await openAtMobile(page)

    const state = await screenState(page)
    expect(state.name).not.toBe('xl')
    expect(state.ltSm).toBe(true)
    await page.context().close()
  })

  test('login succeeds at 375px', async ({ browser }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: MOBILE.width, height: MOBILE.height })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    await expect(page).toHaveURL(/.*user/)
    await page.context().close()
  })

  test('the drawer does not cover the content', async ({ browser }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: MOBILE.width, height: MOBILE.height })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    // Closed at this width: off-canvas + visibility:hidden, no scrim. With the
    // screen bug the drawer was open over the whole page (gt.sm was always
    // true), and its scroll area / scrim were the top blockers of the audit sweep.
    await expect(page.locator('.q-drawer')).toBeHidden()
    await expect(page.locator('.q-drawer__backdrop')).toBeHidden()
    await page.context().close()
  })

  test('the sticky FAB passes a trial click', async ({ browser }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: MOBILE.width, height: MOBILE.height })
    await login({ page, email: CUSTOMER.email, password: CUSTOMER.password })
    await page.goto('/account/pets')
    await page.waitForLoadState('networkidle')

    // The mobile create button is the id-less sticky FAB (the rail's #fabAdd
    // wears gt-sm and lives in the drawer's mini template — desktop only).
    const fab = page.locator('.q-page-sticky .q-btn').first()
    expect(
      await fab.count(),
      'E-stop: the sticky FAB is missing — ask, do not assert a negative'
    ).toBeGreaterThan(0)

    // Actionability check: fails if anything (the drawer's q-scrollarea__content
    // did, 340 retries in the audit) intercepts the pointer at the FAB's centre.
    await fab.click({ trial: true })
    await page.context().close()
  })

  test('visible primary controls are at least 44px tall', async ({
    browser
  }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: MOBILE.width, height: MOBILE.height })

    // Probe heights of every visible interactive control. The audit's own
    // measurements at 375px: rect buttons 40px, round 42px, dense-round
    // (the header Menu) 33.6px, dense rect 30px, fields 40px.
    const measure = () =>
      page.evaluate(() => {
        const els = Array.from(
          document.querySelectorAll('button, input, select, textarea')
        )
        return els
          .filter((el) => {
            const r = el.getBoundingClientRect()
            return (
              r.width > 0 &&
              r.height > 0 &&
              getComputedStyle(el).visibility !== 'hidden'
            )
          })
          .map((el) => ({
            h: Math.round(el.getBoundingClientRect().height * 10) / 10,
            cls: String(el.className).replace(/\s+/g, ' ').slice(0, 60)
          }))
      })

    // Logged out: the header's dense-round Menu button, the Login button and
    // the credential fields.
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    const loggedOut = await measure()
    expect(loggedOut.length, 'the login view renders controls').toBeGreaterThan(
      0
    )
    for (const control of loggedOut) {
      expect(control.h, `${control.cls} at 375px`).toBeGreaterThanOrEqual(44)
    }

    // Logged in: the round user-menu button.
    await login({ page, email: ADMIN.email, password: ADMIN.password })
    await page.waitForTimeout(1000)
    const loggedIn = await measure()
    expect(loggedIn.length, 'the app renders controls').toBeGreaterThan(0)
    for (const control of loggedIn) {
      expect(control.h, `${control.cls} at 375px`).toBeGreaterThanOrEqual(44)
    }
    await page.context().close()
  })
})

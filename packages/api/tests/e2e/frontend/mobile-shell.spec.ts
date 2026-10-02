import { test, expect, type Page } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * Mobile shell guard — 375×812.
 *
 * The preset replaced quasar.css and, before the screen breakpoints were restored,
 * emitted the component size scale on Quasar's reserved `--q-size-*` names, so every
 * viewport reported `xl`: the drawer covered the page, its scroll area swallowed
 * pointer events, and login at 375px was impossible. These four assertions guard the
 * fix — `$q.screen` reports mobile, the drawer does not cover content, the sticky FAB
 * is clickable, and login succeeds. `$q` is read via the root `#app` instance.
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

    // Closed: off-canvas + visibility:hidden, no scrim.
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

    // The mobile create button is the id-less sticky FAB (the rail's #fabAdd is desktop-only).
    const fab = page.locator('.q-page-sticky .q-btn').first()
    expect(
      await fab.count(),
      'E-stop: the sticky FAB is missing — ask, do not assert a negative'
    ).toBeGreaterThan(0)

    // Actionability check: fails if anything intercepts the pointer at the FAB's centre.
    await fab.click({ trial: true })
    await page.context().close()
  })

  test('visible primary controls are at least 44px tall', async ({
    browser
  }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: MOBILE.width, height: MOBILE.height })

    // Probe heights of every visible interactive control (audit at 375px: buttons 40px,
    // round 42px, dense-round 33.6px, dense rect 30px, fields 40px).
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

    // Logged out: the Menu button, the Login button and the credential fields.
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

/**
 * The shell owns no scroll: a route that widens the document past the viewport makes the
 * phone's layout viewport pan, and the fixed header/footer slide along with the content.
 * Every mobile destination must keep the document at viewport width; a wide data surface
 * (the agenda's 600px canvas) scrolls inside a container it owns instead.
 */
const WIDTH_ROUTES = [
  '/employee/agenda',
  '/employee/overview',
  '/employee/bookings',
  '/employee/pets',
  '/employee/customers',
  '/admin/bookings',
  '/admin/daycare',
  '/admin/occupancy',
  '/admin/configuration',
  '/account'
]

test.describe('no route widens the document at 375px', () => {
  test('every mobile destination keeps its width', async ({ browser }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: MOBILE.width, height: MOBILE.height })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    const widened: string[] = []
    for (const route of WIDTH_ROUTES) {
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      const measured = await page.evaluate(() => ({
        hasPage: Boolean(document.querySelector('.q-page')),
        scrollWidth: document.scrollingElement!.scrollWidth,
        innerWidth: window.innerWidth
      }))
      expect(
        measured.hasPage,
        `E-stop: ${route} rendered no .q-page — ask, do not assert a negative`
      ).toBe(true)
      if (measured.scrollWidth > measured.innerWidth + 1) {
        widened.push(
          `${route} → ${measured.scrollWidth}px on a ${measured.innerWidth}px viewport`
        )
      }
    }

    expect(
      widened,
      `routes widening the document:\n${widened.join('\n')}`
    ).toEqual([])
  })

  test('the agenda scrolls its canvas inside a container it owns', async ({
    browser
  }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: MOBILE.width, height: MOBILE.height })
    await login({ page, email: ADMIN.email, password: ADMIN.password })
    await page.goto('/employee/agenda/2030-01-01')
    await page.waitForLoadState('networkidle')

    const container = await page.evaluate(() => {
      const el = document.querySelector('.agenda-scroll')
      if (!el) return null
      return {
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        tabindex: el.getAttribute('tabindex')
      }
    })
    expect(
      container,
      'E-stop: .agenda-scroll is missing — ask, do not assert a negative'
    ).not.toBe(null)
    expect(
      container!.scrollWidth,
      'the 600px canvas stays wider than the phone'
    ).toBeGreaterThan(container!.clientWidth)
    expect(
      container!.tabindex,
      'the scroll container is keyboard-reachable'
    ).toBe('0')
  })
})

import { test } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { initializePage, login } from './setup'

/**
 * Geometry probe for the layout audit: numbers, not impressions, for every
 * route × viewport — what overflows the document, what is clipped with no
 * horizontal scroller between it and the viewport (unreachable), what text is
 * cut without an ellipsis, and which touch targets are undersized.
 *
 * Named `screenshots-*` on purpose: `playwright.config.ts` testIgnores that
 * prefix unless `PLAYWRIGHT_ALLOW_SCREENSHOTS=1`, so the probe never runs in the
 * default suite (the assertions it turns into land as `frontend/*.spec.ts`).
 *
 * Run (test stack up):
 *   cd packages/api
 *   PLAYWRIGHT_ALLOW_SCREENSHOTS=1 pnpm exec playwright test \
 *     tests/e2e/screenshots-layout-probe.spec.ts --reporter=list
 *
 * One JSON line per route×viewport lands in
 * `test-results/layout-probe.jsonl`.
 */

const OUT = 'test-results/layout-probe.jsonl'

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }
const CUSTOMER = { email: 'test1@petboarding.app', password: 'qjiNWdT8L' }

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 }
] as const

const ADMIN_ROUTES: [string, string][] = [
  ['/', 'home'],
  ['/availability', 'availability'],
  ['/information', 'information'],
  ['/user', 'user'],
  ['/_audit-not-a-route', 'error404'],
  ['/admin', 'admin-home'],
  ['/admin/financial', 'admin-financial'],
  ['/admin/financial/overview', 'admin-financial-overview'],
  ['/admin/financial/bookings', 'admin-financial-bookings'],
  ['/admin/accounts', 'admin-accounts'],
  ['/admin/bookings', 'admin-bookings'],
  ['/admin/daycare', 'admin-daycare'],
  ['/admin/occupancy', 'admin-occupancy'],
  ['/admin/announcements', 'admin-announcements'],
  ['/admin/periods', 'admin-periods'],
  ['/admin/configuration', 'admin-configuration'],
  ['/admin/configuration/categories', 'admin-config-categories'],
  ['/admin/configuration/services', 'admin-config-services'],
  ['/admin/configuration/openingtimes', 'admin-config-openingtimes'],
  ['/admin/configuration/integrations', 'admin-config-integrations'],
  [
    '/admin/configuration/daycaresubscriptions',
    'admin-config-daycaresubscriptions'
  ],
  ['/admin/configuration/buildings', 'admin-config-buildings'],
  ['/admin/configuration/kennels', 'admin-config-kennels'],
  ['/admin/configuration/documents', 'admin-config-documents'],
  ['/admin/configuration/vacations', 'admin-config-vacations'],
  ['/employee', 'employee-home'],
  ['/employee/overview', 'employee-overview'],
  ['/employee/agenda', 'employee-agenda'],
  ['/employee/customers', 'employee-customers'],
  ['/employee/customers/1', 'employee-customer-detail'],
  ['/employee/pets', 'employee-pets'],
  ['/employee/pets/2', 'employee-pet-detail'],
  ['/employee/bookings', 'employee-bookings'],
  ['/employee/bookings/1', 'employee-booking-detail'],
  ['/employee/labels/pets/2', 'employee-labels-pets'],
  ['/employee/labels/bookings/1', 'employee-labels-bookings'],
  ['/employee/kennellayout', 'employee-kennellayout'],
  ['/print/kennellayout', 'print-kennellayout'],
  [
    `/print/overview/${new Date().toISOString().slice(0, 10)}`,
    'print-overview'
  ],
  ['/print/pets/2', 'print-pets-labels'],
  ['/print/bookings/1', 'print-bookings-labels'],
  ['/print/termsandconditions', 'print-termsandconditions'],
  ['/print/privacypolicy', 'print-privacypolicy']
]

const CUSTOMER_ROUTES: [string, string][] = [
  ['/account', 'account-home'],
  ['/account/customer', 'account-customer'],
  ['/account/contactpeople', 'account-contactpeople'],
  ['/account/pets', 'account-pets'],
  ['/account/bookings', 'account-bookings'],
  ['/account/daycare', 'account-daycare']
]

const SLOW = /agenda|kennellayout|occupancy|overview/
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** The in-page measurement. Runs after each route settles. */
const measure = () => {
  const vw = window.innerWidth
  const doc = document.scrollingElement as HTMLElement

  const describe = (el: Element) => {
    const cls =
      typeof (el as HTMLElement).className === 'string'
        ? ((el as HTMLElement).className as string)
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 3)
            .join('.')
        : ''
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${
      cls ? `.${cls}` : ''
    }`
  }

  /** Nearest ancestor that scrolls horizontally (so the box IS reachable). */
  const scrollXAncestor = (el: Element) => {
    let node = el.parentElement
    while (node && node !== document.body) {
      const overflowX = getComputedStyle(node).overflowX
      if (
        overflowX === 'auto' ||
        overflowX === 'scroll' ||
        overflowX === 'overlay'
      )
        return node
      node = node.parentElement
    }
    return null
  }

  type Hit = {
    sel: string
    left: number
    right: number
    text: string
    scroller?: string
  }
  const clipped: Hit[] = [] // outside the viewport, no scroller → unreachable
  const reachable: Hit[] = [] // outside the viewport, but an ancestor scrolls
  const flagged = new Set<Element>()

  for (const el of document.body.querySelectorAll('*')) {
    const r = el.getBoundingClientRect()
    if (r.width < 1 || r.height < 1) continue
    if (r.right <= vw + 1 && r.left >= -1) continue
    // Outermost offender only: a parent already flagged makes its children noise.
    if (el.parentElement && flagged.has(el.parentElement)) continue
    flagged.add(el)
    const scroller = scrollXAncestor(el)
    const hit: Hit = {
      sel: describe(el),
      left: Math.round(r.left),
      right: Math.round(r.right),
      text: (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 70)
    }
    if (scroller) hit.scroller = describe(scroller)
    ;(scroller ? reachable : clipped).push(hit)
  }

  // Text cut by its box without an ellipsis (ellipsis = deliberate truncation).
  const textClipped: {
    sel: string
    scroll: number
    client: number
    text: string
  }[] = []
  for (const el of document.body.querySelectorAll('*')) {
    if (el.children.length) continue
    const text = (el.textContent ?? '').trim()
    if (!text) continue
    const cs = getComputedStyle(el)
    if (cs.overflowX !== 'hidden' && cs.overflow !== 'hidden') continue
    if (cs.textOverflow === 'ellipsis') continue
    const box = el as HTMLElement
    if (box.scrollWidth > box.clientWidth + 1 && box.clientWidth > 0) {
      textClipped.push({
        sel: describe(el),
        scroll: box.scrollWidth,
        client: box.clientWidth,
        text: text.replace(/\s+/g, ' ').slice(0, 70)
      })
    }
  }

  // Touch targets: interactive boxes smaller than 32px in either dimension.
  const smallTargets: { sel: string; w: number; h: number; text: string }[] = []
  const seen = new Set<Element>()
  for (const el of document.body.querySelectorAll(
    'button, a, [role="button"], input, select, textarea'
  )) {
    if (seen.has(el)) continue
    seen.add(el)
    const r = el.getBoundingClientRect()
    if (r.width < 1 || r.height < 1) continue
    if (r.bottom < 0 || r.top > window.innerHeight) continue // off-screen: not actionable now
    if (r.width >= 32 && r.height >= 32) continue
    smallTargets.push({
      sel: describe(el),
      w: Math.round(r.width),
      h: Math.round(r.height),
      text: (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40)
    })
  }

  // Horizontal scrollers inside the page (DESIGN.md-sanctioned min-width canvas).
  const pageScrollers: string[] = []
  for (const el of document.body.querySelectorAll('*')) {
    const cs = getComputedStyle(el)
    if (cs.overflowX !== 'auto' && cs.overflowX !== 'scroll') continue
    if ((el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth + 1)
      pageScrollers.push(describe(el))
  }

  return {
    vw,
    docScrollWidth: doc.scrollWidth,
    docOverflowX: doc.scrollWidth - vw,
    clipped,
    reachable,
    textClipped,
    smallTargets,
    pageScrollers
  }
}

async function shootAll(
  page: import('@playwright/test').Page,
  routes: [string, string][],
  role: string,
  viewport: (typeof VIEWPORTS)[number]
) {
  for (const [route, slug] of routes) {
    await page.goto(route).catch(() => {})
    await page
      .waitForLoadState('networkidle', { timeout: 8000 })
      .catch(() => {})
    await delay(SLOW.test(route) ? 3500 : 2000)
    const report = await page.evaluate(measure).catch((error) => ({
      error: String(error)
    }))
    fs.appendFileSync(
      OUT,
      JSON.stringify({
        role,
        viewport: viewport.name,
        size: `${viewport.width}x${viewport.height}`,
        route,
        slug,
        ...report
      }) + '\n'
    )
  }
}

for (const viewport of VIEWPORTS) {
  test(`layout probe — admin — ${viewport.name}`, async ({ browser }) => {
    test.setTimeout(900000)
    fs.mkdirSync(path.dirname(OUT), { recursive: true })
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height
    })
    await shootAll(page, ADMIN_ROUTES, 'admin', viewport)
    await page.context().close()
  })

  test(`layout probe — customer — ${viewport.name}`, async ({ browser }) => {
    test.setTimeout(300000)
    fs.mkdirSync(path.dirname(OUT), { recursive: true })
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: CUSTOMER.email, password: CUSTOMER.password })
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height
    })
    await shootAll(page, CUSTOMER_ROUTES, 'customer', viewport)
    await page.context().close()
  })
}

import { test, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { initializePage, login } from './setup'

/**
 * Colour/contrast/geometry probe for the layout audit — the half of the review a
 * screenshot would only show you by eye: text that fails contrast against its
 * real background, links still rendering in the browser's default blue, status
 * badges collapsing to one colour in dark mode, and grid cards that do not fill
 * the column they were given.
 *
 * One JSON line per route × viewport × theme in `test-results/contrast-probe.jsonl`.
 *
 * Named `screenshots-*` on purpose: `playwright.config.ts` testIgnores that
 * prefix, so this never runs in the default suite.
 *
 * Run (test stack up):
 *   cd packages/api
 *   PLAYWRIGHT_ALLOW_SCREENSHOTS=1 pnpm exec playwright test \
 *     tests/e2e/screenshots-contrast.spec.ts --reporter=list
 */

const OUT = 'test-results/contrast-probe.jsonl'

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }
const CUSTOMER = { email: 'test1@petboarding.app', password: 'qjiNWdT8L' }

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 }
] as const

const TODAY = new Date().toISOString().slice(0, 10)

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
  ['/employee', 'employee-home'],
  ['/employee/overview', 'employee-overview'],
  ['/employee/agenda', 'employee-agenda'],
  ['/employee/customers', 'employee-customers'],
  ['/employee/customers/1', 'employee-customer-detail'],
  ['/employee/pets', 'employee-pets'],
  ['/employee/pets/2', 'employee-pet-detail'],
  ['/employee/bookings', 'employee-bookings'],
  ['/employee/bookings/1', 'employee-booking-detail'],
  ['/employee/kennellayout', 'employee-kennellayout'],
  [`/print/overview/${TODAY}`, 'print-overview']
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
  type RGB = { r: number; g: number; b: number; a: number }
  const parse = (value: string): RGB | null => {
    const match = value.match(/rgba?\(([^)]+)\)/)
    if (!match) return null
    const parts = match[1].split(',').map((p) => Number.parseFloat(p))
    return {
      r: parts[0],
      g: parts[1],
      b: parts[2],
      a: parts[3] === undefined ? 1 : parts[3]
    }
  }
  const luminance = ({ r, g, b }: RGB) => {
    const channel = (c: number) => {
      const s = c / 255
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
  }
  const ratio = (a: RGB, b: RGB) => {
    const la = luminance(a)
    const lb = luminance(b)
    const hi = Math.max(la, lb)
    const lo = Math.min(la, lb)
    return (hi + 0.05) / (lo + 0.05)
  }
  /** First opaque background walking up the tree (what the text really sits on). */
  const effectiveBackground = (el: Element): RGB => {
    let node: Element | null = el
    while (node) {
      const bg = parse(getComputedStyle(node).backgroundColor)
      if (bg && bg.a > 0.9) return bg
      node = node.parentElement
    }
    return { r: 255, g: 255, b: 255, a: 1 }
  }
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
  const visible = (el: Element) => {
    const style = getComputedStyle(el)
    if (style.visibility === 'hidden' || style.display === 'none') return false
    if (Number.parseFloat(style.opacity || '1') < 0.1) return false
    const box = el.getBoundingClientRect()
    return box.width >= 1 && box.height >= 1
  }
  const label = (el: Element) =>
    (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 60)

  // 1. Contrast of every visible text run against its real background.
  const lowContrast: {
    sel: string
    text: string
    fg: string
    bg: string
    ratio: number
    size: number
    weight: string
  }[] = []
  for (const el of document.body.querySelectorAll('*')) {
    if (el.children.length) continue
    const text = (el.textContent ?? '').trim()
    if (!text) continue
    if (!visible(el)) continue
    const style = getComputedStyle(el)
    const fg = parse(style.color)
    if (!fg) continue
    const size = Number.parseFloat(style.fontSize)
    const weight = style.fontWeight
    const large =
      size >= 24 ||
      (size >= 18.66 &&
        (weight === '700' || weight === 'bold' || Number(weight) >= 700))
    const bg = effectiveBackground(el)
    const value = ratio(fg, bg)
    if (value < (large ? 3 : 4.5)) {
      lowContrast.push({
        sel: describe(el),
        text: label(el),
        fg: style.color,
        bg: `rgb(${bg.r}, ${bg.g}, ${bg.b})`,
        ratio: Number(value.toFixed(2)),
        size: Number(size.toFixed(1)),
        weight: String(weight)
      })
    }
  }

  // 2. Links still wearing the browser's default blue — the theme owns links.
  const uaLinks: { sel: string; text: string; color: string; href: string }[] =
    []
  for (const el of document.body.querySelectorAll('a[href]')) {
    if (!visible(el)) continue
    const color = getComputedStyle(el).color
    if (color === 'rgb(0, 0, 238)' || color === 'rgb(0, 0, 204)') {
      uaLinks.push({
        sel: describe(el),
        text: label(el),
        color,
        href: (el as HTMLAnchorElement).getAttribute('href') ?? ''
      })
    }
  }

  // 3. Status badges: how many distinct colours actually render.
  const badges: { text: string; color: string; bg: string }[] = []
  for (const el of document.body.querySelectorAll('.q-badge')) {
    if (!visible(el)) continue
    const style = getComputedStyle(el)
    badges.push({
      text: label(el),
      color: style.color,
      bg: style.backgroundColor
    })
  }

  // 4. Grid cards: does the card fill the column it sits in?
  const cards: { sel: string; card: number; parent: number; gap: number }[] = []
  for (const el of document.body.querySelectorAll(
    '.q-styled-card, .q-card, [class*="col-"] > .q-card, [class*="col-"] > * > .q-card'
  )) {
    if (!visible(el)) continue
    const parent = el.parentElement
    if (!parent) continue
    const cardBox = el.getBoundingClientRect()
    const parentBox = parent.getBoundingClientRect()
    if (parentBox.width < 200) continue
    // Only when the parent is a real column (a single card in a row).
    const siblings = Array.from(parent.children).filter((c) => c !== el)
    if (siblings.length) continue
    cards.push({
      sel: describe(el),
      card: Math.round(cardBox.width),
      parent: Math.round(parentBox.width),
      gap: Math.round(parentBox.width - cardBox.width)
    })
  }

  return {
    theme: document.body.classList.contains('body--dark') ? 'dark' : 'light',
    lowContrast: lowContrast.slice(0, 25),
    lowContrastCount: lowContrast.length,
    uaLinks,
    badges,
    badgeColors: [...new Set(badges.map((b) => b.bg))],
    cards: cards.slice(0, 20),
    cardCapped: cards.filter((c) => c.parent - c.card > 60).length
  }
}

/** Turn dark on through the real toggle, falling back to the class Quasar sets. */
async function setDark(page: Page) {
  const isDark = () =>
    page.evaluate(() => document.body.classList.contains('body--dark'))
  if (await isDark()) return
  const menuButton = page.locator('.q-btn:has(.i-mdi-more-vert)').first()
  if (await menuButton.count()) {
    try {
      await menuButton.click({ timeout: 3000 })
      const toggle = page.locator('.q-menu .q-toggle').last()
      await toggle.waitFor({ state: 'visible', timeout: 5000 })
      await toggle.click({ timeout: 3000 })
      await page.keyboard.press('Escape')
    } catch {
      await page.evaluate(() => document.body.classList.add('body--dark'))
    }
  } else {
    await page.evaluate(() => document.body.classList.add('body--dark'))
  }
}

async function sweep(
  page: Page,
  routes: [string, string][],
  role: string,
  viewport: (typeof VIEWPORTS)[number],
  dark: boolean
) {
  for (const [route, slug] of routes) {
    await page.goto(route).catch(() => {})
    await page
      .waitForLoadState('networkidle', { timeout: 8000 })
      .catch(() => {})
    if (dark) await setDark(page)
    await delay(SLOW.test(route) ? 3000 : 1500)
    const report = await page.evaluate(measure).catch((error) => ({
      error: String(error)
    }))
    fs.appendFileSync(
      OUT,
      JSON.stringify({
        role,
        viewport: viewport.name,
        size: `${viewport.width}x${viewport.height}`,
        theme: dark ? 'dark' : 'light',
        route,
        slug,
        ...report
      }) + '\n'
    )
  }
}

for (const viewport of VIEWPORTS) {
  for (const dark of [false, true]) {
    test(`colour probe — admin — ${viewport.name} — ${
      dark ? 'dark' : 'light'
    }`, async ({ browser }) => {
      test.setTimeout(900000)
      fs.mkdirSync(path.dirname(OUT), { recursive: true })
      const page = await initializePage({ browser })
      await page.setViewportSize({ width: 1440, height: 900 })
      await login({ page, email: ADMIN.email, password: ADMIN.password })
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      })
      await sweep(page, ADMIN_ROUTES, 'admin', viewport, dark)
      await page.context().close()
    })

    test(`colour probe — customer — ${viewport.name} — ${
      dark ? 'dark' : 'light'
    }`, async ({ browser }) => {
      test.setTimeout(300000)
      fs.mkdirSync(path.dirname(OUT), { recursive: true })
      const page = await initializePage({ browser })
      await page.setViewportSize({ width: 1440, height: 900 })
      await login({ page, email: CUSTOMER.email, password: CUSTOMER.password })
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      })
      await sweep(page, CUSTOMER_ROUTES, 'customer', viewport, dark)
      await page.context().close()
    })
  }
}

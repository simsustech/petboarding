import { test } from '@playwright/test'
import { initializePage, login } from './setup'

/**
 * Token probe: for a handful of suspicious elements, print the real computed
 * colours up the ancestor chain, so a contrast reading can be told apart from a
 * `color-mix()` background the parser could not read. Debug aid for the layout
 * audit; `screenshots-*` keeps it out of the default suite.
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }

const dump = (selectors: string[]) => ({
  selectors,
  bodyDark: document.body.classList.contains('body--dark'),
  vars: {
    primary: getComputedStyle(document.body).getPropertyValue('--q-primary'),
    onPrimary: getComputedStyle(document.body).getPropertyValue(
      '--q-on-primary'
    ),
    onSurface: getComputedStyle(document.body).getPropertyValue(
      '--q-on-surface'
    ),
    surface: getComputedStyle(document.body).getPropertyValue('--q-surface')
  },
  found: selectors.map((selector) => {
    const el = document.querySelector(selector)
    if (!el) return { selector, missing: true }
    const chain: {
      tag: string
      cls: string
      color: string
      background: string
      mix: string
    }[] = []
    let node: Element | null = el
    while (node && node !== document.documentElement) {
      const style = getComputedStyle(node)
      chain.push({
        tag: node.tagName.toLowerCase(),
        cls:
          typeof node.className === 'string' ? node.className.slice(0, 70) : '',
        color: style.color,
        background: style.backgroundColor,
        mix: style.getPropertyValue('--q-bg-opacity') || ''
      })
      node = node.parentElement
    }
    return {
      selector,
      text: (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 50),
      chain
    }
  })
})

test('token probe — dark mode suspects', async ({ browser }) => {
  test.setTimeout(300000)
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })

  const routes: [string, string[]][] = [
    [
      '/availability',
      [
        '.q-date__calendar-item--in button.q-btn',
        '.q-date__calendar-item span.block'
      ]
    ],
    ['/_audit-not-a-route', ['.q-page .q-btn', '.q-page .text-primary']],
    ['/information', ['a[href="/print/termsandconditions"]']],
    ['/employee/pets', ['.q-pa-lg.flex.flex-center']]
  ]

  for (const [route, selectors] of routes) {
    await page.goto(route).catch(() => {})
    await page
      .waitForLoadState('networkidle', { timeout: 8000 })
      .catch(() => {})
    await page.evaluate(() => document.body.classList.add('body--dark'))
    await page.waitForTimeout(1500)
    const report = await page.evaluate(dump, selectors)
    const explanation = await page.evaluate((selector) => {
      const el = document.querySelector(selector)
      if (!el) return { selector, missing: true }
      const hits: {
        rule: string
        bg: string
        color: string
        spec: number
        order: number
      }[] = []
      let order = 0
      for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRuleList | undefined
        try {
          rules = sheet.cssRules
        } catch {
          continue
        }
        for (const rule of Array.from(rules ?? [])) {
          if (!(rule instanceof CSSStyleRule)) continue
          order += 1
          for (const part of rule.selectorText.split(',')) {
            const single = part.trim()
            try {
              if (!el.matches(single)) continue
            } catch {
              continue
            }
            const bg = rule.style.getPropertyValue('background-color')
            const color = rule.style.getPropertyValue('color')
            if (!bg && !color) continue
            hits.push({
              rule: single.slice(0, 80),
              bg: bg || '-',
              color: color || '-',
              spec: (single.match(/\./g) ?? []).length,
              order
            })
          }
        }
      }
      return { selector: 'matched-by-count', hits }
    }, selectors[0])
    console.log(
      `\n### rules for ${selectors[0]}\n${JSON.stringify(explanation, null, 2)}`
    )
    console.log(`\n### ${route}\n${JSON.stringify(report, null, 2)}`)
  }

  await page.context().close()
})

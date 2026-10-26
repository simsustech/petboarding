import { test } from '@playwright/test'
import { initializePage, login } from './setup'

/**
 * One-shot interrogation of the suspects the static probe flagged (or could not
 * decide): the mobile footer tab overflow, the booking row's off-screen anchors,
 * the header menus' open/close behaviour, dialog Escape dismissal, the agenda
 * swipe hint, and the availability link's colour.
 *
 * Like the probe it is named `screenshots-*`, so the default suite ignores it
 * and `PLAYWRIGHT_ALLOW_SCREENSHOTS=1` opts in. Prints one JSON line per check;
 * assertions are deliberately loose (evidence gathering), the fixes get their
 * own `frontend/*.spec.ts` regression guards.
 *
 *   cd packages/api
 *   PLAYWRIGHT_ALLOW_SCREENSHOTS=1 pnpm exec playwright test \
 *     tests/e2e/screenshots-interrogate.spec.ts --reporter=list
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }

const emit = (check: string, data: unknown) =>
  console.log(`INTERROGATE ${check}: ${JSON.stringify(data)}`)

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

test('interrogate: mobile footer tabs + booking row anchors', async ({
  browser
}) => {
  test.setTimeout(180000)
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })
  await page.setViewportSize({ width: 375, height: 812 })

  await page.goto('/admin/bookings')
  await page.waitForLoadState('networkidle').catch(() => {})
  await delay(2500)

  emit(
    'footer-tabs',
    await page.evaluate(() => {
      const content = document.querySelector('.q-tabs__content')
      const bar = document.querySelector('.q-tabs')
      const tabs = Array.from(document.querySelectorAll('.q-tabs .q-tab')).map(
        (el) => {
          const r = el.getBoundingClientRect()
          return {
            label: (el.textContent ?? '').trim(),
            x: Math.round(r.x),
            w: Math.round(r.width)
          }
        }
      )
      const arrows = Array.from(
        document.querySelectorAll('.q-tabs__arrow')
      ).map((el) => {
        const r = el.getBoundingClientRect()
        return {
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.width)
        }
      })
      const cs = content ? getComputedStyle(content) : null
      return {
        barRect: bar ? Math.round(bar.getBoundingClientRect().width) : null,
        scrollWidth: content?.scrollWidth,
        clientWidth: content?.clientWidth,
        overflowX: cs?.overflowX,
        tabs,
        arrows,
        docOverflow:
          (document.scrollingElement?.scrollWidth ?? 0) - window.innerWidth
      }
    })
  )

  emit(
    'booking-row-anchors',
    await page.evaluate(() => {
      const row = document.querySelector(
        '.q-expansion-item, .q-item, .q-table__row'
      )
      const links = Array.from(document.querySelectorAll('a')).filter((a) =>
        (a.textContent ?? '').includes('January 1, 2026')
      )
      return links.map((a) => {
        const r = a.getBoundingClientRect()
        const p = a.parentElement
        const pcs = p ? getComputedStyle(p) : null
        let scrollAncestor: string | null = null
        let n = a.parentElement
        while (n && n !== document.body) {
          const o = getComputedStyle(n).overflowX
          if (o === 'auto' || o === 'scroll') {
            scrollAncestor = `${n.tagName.toLowerCase()}.${n.className}`
            break
          }
          n = n.parentElement
        }
        return {
          text: (a.textContent ?? '').trim().slice(0, 80),
          rect: {
            x: Math.round(r.x),
            right: Math.round(r.right),
            w: Math.round(r.width)
          },
          self: {
            display: getComputedStyle(a).display,
            whiteSpace: getComputedStyle(a).whiteSpace,
            overflow: getComputedStyle(a).overflow,
            textOverflow: getComputedStyle(a).textOverflow
          },
          parent: p
            ? {
                sel: `${p.tagName.toLowerCase()}.${p.className}`,
                rect: {
                  x: Math.round(p.getBoundingClientRect().x),
                  right: Math.round(p.getBoundingClientRect().right)
                },
                overflow: pcs?.overflow,
                textOverflow: pcs?.textOverflow,
                whiteSpace: pcs?.whiteSpace
              }
            : null,
          scrollAncestor,
          rows: anchorCount(row)
        }
      })
      function anchorCount(el: Element | null) {
        return el ? el.querySelectorAll('a').length : 0
      }
    })
  )

  // Header menus: ONE click each, then geometry, then Escape.
  const kebab = page.locator('header button').last()
  await kebab.click({ timeout: 5000 }).catch(async () => {
    await kebab.dispatchEvent('click')
  })
  await delay(600)
  emit(
    'kebab-menu',
    await page.evaluate(() => {
      const menus = Array.from(document.querySelectorAll('.q-menu'))
      return menus.map((m) => {
        const r = m.getBoundingClientRect()
        return {
          visible: r.width > 0 && r.height > 0,
          rect: {
            x: Math.round(r.x),
            y: Math.round(r.y),
            w: Math.round(r.width),
            h: Math.round(r.height)
          },
          inViewport:
            r.x >= 0 &&
            r.y >= 0 &&
            r.right <= window.innerWidth + 1 &&
            r.bottom <= window.innerHeight + 1
        }
      })
    })
  )
  await page.keyboard.press('Escape')
  await delay(500)
  emit(
    'kebab-menu-after-escape',
    await page.evaluate(() => document.querySelectorAll('.q-menu').length)
  )

  const avatar = page.locator(
    'header button.q-btn--round:not([aria-label=Menu])'
  )
  await avatar.click({ timeout: 5000 }).catch(async () => {
    await avatar.dispatchEvent('click')
  })
  await delay(600)
  emit(
    'user-menu',
    await page.evaluate(() =>
      Array.from(document.querySelectorAll('.q-menu')).map((m) => {
        const r = m.getBoundingClientRect()
        return { w: Math.round(r.width), h: Math.round(r.height) }
      })
    )
  )
  await page.keyboard.press('Escape')

  await page.context().close()
})

test('interrogate: pet edit dialog Escape + availability link + occupancy field', async ({
  browser
}) => {
  test.setTimeout(180000)
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })

  // --- dialog Escape
  await page.goto('/employee/pets/2')
  await page.waitForLoadState('networkidle').catch(() => {})
  await delay(2500)
  await page.getByTestId('edit-button').first().click({ timeout: 8000 })
  await delay(1200)
  emit(
    'dialog-open',
    await page.evaluate(() => document.querySelectorAll('.q-dialog').length)
  )
  await page.keyboard.press('Escape')
  await delay(900)
  emit(
    'dialog-after-escape',
    await page.evaluate(() => ({
      dialogs: document.querySelectorAll('.q-dialog').length,
      visible: Array.from(document.querySelectorAll('.q-dialog')).filter(
        (d) => d.getBoundingClientRect().height > 0
      ).length
    }))
  )
  // close it properly for the rest of the run
  await page.keyboard.press('Escape')
  await delay(600)

  // --- availability link colour
  await page.goto('/availability')
  await page.waitForLoadState('networkidle').catch(() => {})
  await delay(1500)
  emit(
    'availability-link',
    await page.evaluate(() => {
      const a = document.querySelector(
        'a[href="/account/bookings"]'
      ) as HTMLElement | null
      if (!a) return null
      const cs = getComputedStyle(a)
      return {
        color: cs.color,
        textDecoration: cs.textDecorationLine,
        classes: a.className
      }
    })
  )

  // --- occupancy date field vs agenda date field
  await page.goto('/admin/occupancy')
  await page.waitForLoadState('networkidle').catch(() => {})
  await delay(2500)
  emit(
    'occupancy-field',
    await page.evaluate(() => {
      const field = document.querySelector('.q-page .q-field')
      if (!field) return null
      const label = field.querySelector('.q-field__label')
      const r = field.getBoundingClientRect()
      return {
        label: label?.textContent?.trim() ?? null,
        labelStyle: label ? getComputedStyle(label).position : null,
        h: Math.round(r.height),
        inputType: field.querySelector('input')?.type ?? null
      }
    })
  )

  await page.goto('/employee/agenda')
  await page.waitForLoadState('networkidle').catch(() => {})
  await delay(3000)
  emit(
    'agenda-hint-desktop',
    await page.evaluate(() => {
      const hint = Array.from(document.querySelectorAll('.q-page div')).find(
        (d) => (d.textContent ?? '').includes('Swipe to see')
      )
      const scroll = document.querySelector('.agenda-scroll')
      return {
        hintPresent: Boolean(hint),
        hintDisplay: hint ? getComputedStyle(hint).display : null,
        scroll: scroll
          ? {
              scrollWidth: scroll.scrollWidth,
              clientWidth: scroll.clientWidth
            }
          : null
      }
    })
  )

  await page.setViewportSize({ width: 768, height: 1024 })
  await delay(2500)
  emit(
    'agenda-hint-tablet',
    await page.evaluate(() => {
      const hint = Array.from(document.querySelectorAll('.q-page div')).find(
        (d) => (d.textContent ?? '').includes('Swipe to see')
      )
      const scroll = document.querySelector('.agenda-scroll')
      return {
        hintVisible: hint
          ? hint.getBoundingClientRect().height > 0 &&
            getComputedStyle(hint).display !== 'none'
          : false,
        scroll: scroll
          ? {
              scrollWidth: scroll.scrollWidth,
              clientWidth: scroll.clientWidth
            }
          : null
      }
    })
  )

  await page.setViewportSize({ width: 375, height: 812 })
  await delay(2500)
  emit(
    'agenda-hint-mobile',
    await page.evaluate(() => {
      const hint = Array.from(document.querySelectorAll('.q-page div')).find(
        (d) => (d.textContent ?? '').includes('Swipe to see')
      )
      const scroll = document.querySelector('.agenda-scroll')
      return {
        hintVisible: hint
          ? hint.getBoundingClientRect().height > 0 &&
            getComputedStyle(hint).display !== 'none'
          : false,
        scroll: scroll
          ? {
              scrollWidth: scroll.scrollWidth,
              clientWidth: scroll.clientWidth
            }
          : null
      }
    })
  )

  await page.context().close()
})

test('interrogate: drawer label widths at mobile', async ({ browser }) => {
  test.setTimeout(120000)
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1440, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/admin/bookings')
  await page.waitForLoadState('networkidle').catch(() => {})
  await delay(2000)
  await page.locator('button[aria-label="Menu"]').first().click()
  await delay(1200)
  emit(
    'drawer-labels',
    await page.evaluate(() =>
      Array.from(document.querySelectorAll('.q-drawer .q-item__label')).map(
        (el) => {
          const box = el as HTMLElement
          const r = box.getBoundingClientRect()
          return {
            text: (box.textContent ?? '').trim().slice(0, 30),
            w: Math.round(r.width),
            scrollW: box.scrollWidth,
            clientW: box.clientWidth,
            clipped: box.scrollWidth > box.clientWidth + 1
          }
        }
      )
    )
  )
  await page.context().close()
})

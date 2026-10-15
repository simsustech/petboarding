import { test, expect, type Page } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * The pet card's alerts row. Four defects this pins, each measured in a browser
 * rather than read off the markup:
 *
 * 1. the window was never rendered, so an expired alert looked live;
 * 2. the delete control was a 48x48 Quasar button inside a 16px chip, so it
 *    spilled 16px above and below its own chip and the next alert's button
 *    covered it — clicking the x printed on "Aggressive" opened "Diabetic"'s
 *    confirmation;
 * 3. the chip carried white text on a 400-shade status fill (1.53:1 on yellow,
 *    2.77:1 on red), where the design system's recipe is a status fill under ink;
 * 4. the icon-only controls had no accessible name at all.
 *
 * `/employee/pets/2` is the seeded pet with alerts: "Aggressive" (a closed
 * window) and "Diabetic" (no window at all).
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }
const ROUTE = '/employee/pets/2'

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
      return
    } catch {
      // fall through to the class Quasar would have set
    }
  }
  await page.evaluate(() => document.body.classList.add('body--dark'))
}

/** One atomic read of the alerts block: measured, not inferred from markup. */
const readAlerts = () => {
  type RGB = { r: number; g: number; b: number; a: number }
  const parseRaw = (value: string): RGB | null => {
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
  /**
   * Colours resolved by the runtime theme come back as `oklab(...)`, which `rgb()`
   * parsing cannot read — the existing contrast probe silently skips those runs,
   * which is why dark mode has never been measured here. Convert the space
   * properly instead of reporting a tidy 0:1.
   */
  const parseOklab = (value: string): RGB | null => {
    const match = value.match(
      /oklab\(\s*([\d.]+%?)\s+(-?[\d.]+%?)\s+(-?[\d.]+%?)(?:\s*\/\s*([\d.]+%?))?\s*\)/
    )
    if (!match) return null
    const scale = (token: string, factor: number) =>
      token.endsWith('%')
        ? (Number.parseFloat(token) / 100) * factor
        : Number.parseFloat(token)
    const L = scale(match[1], 1)
    const a = scale(match[2], 0.4)
    const bb = scale(match[3], 0.4)
    const alpha = match[4] ? scale(match[4], 1) : 1
    const l = (L + 0.3963377774 * a + 0.2158037573 * bb) ** 3
    const m = (L - 0.1055613458 * a - 0.0638541728 * bb) ** 3
    const s = (L - 0.0894841775 * a - 1.291485548 * bb) ** 3
    const encode = (c: number) => {
      const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
      return Math.round(Math.min(1, Math.max(0, v)) * 255)
    }
    return {
      r: encode(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
      g: encode(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
      b: encode(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
      a: alpha
    }
  }
  const parse = (value: string): RGB | null =>
    parseRaw(value) ?? parseOklab(value)
  const luminance = ({ r, g, b }: RGB) => {
    const channel = (c: number) => {
      const s = c / 255
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
  }
  const ratio = (a: RGB, b: RGB) =>
    (Math.max(luminance(a), luminance(b)) + 0.05) /
    (Math.min(luminance(a), luminance(b)) + 0.05)
  /**
   * What the element really sits on: every translucent layer between it and the
   * page, composited in paint order. A tonal status tile is 30% opaque, so
   * "first opaque background walking up" would report the card surface and
   * quietly measure a colour that is not on screen.
   */
  const effectiveBackground = (el: Element): RGB => {
    const layers: RGB[] = []
    let node: Element | null = el
    while (node) {
      const bg = parse(getComputedStyle(node).backgroundColor)
      if (bg && bg.a > 0) layers.push(bg)
      if (bg && bg.a >= 0.999) break
      node = node.parentElement
    }
    let out: RGB = { r: 255, g: 255, b: 255, a: 1 }
    for (const layer of layers.reverse()) {
      out = {
        r: layer.r * layer.a + out.r * (1 - layer.a),
        g: layer.g * layer.a + out.g * (1 - layer.a),
        b: layer.b * layer.a + out.b * (1 - layer.a),
        a: 1
      }
    }
    return out
  }
  /** Contrast of an element's own colour against the surface it sits on. */
  const contrast = (el: Element) => {
    const fg = parse(getComputedStyle(el).color)
    if (!fg) return 0
    return Number(ratio(fg, effectiveBackground(el)).toFixed(2))
  }
  /**
   * Contrast against an explicit backdrop. An iconify glyph is painted with
   * `background-color: currentColor` behind a mask, so the icon's own background
   * is its ink — walking up from it measures ink against ink.
   */
  const contrastAgainst = (el: Element, backdrop: Element) => {
    const fg = parse(getComputedStyle(el).color)
    if (!fg) return 0
    return Number(ratio(fg, effectiveBackground(backdrop)).toFixed(2))
  }
  const box = (el: Element) => {
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, right: r.right, bottom: r.bottom }
  }
  const overlaps = (a: ReturnType<typeof box>, b: ReturnType<typeof box>) =>
    a.x < b.right && b.x < a.right && a.y < b.bottom && b.y < a.bottom

  const block = document.querySelector('[data-testid="pet-alerts"]')
  if (!block) return null
  const rows = Array.from(
    block.querySelectorAll('[data-testid="pet-alert-row"]')
  )

  const actions = Array.from(
    block.querySelectorAll<HTMLElement>('button, a[href], [role="button"]')
  ).map((el) => ({
    testid: el.getAttribute('data-testid'),
    name: (el.getAttribute('aria-label') ?? el.textContent ?? '').trim(),
    box: box(el)
  }))

  const overlapsFound: string[] = []
  for (let i = 0; i < actions.length; i++) {
    for (let j = i + 1; j < actions.length; j++) {
      if (overlaps(actions[i].box, actions[j].box)) {
        overlapsFound.push(
          `${actions[i].testid ?? actions[i].name} / ${actions[j].testid ?? actions[j].name}`
        )
      }
    }
  }

  return {
    theme: document.body.classList.contains('body--dark') ? 'dark' : 'light',
    rowCount: rows.length,
    windows: rows.map((row) =>
      (row.querySelector('[data-testid="pet-alert-window"]')?.textContent ?? '')
        .replace(/\s+/g, ' ')
        .trim()
    ),
    /** A one-line `q-item__label` ellipsizes: a hidden window is the defect here. */
    windowsClipped: rows.map((row) => {
      const el = row.querySelector('[data-testid="pet-alert-window"]')
      return el ? el.scrollWidth > el.clientWidth + 1 : false
    }),
    // A row-click convenience must not present itself as a button that contains
    // two buttons.
    rowRoles: rows.map((row) => row.getAttribute('role')),
    // The destructive control must not live inside the status shape.
    buttonsInsideTile: block.querySelectorAll('.q-badge .q-btn').length,
    tiles: rows.map((row) => {
      const tile = row.querySelector('[data-testid="pet-alert-tile"]')
      if (!tile) return null
      const glyph = tile.querySelector('.q-icon')
      return {
        fill: getComputedStyle(tile).backgroundColor,
        tileColor: getComputedStyle(tile).color,
        glyphColor: glyph ? getComputedStyle(glyph).color : null,
        glyphBackground: glyph ? getComputedStyle(glyph).backgroundColor : null,
        glyphContrast: glyph ? contrastAgainst(glyph, tile) : contrast(tile)
      }
    }),
    // Condition on the card surface, then the window's overline.
    textRuns: rows.map((row) =>
      Array.from(row.querySelectorAll('.q-item__label')).map((el) => ({
        text: (el.textContent ?? '').replace(/\s+/g, ' ').trim(),
        color: getComputedStyle(el).color,
        ratio: contrast(el)
      }))
    ),
    deleteIconContrast: rows.map((row) => {
      const btn = row.querySelector('[data-testid="delete-alert-button"]')
      if (!btn) return 0
      return contrastAgainst(btn.querySelector('.q-icon') ?? btn, btn)
    }),
    actions,
    overlaps: overlapsFound
  }
}

test('the alerts row shows the window, with no overlapping or unnamed controls', async ({
  browser
}) => {
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1280, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })
  await page.goto(ROUTE, { waitUntil: 'commit' })
  await page.getByText('name2').first().waitFor({ timeout: 20000 })
  await page.waitForLoadState('networkidle')

  for (const theme of ['light', 'dark'] as const) {
    if (theme === 'dark') await setDark(page)
    await page.waitForTimeout(300)
    const state = await page.evaluate(readAlerts)
    expect(state, `alerts block renders on ${ROUTE}`).not.toBeNull()
    const s = state!

    expect(s.rowCount, 'the seeded pet has alerts').toBeGreaterThan(0)
    expect(s.windows.length).toBe(s.rowCount)
    expect(
      s.windows.some((w) => /\d{4}/.test(w)),
      `a closed window renders its dates — got ${JSON.stringify(s.windows)}`
    ).toBe(true)
    expect(
      s.windowsClipped,
      `no window is ellipsized — got ${JSON.stringify(s.windows)}`
    ).toEqual(s.windows.map(() => false))
    expect(
      s.windows.join(' '),
      'an open end reads as a word, not a dash'
    ).toMatch(/Ongoing|Since|Until/)

    expect(
      s.rowRoles.filter((role) => role === 'button'),
      'a row-click convenience is not exposed as a button containing buttons'
    ).toEqual([])
    expect(
      s.buttonsInsideTile,
      'no control is nested inside the status shape'
    ).toBe(0)
    expect(
      s.tiles.filter(Boolean).length,
      'every alert carries its status tile'
    ).toBe(s.rowCount)

    for (const action of s.actions) {
      expect(
        action.name.length,
        `every control in the alerts block has an accessible name (${action.testid ?? '?'})`
      ).toBeGreaterThan(0)
    }

    expect(
      s.overlaps,
      `no two controls in the alerts block overlap (${theme})`
    ).toEqual([])

    for (const runs of s.textRuns) {
      for (const run of runs) {
        expect(
          run.ratio,
          `"${run.text}" clears 4.5:1 in ${theme} (measured ${run.ratio}:1, ${run.color})`
        ).toBeGreaterThanOrEqual(4.5)
      }
    }
    for (const tile of s.tiles) {
      expect(
        tile?.glyphContrast,
        `the status glyph clears 4.5:1 on its fill in ${theme} (fill ${tile?.fill}, tile ${tile?.tileColor}, glyph ${tile?.glyphColor}, glyph bg ${tile?.glyphBackground}, measured ${tile?.glyphContrast}:1)`
      ).toBeGreaterThanOrEqual(4.5)
    }
    // The destructive glyph is a graphic, so 3:1 (WCAG 1.4.11) is the floor —
    // and it must be a theme token, not a fixed palette shade that only clears
    // the floor in one scheme.
    for (const iconContrast of s.deleteIconContrast) {
      expect(
        iconContrast,
        `the delete glyph clears 3:1 in ${theme} (measured ${iconContrast}:1)`
      ).toBeGreaterThanOrEqual(3)
    }
  }
})

test('clicking the x painted on an alert deletes that alert', async ({
  browser
}) => {
  const page = await initializePage({ browser })
  await page.setViewportSize({ width: 1280, height: 900 })
  await login({ page, email: ADMIN.email, password: ADMIN.password })
  await page.goto(ROUTE, { waitUntil: 'commit' })
  await page.getByText('name2').first().waitFor({ timeout: 20000 })
  await page.waitForLoadState('networkidle')

  const rows = page.locator('[data-testid="pet-alert-row"]')
  const count = await rows.count()
  expect(count, 'the seeded pet has alerts').toBeGreaterThan(1)
  // The row sits far below the fold; aim at real coordinates only once it is
  // on screen.
  await rows.first().scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)

  for (let i = 0; i < count; i++) {
    const row = rows.nth(i)
    const label = (
      await row.locator('.q-item__label').first().innerText()
    ).trim()
    const deleteButton = row.locator('[data-testid="delete-alert-button"]')
    const glyph = await deleteButton.locator('.q-icon').boundingBox()
    expect(glyph, 'the delete glyph is measurable').not.toBeNull()

    // Aim at the visible glyph, not the locator: that is what a hand does.
    await page.mouse.click(
      glyph!.x + glyph!.width / 2,
      glyph!.y + glyph!.height / 2
    )
    await page.waitForTimeout(500)

    const dialog = page.locator('.q-dialog').first()
    await expect(dialog, 'the delete confirmation opens').toBeVisible()
    const text = (await dialog.innerText()).replace(/\s+/g, ' ').trim()
    // The confirmation is persistent, so Escape only shakes it: close it through
    // its own cancel action before aiming at the next alert.
    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(dialog, 'the confirmation closes').toBeHidden()

    expect(
      text,
      `the confirmation names "${label}", the alert whose x was clicked — got "${text}"`
    ).toContain(label)
  }
})

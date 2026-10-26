import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PET_ALERT_CONDITIONS } from '@petboarding/tools/constants'
// The UnoCSS config is transpiled to `.js` and executed by Node, so it cannot
// import `theme-tokens.ts` — and Vite refuses to load the config as a test import
// (`The URL must be of scheme file`). Read it as text instead: see the last test.
// `import.meta.url` is not a file URL in this environment, so the path comes from
// the package root vitest runs in.
const configSource = readFileSync(
  resolve(process.cwd(), 'vitrify.config.ts'),
  'utf8'
)
import {
  ALERT_TONES,
  BADGE_TONES,
  FILL_TOKENS,
  FOREGROUND_TOKENS,
  ICON_TONES,
  STATUS_TONES,
  TOKEN_NAMES,
  alertToken,
  badgeToken,
  iconToken,
  inkToken,
  statusToken,
  themeTokenColors,
  tokenSafelist,
  tokenTones
} from './theme-tokens.js'

/** Kebab the way the preset kebabizes a theme key (`quasar-theme.js`). */
const kebab = (key: string) => key.replace(/([A-Z])/g, '-$1').toLowerCase()

describe('status and alert colour tokens (ADR 005)', () => {
  it('names every status, condition, category and glyph', () => {
    expect(TOKEN_NAMES).toEqual([
      'status-approved',
      'status-rejected',
      'status-canceled',
      'status-pending',
      'status-standby',
      'alert-in-heat',
      'alert-needs-rest',
      'alert-aggressive',
      'alert-diabetic',
      'badge-food',
      'badge-medicines',
      'badge-vaccinations',
      'badge-appointment',
      'badge-double-booked',
      'icon-approved',
      'icon-rejected',
      'icon-canceled',
      'icon-pending',
      'icon-standby'
    ])
    // A condition added to the enum without a pair is already a type error in
    // `ALERT_TONES`; this catches the other half — a pair that never gets a name
    // and therefore never reaches CSS.
    expect(Object.keys(ALERT_TONES)).toEqual(
      Object.values(PET_ALERT_CONDITIONS)
    )
  })

  it('derives names through the helpers the call sites use', () => {
    expect(statusToken('standby')).toBe('status-standby')
    expect(alertToken(PET_ALERT_CONDITIONS.NEEDS_REST)).toBe('alert-needs-rest')
    expect(badgeToken('doubleBooked')).toBe('badge-double-booked')
    expect(iconToken('canceled')).toBe('icon-canceled')
    expect(inkToken('alert-diabetic')).toBe('on-alert-diabetic')
    // A fill has an ink; a foreground is the ink.
    expect(FILL_TOKENS).toContain('badge-food')
    expect(FOREGROUND_TOKENS).toContain('icon-approved')
    expect(FILL_TOKENS.some((token) => token.startsWith('icon-'))).toBe(false)
  })

  it('keeps the light half exactly as the palette painted it', () => {
    // The promise the change report makes to the client: a light theme does not
    // change. These are the wind4 palette values the app used before the tokens
    // (`.bg-green` was `rgb(74 222 128)`), read out of the built stylesheet.
    expect(Object.values(STATUS_TONES).map((tones) => tones.light)).toEqual([
      '#4ade80',
      '#f87171',
      '#ff5722',
      '#9e9e9e',
      '#facc15'
    ])
  })

  it('gives every token a dark half of its own', () => {
    for (const [name, tones] of Object.entries({
      ...STATUS_TONES,
      ...ALERT_TONES,
      ...BADGE_TONES,
      ...ICON_TONES
    })) {
      expect(tones.light, name).toMatch(/^#[0-9a-f]{6}$/)
      expect(tones.dark, name).toMatch(/^#[0-9a-f]{6}$/)
      expect(
        tones.dark,
        `${name} needs a dark value rather than its light one`
      ).not.toBe(tones.light)
    }
  })

  it('writes payload keys that kebabize back to the token names', () => {
    // `statusApproved` → `status-approved` is how a key reaches `--q-*`, and how
    // the utility finds it again. A mismatch here is an invisible token.
    const payload = tokenTones()
    for (const token of TOKEN_NAMES) {
      const key = Object.keys(payload.light).find(
        (candidate) => kebab(candidate) === token
      )
      expect(key, `no payload key kebabizes to ${token}`).toBeDefined()
      expect(
        payload.dark[key!],
        `${token} has no dark value in the payload`
      ).toMatch(/^#[0-9a-f]{6}$/)
    }
    expect(Object.keys(payload.light)).toHaveLength(TOKEN_NAMES.length)
    expect(Object.keys(payload.dark)).toHaveLength(TOKEN_NAMES.length)
  })

  it('emits a fill and an ink per token, and safelists what Quasar composes', () => {
    for (const token of FILL_TOKENS) {
      expect(themeTokenColors[token]).toBe(`var(--q-${token})`)
      // The ink is the scheme's own, so a deployment's source colour keeps
      // driving it instead of a hardcoded black/white pair.
      expect(themeTokenColors[`on-${token}`]).toBe('var(--q-on-surface)')
      // A `color=` prop composes these at runtime, where the content scan cannot
      // reach them.
      expect(tokenSafelist).toContain(`bg-${token}`)
      expect(tokenSafelist).toContain(`text-${token}`)
      expect(tokenSafelist).toContain(`text-on-${token}`)
    }
    for (const token of FOREGROUND_TOKENS) {
      expect(themeTokenColors[token]).toBe(`var(--q-${token})`)
      // A foreground *is* the ink, so there is nothing to put on it.
      expect(themeTokenColors[`on-${token}`]).toBeUndefined()
      expect(tokenSafelist).toContain(`text-${token}`)
    }
  })

  it('spells the tokens in the UnoCSS config, which cannot import this module', () => {
    // These three lists are the ones that can drift: the alerts are derived from
    // the enum on both sides, so a new condition reaches the config on its own.
    for (const name of [
      ...Object.keys(STATUS_TONES),
      ...Object.keys(BADGE_TONES),
      ...Object.keys(ICON_TONES)
    ]) {
      // A substring check, not a regex built from a value: the names are quoted
      // literals in the config, and interpolating into a pattern is the habit that
      // stops being safe the moment the value stops being one of ours.
      expect(
        configSource,
        `${name} is missing from vitrify.config.ts`
      ).toContain(`'${name}'`)
    }
    expect(
      configSource,
      'the config must derive alert tokens from the enum'
    ).toContain('PET_ALERT_CONDITIONS')
  })

  it('keeps every pair legible in both schemes', () => {
    // The values are derived, so the floor is asserted rather than trusted. The
    // surfaces and inks are the scheme's own, read out of the built stylesheet.
    // 4.5:1 is the body-text floor — stricter than the 3:1 an icon needs —
    // because these glyphs carry meaning rather than decorate.
    const luminance = (hex: string): number => {
      const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) => {
        const channel = Number.parseInt(hex.slice(i, i + 2), 16) / 255
        return channel <= 0.03928
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    const contrast = (a: string, b: string): number => {
      const x = luminance(a)
      const y = luminance(b)
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
    }
    const schemes = [
      { name: 'light', surface: '#fdfcff', ink: '#1a1c1e' },
      { name: 'dark', surface: '#1a1c1e', ink: '#e3e2e6' }
    ] as const

    for (const { name, surface, ink } of schemes) {
      const fills = { ...STATUS_TONES, ...ALERT_TONES, ...BADGE_TONES }
      for (const [token, tones] of Object.entries(fills)) {
        const fill = name === 'light' ? tones.light : tones.dark
        expect(
          contrast(fill, ink),
          `${token} fill under the ${name} ink`
        ).toBeGreaterThanOrEqual(4.5)
      }
      for (const [token, tones] of Object.entries(ICON_TONES)) {
        const glyph = name === 'light' ? tones.light : tones.dark
        expect(
          contrast(glyph, surface),
          `${token} glyph on the ${name} surface`
        ).toBeGreaterThanOrEqual(4.5)
      }
    }
  })
})

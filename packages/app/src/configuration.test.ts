import { describe, expect, it } from 'vitest'
import {
  BOOKING_ICON_COLOR,
  DAYCARE_DATE_COLORS,
  DAYCARE_DATE_BUTTON_BG_CLASSES,
  PET_CHIP_BADGE_COLORS
} from './configuration.js'

/**
 * `canceled` and `rejected` used to be the same red in every map, so the legend
 * showed two identical swatches; they now differ (red vs deep-orange). The other hues
 * stay as established: approved green, pending grey, standby yellow.
 */
/** `BOOKING_ICON_COLOR` is a Vue ref; the day maps are plain objects. */
const BOOKING_COLOR = BOOKING_ICON_COLOR.value

describe('booking and daycare status colours', () => {
  it('distinguishes canceled from rejected everywhere the pair is mapped', () => {
    expect(BOOKING_COLOR.rejected).not.toBe(BOOKING_COLOR.canceled)
    expect(DAYCARE_DATE_COLORS.rejected).not.toBe(DAYCARE_DATE_COLORS.canceled)
    expect(DAYCARE_DATE_BUTTON_BG_CLASSES.rejected.join()).not.toBe(
      DAYCARE_DATE_BUTTON_BG_CLASSES.canceled.join()
    )
  })

  it('keeps canceledoutsideperiod consistent with canceled', () => {
    expect(BOOKING_COLOR.canceledoutsideperiod).toBe(BOOKING_COLOR.canceled)
  })

  it('moves glyph colours to foreground tokens and status fills to fill tokens', () => {
    // A glyph sits *on* the surface, so it needs a value per scheme (dark-in-light,
    // bright-in-dark) — the opposite of a fill, which carries an ink. The light
    // halves keep the hues these had as palette names.
    expect(BOOKING_COLOR.approved).toBe('icon-approved')
    expect(BOOKING_COLOR.pending).toBe('icon-pending')
    expect(BOOKING_COLOR.standby).toBe('icon-standby')
    expect(BOOKING_COLOR.rejected).toBe('icon-rejected')
    // A fill carries the scheme, so it is a token plus the ink that sits on it:
    // the label used to inherit the theme's text colour, which measured
    // 1.04–1.45:1 on these fills in a dark theme.
    expect(DAYCARE_DATE_COLORS.approved).toBe('status-approved')
    expect(DAYCARE_DATE_BUTTON_BG_CLASSES.approved).toEqual([
      'bg-status-approved',
      'text-on-status-approved'
    ])
    expect(DAYCARE_DATE_BUTTON_BG_CLASSES.rejected).toEqual([
      'bg-status-rejected',
      'text-on-status-rejected'
    ])
    expect(DAYCARE_DATE_BUTTON_BG_CLASSES.pending).toEqual([
      'bg-status-pending',
      'text-on-status-pending'
    ])
    expect(DAYCARE_DATE_BUTTON_BG_CLASSES.standby).toEqual([
      'bg-status-standby',
      'text-on-status-standby'
    ])
  })

  it('keeps the pet chip badge hues distinct from one another', () => {
    const values = Object.values(PET_CHIP_BADGE_COLORS)
    expect(new Set(values).size).toBe(values.length)
  })
})

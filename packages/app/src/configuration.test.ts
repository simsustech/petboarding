import { describe, expect, it } from 'vitest'
import {
  BOOKING_ICON_COLOR,
  DAYCARE_DATE_COLORS,
  DAYCARE_DATE_BUTTON_BG_CLASSES,
  PET_CHIP_BADGE_COLORS
} from './configuration.js'

/**
 * Status hue split: `canceled` and `rejected` were the same red in every map, so the
 * agenda/daycare legend showed two identical swatches for two different states —
 * indistinguishable, and especially so for red-green colour-blind readers (audit:
 * the legend screenshots where Canceled and Rejected read as one colour).
 *
 * The pair now differs (red vs deep-orange), the other three hues stay exactly as
 * they were: approved green, pending grey, standby yellow (user decision to keep the
 * established approval palette).
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

  it('leaves the approved/pending/standby/rejected palette untouched', () => {
    expect(BOOKING_COLOR.approved).toBe('green')
    expect(BOOKING_COLOR.pending).toBe('grey')
    expect(BOOKING_COLOR.standby).toBe('yellow')
    expect(BOOKING_COLOR.rejected).toBe('red')
    expect(DAYCARE_DATE_COLORS.approved).toBe('green')
    expect(DAYCARE_DATE_BUTTON_BG_CLASSES.approved).toEqual(['bg-green'])
    expect(DAYCARE_DATE_BUTTON_BG_CLASSES.rejected).toEqual(['bg-red'])
    expect(DAYCARE_DATE_BUTTON_BG_CLASSES.pending).toEqual(['bg-grey'])
    expect(DAYCARE_DATE_BUTTON_BG_CLASSES.standby).toEqual(['bg-yellow'])
  })

  it('keeps the pet chip badge hues distinct from one another', () => {
    const values = Object.values(PET_CHIP_BADGE_COLORS)
    expect(new Set(values).size).toBe(values.length)
  })
})

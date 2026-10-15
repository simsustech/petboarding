import { describe, expect, it } from 'vitest'
import { getLang } from './index.js'

// Regression: a deployment sets the full locale (`VITE_LANG=nl-NL`). When the
// map only listed `nl`, the lookup missed and every label fell back to English —
// a Dutch deployment showed 'Cancelation costs' instead of 'Annuleringskosten'.
describe('getLang', () => {
  it('resolves a full Dutch locale to the Dutch bundle', async () => {
    const { default: lang } = await getLang('nl-NL')

    expect(lang.booking.cancelationCosts).toBe('Annuleringskosten')
    expect(lang.booking.downPayment).toBe('Aanbetaling')
  })

  it('resolves the Dutch base language and is case-insensitive', async () => {
    expect((await getLang('nl')).default.booking.cancelationCosts).toBe(
      'Annuleringskosten'
    )
    expect((await getLang('NL-nl')).default.booking.cancelationCosts).toBe(
      'Annuleringskosten'
    )
  })

  it('resolves en-US and a regional English locale to English', async () => {
    expect((await getLang('en-US')).default.booking.downPayment).toBe(
      'Down payment'
    )
    expect((await getLang('en-GB')).default.booking.downPayment).toBe(
      'Down payment'
    )
  })

  it('falls back to en-US for a language it does not ship', async () => {
    const { default: lang } = await getLang('de-DE')

    expect(lang.booking.cancelationCosts).toBe('Cancelation costs')
  })
})

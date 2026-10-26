import { describe, expect, it } from 'vitest'
import { compileEmail } from './bookings.js'

describe('compileEmail locale resolution', () => {
  const baseBooking = {
    startDate: '2026-07-21',
    endDate: '2026-07-25',
    pets: [{ name: 'Rex' }],
    customer: { firstName: 'John', lastName: 'Doe' }
  } as any

  const template = '{{startDate}} - {{endDate}}'

  it('resolves en-US directly', async () => {
    const { body } = await compileEmail({
      booking: baseBooking,
      subjectTemplate: template,
      bodyTemplate: template,
      localeCode: 'en-US'
    })
    expect(body).toContain('Tuesday')
  })

  it('falls back from non-existent xx to en-US', async () => {
    const { body } = await compileEmail({
      booking: baseBooking,
      subjectTemplate: template,
      bodyTemplate: template,
      localeCode: 'xx'
    })
    expect(body).toContain('Tuesday')
  })

  it('works without localeCode (undefined)', async () => {
    const { body } = await compileEmail({
      booking: baseBooking,
      subjectTemplate: template,
      bodyTemplate: template
    })
    expect(body).toContain('Tuesday')
  })
})

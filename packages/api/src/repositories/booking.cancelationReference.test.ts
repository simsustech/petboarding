import { describe, expect, it } from 'vitest'
import { BOOKING_STATUS } from '../zod/booking.js'
import { pickCancelationReferenceStatus } from './booking.js'

const approved = (startDate: string, endDate: string, modifiedAt: string) => ({
  status: BOOKING_STATUS.APPROVED,
  startDate,
  endDate,
  modifiedAt
})

describe('pickCancelationReferenceStatus', () => {
  it('references the version in effect when the cancelation period began, not the longest stay', () => {
    // Start 2026-07-01. 5 weeks → 1 week changed 6 months before start (well
    // outside the period, so free); then 1 week → 3 days one week before start
    // (inside the period). Only the 1 week → 3 days removal is chargeable, so
    // the reference must be the 1-week version — not the 5-week original.
    const statuses = [
      approved('2026-07-01', '2026-08-05', '2026-01-01T00:00:00.000Z'),
      approved('2026-07-01', '2026-07-08', '2026-01-02T00:00:00.000Z'),
      approved('2026-07-01', '2026-07-04', '2026-06-24T00:00:00.000Z')
    ]
    // Cancelation window opens two months before the start.
    const periodStart = new Date('2026-05-01T00:00:00.000Z')

    const ref = pickCancelationReferenceStatus(statuses, periodStart)

    expect(ref.endDate).toBe('2026-07-08')
  })

  it('falls back to the earliest approval when every change happened inside the period', () => {
    const statuses = [
      approved('2026-07-01', '2026-08-19', '2026-06-20T00:00:00.000Z'),
      approved('2026-07-01', '2026-07-08', '2026-06-28T00:00:00.000Z')
    ]

    const ref = pickCancelationReferenceStatus(
      statuses,
      new Date('2026-05-01T00:00:00.000Z')
    )

    expect(ref.endDate).toBe('2026-08-19')
  })

  it('ignores non-approved statuses', () => {
    const statuses = [
      { ...approved('2026-07-01', '2026-08-05', '2026-01-01T00:00:00.000Z') },
      {
        status: BOOKING_STATUS.PENDING,
        startDate: '2026-07-01',
        endDate: '2026-07-08',
        modifiedAt: '2026-06-24T00:00:00.000Z'
      }
    ]

    const ref = pickCancelationReferenceStatus(
      statuses,
      new Date('2026-05-01T00:00:00.000Z')
    )

    expect(ref.endDate).toBe('2026-08-05')
  })
})

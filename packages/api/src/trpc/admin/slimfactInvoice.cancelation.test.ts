import { describe, expect, it, vi } from 'vitest'
import { BOOKING_STATUS } from '../../zod/booking.js'

const mocks = vi.hoisted(() => ({
  updateBooking: vi.fn(),
  findBooking: vi.fn()
}))

vi.mock('../../env.js', () => ({
  config: {
    lang: 'nl-NL',
    country: 'NL',
    currency: 'EUR',
    apiHost: 'localhost:3000',
    slimfactHost: 'slimfact.localhost',
    slimfactCompanyId: '1',
    downPaymentPaymentTermDays: 5
  }
}))

vi.mock('../../repositories/booking.js', () => ({
  updateBooking: mocks.updateBooking,
  findBooking: mocks.findBooking
}))

import { createOrUpdateSlimfactInvoice } from './slimfactInvoice.js'

const bookingLine = {
  description: 'Rex',
  listPrice: 2000,
  listPriceIncludesTax: true,
  discount: 0,
  quantity: 21000,
  quantityPerMille: true,
  taxRate: 21,
  type: 'petboarding_booking'
}

// What the booking view shows for a booking shortened inside the cancelation
// period: the base lines plus a cancelation-costs line.
const cancelationLine = {
  description: 'Annuleringskosten',
  listPrice: 12345,
  listPriceIncludesTax: true,
  discount: 0,
  quantity: 1,
  quantityPerMille: false,
  taxRate: 21,
  type: 'petboarding_cancelation'
}

const slimfactInvoice = () =>
  createOrUpdateSlimfactInvoice({
    fastify: {
      slimfact: {
        admin: {
          getNumberPrefixes: { query: vi.fn(async () => []) },
          getCompany: {
            query: vi.fn(async () => ({ id: 1, prefix: 'PB' }))
          },
          updateInvoice: { mutate: vi.fn(async (x: any) => x) },
          createInvoice: { mutate: vi.fn(async (x: any) => x) }
        }
      },
      log: { debug: vi.fn(), error: vi.fn() }
    } as any,
    booking: {
      id: 7,
      customerId: 1,
      invoiceUuid: 'existing-uuid',
      startDate: '2026-07-20',
      endDate: '2026-08-09',
      days: 21,
      startTime: { name: 'Ochtend', startDayCounted: 1 },
      endTime: { name: 'Middag', endDayCounted: 1 },
      status: { status: BOOKING_STATUS.APPROVED },
      pets: [{ id: 1, name: 'Rex', categoryId: 1 }],
      services: [],
      // The booking's own computed costs — the display's single source of truth.
      costs: {
        lines: [bookingLine, cancelationLine],
        discounts: [],
        surcharges: [],
        requiredDownPaymentAmount: 5000,
        taxSummary: [],
        totalIncludingTax: 31845,
        totalExcludingTax: 26318
      }
    } as any,
    customer: {
      firstName: 'Jan',
      lastName: 'Jansen',
      address: 'Straat 1',
      postalCode: '1234AB',
      city: 'Stad',
      account: { email: 'jan@example.com' }
    } as any,
    locale: 'nl'
  })

describe('createOrUpdateSlimfactInvoice — cancelation costs for a modified booking', () => {
  it("bills exactly the booking's shown costs, including the cancelation line", async () => {
    const result = await slimfactInvoice()
    expect(result.success).toBe(true)

    const invoice = (result as any).invoice
    const lines = invoice.lines as any[]
    const cancelation = lines.find(
      (line) => line.type === 'petboarding_cancelation'
    )

    expect(cancelation).toBeDefined()
    expect(cancelation.description).toBe('Annuleringskosten')
    expect(cancelation.listPrice).toBe(12345)
    expect(invoice.requiredDownPaymentAmount).toBe(5000)
  })
})

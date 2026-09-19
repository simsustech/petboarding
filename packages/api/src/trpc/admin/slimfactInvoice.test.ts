import { describe, expect, it, vi } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { InvoiceStatus } from '@modular-api/fastify-checkout/types'
import { cancelOrphanAndFollowWinner } from './slimfactInvoice.js'

/**
 * Unit coverage for the loser half of the invoice-link race: the bill this
 * request created is an orphan (nothing references it), so it is canceled and
 * the winner's invoice is handed back. Runs without SlimFact or a database —
 * the previous regression tests for this live in `tests/e2e/slimfact.spec.ts`
 * and `tests/e2e/bookings.spec.ts`, both skipped unless SlimFact is running.
 */
const orphan = { id: 42, uuid: 'orphan-uuid' }
const winner = { id: 43, uuid: 'winner-uuid' }

const fastifyWith = ({
  cancelRejects = false,
  winnerInvoice = winner
}: {
  cancelRejects?: boolean
  winnerInvoice?: typeof winner | null
} = {}) => {
  const mutate = cancelRejects
    ? vi.fn().mockRejectedValue(new Error('SlimFact refused the cancel'))
    : vi.fn().mockResolvedValue(undefined)
  const query = vi.fn().mockResolvedValue(winnerInvoice)
  const warn = vi.fn()

  return {
    fastify: {
      slimfact: {
        admin: {
          setInvoiceStatus: { mutate },
          getInvoice: { query }
        }
      },
      log: { warn }
    } as unknown as FastifyInstance,
    mutate,
    query,
    warn
  }
}

const discard = (fastify: FastifyInstance, winnerInvoiceUuid?: string | null) =>
  cancelOrphanAndFollowWinner({
    fastify,
    orphan,
    winnerInvoiceUuid,
    logLabel: 'test'
  })

describe('cancelOrphanAndFollowWinner', () => {
  it('cancels the orphan bill and returns the winner invoice', async () => {
    const { fastify, mutate, query } = fastifyWith()

    const invoice = await discard(fastify, 'winner-uuid')

    expect(mutate).toHaveBeenCalledWith({
      id: orphan.id,
      status: InvoiceStatus.CANCELED
    })
    expect(query).toHaveBeenCalledWith({ uuid: 'winner-uuid' })
    expect(invoice).toEqual(winner)
  })

  it('still returns the winner invoice when the cancel is refused', async () => {
    const { fastify, warn } = fastifyWith({ cancelRejects: true })

    const invoice = await discard(fastify, 'winner-uuid')

    expect(warn).toHaveBeenCalledWith(
      expect.any(Error),
      expect.stringContaining('failed to cancel orphan bill orphan-uuid')
    )
    expect(invoice).toEqual(winner)
  })

  it('resolves null without a winning uuid, and reads no invoice', async () => {
    const { fastify, query } = fastifyWith()

    const invoice = await discard(fastify, null)

    expect(query).not.toHaveBeenCalled()
    expect(invoice).toBeNull()
  })

  it('resolves null when the winning invoice cannot be read', async () => {
    const { fastify } = fastifyWith({ winnerInvoice: null })

    expect(await discard(fastify, 'winner-uuid')).toBeNull()
  })

  it('resolves null when SlimFact is not configured', async () => {
    const fastify = { log: { warn: vi.fn() } } as unknown as FastifyInstance

    expect(await discard(fastify, 'winner-uuid')).toBeNull()
  })
})

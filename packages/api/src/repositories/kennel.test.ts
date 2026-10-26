import { describe, expect, it } from 'vitest'
import { findKennels } from './kennel.js'

/**
 * Guards the kennel list's default order: the configured `order` column, not
 * Postgres's incidental lexical-by-name row order.
 */

describe('findKennels default ordering', () => {
  it('returns kennels in their configured order, not lexicographically', async () => {
    const kennels = await findKennels({ criteria: {} })
    const names = kennels.map((kennel) => kennel.name)
    expect(names.length).toBeGreaterThan(1)
    expect(names).toEqual(kennels.map((kennel) => String(kennel.id)))
    const byOrder = [...kennels].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    expect(names).toEqual(byOrder.map((kennel) => kennel.name))
  })
})

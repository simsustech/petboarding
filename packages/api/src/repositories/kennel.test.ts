import { describe, expect, it } from 'vitest'
import { findKennels } from './kennel.js'

/**
 * The kennel list sorted nowhere by default (`find` only ordered when the caller
 * passed `sortBy`), so Postgres handed rows back in a lexical-by-name order and the
 * config screen rendered `1,10,2,3…` (observed in
 * `frontend-audit/desktop/admin-config-kennels.png`). Kennels carry an `order`
 * column for exactly this purpose.
 */

describe('findKennels default ordering', () => {
  it('returns kennels in their configured order, not lexicographically', async () => {
    const kennels = await findKennels({ criteria: {} })
    const names = kennels.map((kennel) => kennel.name)
    expect(names.length).toBeGreaterThan(1)
    expect(names).toEqual(kennels.map((kennel) => String(kennel.id)))
    const byOrder = [...kennels].sort((a, b) => a.order - b.order)
    expect(names).toEqual(byOrder.map((kennel) => kennel.name))
  })
})

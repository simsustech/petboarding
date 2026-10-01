import { describe, expect, it } from 'vitest'
import { findAccounts } from './account.js'

/**
 * Guards the account-list ordering and Name column: ids ascending, and the
 * customer's name standing in for `name` when the account has a profile.
 */

describe('findAccounts default ordering and display name', () => {
  it('returns accounts in ascending id order', async () => {
    const accounts = await findAccounts({ criteria: {} })
    const ids = accounts.map((account) => account.id)
    expect(ids.length).toBeGreaterThan(1)
    expect(ids).toEqual([...ids].sort((a, b) => a - b))
  })

  it('exposes a display name for accounts that have a customer profile', async () => {
    const accounts = await findAccounts({ criteria: {} })
    const seeded = accounts.find(
      (account) => account.email === 'test1@petboarding.app'
    )
    expect(seeded, 'seeded customer account should be listed').toBeTruthy()
    expect(seeded?.name?.trim()).toBeTruthy()
  })
})

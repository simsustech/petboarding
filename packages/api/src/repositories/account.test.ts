import { describe, expect, it } from 'vitest'
import { findAccounts } from './account.js'

/**
 * `/admin/accounts` (the lib AccountsTable) had no meaningful order and an empty
 * Name column: the default sort put the role-count first, so the seeded ids came
 * back `1,6,2,3,4` (observed in `frontend-audit/desktop/admin-accounts.png`), and
 * `accounts` only carries email/roles, so `row.name` was null for every row.
 *
 * The repository owns both: ids ascending, and the customer's name standing in for
 * `name` when the account has a profile. Runs against the test stack's database
 * (packages/api/.env → localhost), like the e2e suite does.
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

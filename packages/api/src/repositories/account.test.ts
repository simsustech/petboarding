import { describe, expect, it } from 'vitest'
import { findAccounts, getAccountsCount } from './account.js'

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

  it('matches a search phrase against the displayed customer name', async () => {
    // `test3@petboarding.app` has no `accounts.name`; the list renders its
    // customer profile's `firstName3 lastName3`. A phrase that occurs only in
    // that name must find the account — the buggy comparison bound
    // `criteria.name` (undefined here), i.e. a "%undefined%" pattern.
    const accounts = await findAccounts({
      criteria: { searchPhrase: 'lastName3' }
    })
    expect(accounts.map((account) => account.email)).toEqual([
      'test3@petboarding.app'
    ])
  })

  it('matches a search phrase case-insensitively', async () => {
    const accounts = await findAccounts({
      criteria: { searchPhrase: 'LASTNAME3' }
    })
    expect(accounts.map((account) => account.email)).toEqual([
      'test3@petboarding.app'
    ])
  })

  it('still matches a search phrase against the email', async () => {
    const accounts = await findAccounts({
      criteria: { searchPhrase: 'TEST4@' }
    })
    expect(accounts.map((account) => account.email)).toEqual([
      'test4@petboarding.app'
    ])
  })

  it('matches a criteria name against the displayed customer name', async () => {
    // `test3@petboarding.app` has no `accounts.name`; the admin page's name
    // field sends `criteria.name`, which must match the same display expression
    // the list renders, not the empty `accounts.name` column.
    const criteria = { name: 'lastName3' }
    const accounts = await findAccounts({ criteria })
    expect(accounts.map((account) => account.email)).toEqual([
      'test3@petboarding.app'
    ])
    // The count must narrow with the same helper, or pagination drifts.
    expect(await getAccountsCount({ criteria })).toBe(accounts.length)
  })
})

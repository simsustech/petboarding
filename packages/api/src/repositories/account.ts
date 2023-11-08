import { db } from '../kysely/index.js'
import type { AccountsTable as Accounts } from '@modular-api/fastify-oidc/kysely'

import type { Insertable, Selectable, Updateable } from 'kysely'
type Account = Selectable<Accounts>
type NewAccount = Insertable<Accounts>
type AccountUpdate = Updateable<Accounts>

const defaultSelect = [
  'id',
  'email',
  'name',
  'roles',
  'uuid',
  'verified',
  'customFields'
] as (keyof Account)[]

function find({
  criteria,
  select
}: {
  criteria: Partial<Account>
  select?: (keyof Account)[]
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('accounts')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  if (criteria.email) {
    query = query.where('email', 'like', `%${criteria.email}%`)
  }

  return query.select(select)
}

export async function findAccount({
  criteria,
  select
}: {
  criteria: Partial<Account>
  select?: (keyof Account)[]
}) {
  const query = find({ criteria, select })

  return query.executeTakeFirst()
}

export async function findAccounts({
  criteria,
  select
}: {
  criteria: Partial<Account>
  select?: (keyof Account)[]
}) {
  const query = find({
    criteria,
    select
  })
  return query.limit(10).execute()
}

export async function createAccount(account: NewAccount) {
  return db
    .insertInto('accounts')
    .values(account)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateAccount(
  criteria: Partial<Account>,
  updateWith: AccountUpdate
) {
  let query = db.updateTable('accounts')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query.set(updateWith).executeTakeFirstOrThrow()
}

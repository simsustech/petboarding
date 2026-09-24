import { db } from '../kysely/index.js'
import type { AccountsTable as Accounts } from '@modular-api/fastify-oidc/kysely'

import { sql, type Insertable, type Selectable, type Updateable } from 'kysely'
export type Account = Selectable<Accounts>
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

function whereEmail(
  query: ReturnType<typeof db.selectFrom<'accounts'>>,
  email?: string | null
) {
  if (!email) return query
  return query.where((web) =>
    web(web.fn('lower', ['email']), 'like', `%${email.toLowerCase()}%`)
  )
}

function whereName(
  query: ReturnType<typeof db.selectFrom<'accounts'>>,
  name?: string | null
) {
  if (!name) return query
  return query.where((web) =>
    web(web.fn('lower', ['name']), 'like', `%${name.toLowerCase()}%`)
  )
}

function whereRoles(
  query: ReturnType<typeof db.selectFrom<'accounts'>>,
  roles?: string[] | null
) {
  if (!roles?.length) return query
  return query.where((web) =>
    web(
      sql`CAST(roles AS JSONB)`,
      '@>',
      `[${roles.map((role) => `"${role}"`).join(', ')}]`
    )
  )
}

function find({
  criteria,
  select,
  pagination
}: {
  criteria: Partial<Account> & { ids?: number[]; searchPhrase?: string }
  select?: (keyof Account)[]
  pagination?: {
    limit: number
    offset: number
    sortBy: 'id' | 'name' | 'email' | null
    descending: boolean
  }
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('accounts')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  } else if (criteria.ids) {
    query = query.where('id', 'in', criteria.ids.length ? criteria.ids : [null])
  }

  query = whereEmail(query, criteria.email)
  query = whereName(query, criteria.name)

  if (criteria.searchPhrase) {
    query = query.where((web) =>
      web.or([
        web('email', 'like', `%${criteria.searchPhrase}%`),
        web('name', 'like', `%${criteria.name}%`)
      ])
    )
  }

  query = whereRoles(query, criteria.roles)

  if (pagination) {
    if (pagination.sortBy)
      query = query.orderBy(
        pagination.sortBy === 'id' ? 'accounts.id' : pagination.sortBy,
        pagination.descending ? 'desc' : 'asc'
      )

    query = query.limit(pagination.limit).offset(pagination.offset)
  }

  // `accounts` carries only email/roles, so the Name column was blank for every
  // row (audit: admin-accounts.png). The customer's name stands in when the
  // account has a profile. A correlated subquery rather than a join: joining
  // customers would make every unqualified `id` reference ambiguous.
  return query
    .select([])
    .select(select.filter((column) => column !== 'name'))
    .select([
      sql<string>`coalesce(
        (
          select nullif(
            concat_ws(' ', c.first_name, c.last_name), ''
          )
          from customers c
          where c.account_id = accounts.id
          limit 1
        ),
        accounts.name
      )`.as('name')
    ])
}

export async function findAccount({
  criteria,
  select
}: {
  criteria: Partial<Account> & { searchPhrase?: string }
  select?: (keyof Account)[]
}) {
  const query = find({ criteria, select })

  return query.executeTakeFirst()
}

export async function findAccounts({
  criteria,
  select,
  pagination
}: {
  criteria: Partial<Account> & { ids?: number[]; searchPhrase?: string }
  select?: (keyof Account)[]
  pagination?: {
    limit: number
    offset: number
    sortBy: 'id' | 'name' | 'email' | null
    descending: boolean
  }
}) {
  const query = find({
    criteria,
    select,
    pagination
  })
  // Default order: ids ascending. The role-count ordering that used to sit here
  // produced `1,6,2,3,4` on screen (audit: admin-accounts.png).
  return query.orderBy('accounts.id', 'asc').execute()
}

export async function getAccountsCount({
  criteria
}: {
  criteria: Partial<Account> & { roles?: string[] }
}) {
  let query = db.selectFrom('accounts')

  query = whereEmail(query, criteria.email)
  query = whereName(query, criteria.name)
  query = whereRoles(query, criteria.roles)

  return query
    .select(({ fn }) => [fn.count<number>('accounts.id').as('accountCount')])
    .executeTakeFirst()
    .then((result) => Number(result?.accountCount))
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

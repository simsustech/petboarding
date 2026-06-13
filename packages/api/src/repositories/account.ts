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
        pagination.sortBy,
        pagination.descending ? 'desc' : 'asc'
      )

    query = query.limit(pagination.limit).offset(pagination.offset)
  }

  return query.select([]).select(select)
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
  return query
    .orderBy(sql`json_array_length(roles)`, 'desc')
    .orderBy('id', 'asc')
    .execute()
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

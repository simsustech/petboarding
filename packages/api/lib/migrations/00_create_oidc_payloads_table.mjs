import {
  oidcPayloads,
  accounts,
  authenticationMethods
} from '@modular-api/fastify-oidc/migrations/index.mjs'

export async function up(knex) {
  return Promise.all([
    await oidcPayloads.up(knex),
    await accounts.up(knex),
    await authenticationMethods.up(knex)
  ])
}

export async function down(knex) {
  return Promise.all([
    await oidcPayloads.down(knex, Promise),
    await accounts.down(knex, Promise),
    await authenticationMethods.down(knex, Promise)
  ])
}

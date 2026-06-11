import pg from 'pg'
const { Pool } = pg
import { Kysely, PostgresDialect, CamelCasePlugin } from 'kysely'
import { postgresConfig } from '../config/postgres.js'
// import type { Database as OidcDatabase } from '@modular-api/fastify-oidc'
import type { DB } from './types.d.ts'
// export interface Database extends DB {}
export type Database = DB
Object.defineProperty(BigInt.prototype, 'toJSON', {
  get() {
    'use strict'
    return () => String(this)
  }
})

const types = pg.types
types.setTypeParser(1700, function (val) {
  return parseFloat(val)
})
types.setTypeParser(1114, (str) => str)
types.setTypeParser(1082, (str) => str)

const host = postgresConfig.host
const user = postgresConfig.user
const password = postgresConfig.password
const database = postgresConfig.database
const port = postgresConfig.port
// https://www.digitalocean.com/community/questions/cannot-connect-with-dev-database-due-to-ssl-issue
const ssl = postgresConfig.ssl
  ? {
      rejectUnauthorized: false,
      ca: postgresConfig.caCert
    }
  : false

export const postgresConnectionString = `postgress://${user}:${password}@${host}:${port}/${database}?sslmode=${ssl ? (ssl.rejectUnauthorized ? 'prefer' : 'no-verify') : ''}&sslrootcert=${ssl ? (ssl.ca ? ssl.ca : '') : ''}`

const dialect = new PostgresDialect({
  pool: new Pool({
    host,
    user,
    password,
    database,
    port,
    ssl,
    max: postgresConfig.poolMax
  })
})

export const db = new Kysely<Database>({
  dialect,
  plugins: [new CamelCasePlugin()],
  log(event) {
    if (postgresConfig.debug && event.level === 'query') {
      console.log(event.query.sql)
      console.log(event.query.parameters)
    }
  }
})

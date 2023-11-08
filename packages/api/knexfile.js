import pgClient from 'knex/lib/dialects/postgres/index.js'
import { readFileSync } from 'fs'
import pg from 'pg'
const types = pg.types
types.setTypeParser(1700, function (val) {
  return parseFloat(val)
})
types.setTypeParser(1114, (str) => str)
types.setTypeParser(1082, (str) => str)

const env = {
  read: (envVar) => {
    let result
    if (import.meta.env) {
      result = import.meta.env[envVar]
    }
    if (!result && process && process.env[envVar]) {
      result = process.env[envVar]
    } else if (!result && process && process.env[envVar + '_FILE']) {
      result = process.env[envVar + '_FILE']
    }
    if (result && result.startsWith('/run/secrets')) {
      try {
        console.log(`Reading Docker secret: ${result}`)
        result = readFileSync(result, 'utf-8')
      } catch (e) {}
    }

    return result
  }
}
const config = {
  client: pgClient,
  useNullAsDefault: true,
  version: '8.11.0',
  // connection: env.read('DATABASE_URL') || env.read('VITE_DATABASE_URL')
  connection: {
    host: env.read('POSTGRES_HOST') || env.read('VITE_POSTGRES_HOST'),
    user:
      env.read('POSTGRES_USER') || env.read('VITE_POSTGRES_USER') || 'postgres',
    password:
      env.read('POSTGRES_PASSWORD') || env.read('VITE_POSTGRES_PASSWORD'),
    database: env.read('POSTGRES_DB') || env.read('VITE_POSTGRES_DB')
  },
  migrations: {
    directory: './lib/migrations',
    loadExtensions: ['.mjs']
  },
  seeds: {
    directory: './lib/seeds',
    loadExtensions: ['.mjs']
  }
}

export default config

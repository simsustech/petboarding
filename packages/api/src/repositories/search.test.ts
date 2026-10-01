import { afterAll, describe, expect, it } from 'vitest'
import { sql } from 'kysely'
import { db } from '../kysely/index.js'
import { searchCustomers } from './customer.js'
import { buildSearchTsQuery } from './search.js'

/**
 * Regression cover for the two customer/pet search defects:
 *
 *   1. articles/particles (`van`, `de`, `het`, `een`, …) acted as match criteria,
 *      so `van Huppeldepup` matched everyone whose name contained `van`.
 *   2. accents were not folded, so `Madel` did not find `Mädel`.
 *
 * Runs against the test stack's database (packages/api/.env → localhost), like
 * the sibling repository tests. `searchCustomers` only returns customers that
 * have at least one pet (the query inner-joins pets), so every fixture gets one.
 */

const FIRST_PREFIX = 'Searchtest'

// --- pure builder (stopwords, AND semantics, unicode passthrough) -----------

describe('buildSearchTsQuery', () => {
  it('drops stopwords so a lone article searches nothing', () => {
    expect(buildSearchTsQuery('van')).toBe('')
    expect(buildSearchTsQuery('de')).toBe('')
    expect(buildSearchTsQuery('the')).toBe('')
  })

  it('drops stopwords but keeps the meaningful terms', () => {
    expect(buildSearchTsQuery('van Huppeldepup')).toBe('Huppeldepup:*')
    expect(buildSearchTsQuery('de Vries')).toBe('Vries:*')
  })

  it('AND-joins terms so a common particle cannot widen the result', () => {
    expect(buildSearchTsQuery('Renée Dubois')).toBe('Renée:* & Dubois:*')
  })

  it('preserves unicode letters (the database folds the accents)', () => {
    expect(buildSearchTsQuery('Mädel')).toBe('Mädel:*')
    expect(buildSearchTsQuery('García')).toBe('García:*')
  })
})

// --- database behaviour (accent folding + stopwords + AND) ------------------

const lastNameOf = (row: Record<string, unknown>): string =>
  String(row.last_name ?? row.lastName ?? '')

let seeded = false

async function seedCustomerWithPet(
  firstName: string,
  lastName: string,
  city: string,
  petName = 'Fluffy'
): Promise<void> {
  const customer = await sql<{ id: number }>`
    insert into customers
      (gender, first_name, last_name, address, postal_code, city, telephone_number, veterinarian)
    values ('female', ${firstName}, ${lastName}, 'Teststraat 1', '0000', ${city}, '000', 'vet')
    returning id`.execute(db)

  await sql`
    insert into pets
      (species, name, breed, gender, sterilized, birth_date, customer_id)
    values ('dog', ${petName}, 'mix', 'female', false, '2020-01-01', ${customer.rows[0].id})`.execute(
    db
  )
  seeded = true
}

afterAll(async () => {
  if (seeded) {
    // pets cascade from customers
    await sql`delete from customers where first_name like ${FIRST_PREFIX + '%'}`.execute(
      db
    )
  }
})

describe('searchCustomers', () => {
  it('folds accents in both directions (Madel ↔ Mädel)', async () => {
    await seedCustomerWithPet(`${FIRST_PREFIX}A`, 'Mädel', 'München')
    await seedCustomerWithPet(`${FIRST_PREFIX}B`, 'Madel', 'Antwerpen')

    const names = (await searchCustomers('Madel')).map((r) =>
      lastNameOf(r as Record<string, unknown>)
    )
    expect(names).toContain('Mädel')
    expect(names).toContain('Madel')
  })

  it('narrows a multi-word search instead of widening on a particle', async () => {
    await seedCustomerWithPet(`${FIRST_PREFIX}C`, 'van Huppeldepup', 'Utrecht')
    await seedCustomerWithPet(`${FIRST_PREFIX}D`, 'van Dijk', 'Utrecht')

    const names = (await searchCustomers('van Huppeldepup')).map((r) =>
      lastNameOf(r as Record<string, unknown>)
    )
    expect(names).toContain('van Huppeldepup')
    expect(names).not.toContain('van Dijk')
  })

  it('returns nothing for a query made only of stopwords', async () => {
    expect(await searchCustomers('van')).toEqual([])
    expect(await searchCustomers('de')).toEqual([])
  })
})

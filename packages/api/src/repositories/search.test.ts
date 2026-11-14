import { afterAll, describe, expect, it } from 'vitest'
import { sql } from 'kysely'
import { db } from '../kysely/index.js'
import { searchCustomers } from './customer.js'
import { searchPets } from './pet.js'
import {
  buildSearchTsQuery,
  customerSearchVector,
  petSearchVector
} from './search.js'

/**
 * Regression cover for the two customer/pet search defects: articles/particles
 * (`van`, `de`, `het`, …) acting as match criteria, and accents not being folded
 * (`Madel` not finding `Mädel`).
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

  it('prefix-matches short terms too (no min-4 gate)', () => {
    expect(buildSearchTsQuery('jan')).toBe('jan:*')
    expect(buildSearchTsQuery('ja')).toBe('ja:*')
  })

  it('splits on the punctuation the vector tokenises (apostrophe, hyphen)', () => {
    expect(buildSearchTsQuery("O'Brien")).toBe('O:* & Brien:*')
    expect(buildSearchTsQuery('Peters-de Wit')).toBe('Peters:* & Wit:*')
  })
})

// --- vector expressions (must match the migrations, or the GIN indexes rot) --

describe('search vectors', () => {
  it('emits the expressions migrations 07/10 index', () => {
    expect(customerSearchVector('c.')).toBe(
      "to_tsvector('unaccented', coalesce(c.first_name, '') || ' ' || coalesce(c.last_name, '') || ' ' || coalesce(c.city, '') || ' ' || coalesce(c.address, ''))"
    )
    expect(petSearchVector('p.')).toBe(
      "to_tsvector('unaccented', coalesce(p.name, '') || ' ' || coalesce(p.breed, '') || ' ' || coalesce(p.chip_number, '') || ' ' || coalesce(p.color, ''))"
    )
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

  it('finds a surname from a short prefix, without returning everything', async () => {
    await seedCustomerWithPet(`${FIRST_PREFIX}J`, 'Jansen', 'Utrecht')
    await seedCustomerWithPet(`${FIRST_PREFIX}K`, 'Kowalski', 'Krakau')

    const names = (await searchCustomers('jan')).map((r) =>
      lastNameOf(r as Record<string, unknown>)
    )
    expect(names).toContain('Jansen')
    // issue-#2 guard: a 3-char prefix must match on the prefix, not everything
    expect(names).not.toContain('Kowalski')
  })

  it('returns matches in a deterministic alphabetical order', async () => {
    await seedCustomerWithPet(`${FIRST_PREFIX}M`, 'Zwart', 'Orderstad')
    await seedCustomerWithPet(`${FIRST_PREFIX}N`, 'Aarhus', 'Orderstad')

    const names = (await searchCustomers('Orderstad')).map((r) =>
      lastNameOf(r as unknown as Record<string, unknown>)
    )
    expect(names).toEqual(['Aarhus', 'Zwart'])
  })

  it('finds a customer from a phrase spanning the customer and the pet', async () => {
    await seedCustomerWithPet(
      `${FIRST_PREFIX}U`,
      'Vermeulen',
      'Utrecht',
      'Bink'
    )

    // Neither vector alone holds both terms, so only the joined one can answer.
    const names = (await searchCustomers(`${FIRST_PREFIX}U Bink`)).map((r) =>
      lastNameOf(r as Record<string, unknown>)
    )
    expect(names).toContain('Vermeulen')
  })

  it('finds surnames the tokeniser splits on punctuation', async () => {
    await seedCustomerWithPet(`${FIRST_PREFIX}V`, "O'Brien", 'Cork', 'Pip')
    await seedCustomerWithPet(
      `${FIRST_PREFIX}W`,
      'Peters-de Wit',
      'Utrecht',
      'Pip2'
    )

    const names = async (phrase: string) =>
      (await searchCustomers(phrase)).map((r) =>
        lastNameOf(r as Record<string, unknown>)
      )

    expect(await names("O'Brien")).toContain("O'Brien")
    expect(await names('Peters-de Wit')).toContain('Peters-de Wit')
  })
})

// --- pet search: the surname branch and phrases that span both branches ----

const petNames = async (searchPhrase: string): Promise<string[]> =>
  (await searchPets(searchPhrase)).map((row) => String(row.name))

describe('searchPets', () => {
  it('finds a pet from its owner surname alone', async () => {
    await seedCustomerWithPet(`${FIRST_PREFIX}R`, 'Kratom', 'Utrecht', 'Moos')

    expect(await petNames('Kratom')).toContain('Moos')
    expect(await petNames('kratom')).toContain('Moos')
  })

  it('finds a pet from the phrase the select shows: pet name + owner surname', async () => {
    // The option label is `${pet.name} ${pet.lastName}` (PetSelect.vue), so the
    // phrase a user copies out of the dropdown is two words from two different
    // tsvectors — the pet's and its owner's.
    await seedCustomerWithPet(`${FIRST_PREFIX}S`, 'Kratom', 'Utrecht', 'Moos')

    expect(await petNames('Moos')).toContain('Moos')
    expect(await petNames('Moos Kratom')).toContain('Moos')
    expect(await petNames('moos kratom')).toContain('Moos')
  })

  it('finds a pet from a lowercase pet name + surname phrase', async () => {
    await seedCustomerWithPet(
      `${FIRST_PREFIX}T`,
      'Vermeulen',
      'Utrecht',
      'Bink'
    )

    expect(await petNames('bink vermeulen')).toContain('Bink')
  })
})

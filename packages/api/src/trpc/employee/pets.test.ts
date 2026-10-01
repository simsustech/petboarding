import { afterAll, describe, expect, it } from 'vitest'
import { initTRPC } from '@trpc/server'
import { sql } from 'kysely'
import { db } from '../../kysely/index.js'
import { employeePetRoutes } from './pets.js'

/**
 * The employee `searchPets` procedure owns the minimum query length. It is the
 * second seam for this change (the repository `searchPets` is the first): the
 * floor lives here, above the repository, so it is only observable through the
 * procedure.
 *
 * A 1-character query is red-capable because the seeded pet token (`xena`)
 * matches the prefix `x:*` — without the floor the procedure would return it.
 */

const t = initTRPC.create()
const caller = t
  .router(employeePetRoutes({ procedure: t.procedure }))
  .createCaller({})

const SEED_PREFIX = 'Floortest'

async function seedPetNamed(name: string): Promise<void> {
  const customer = await sql<{ id: number }>`
    insert into customers
      (gender, first_name, last_name, address, postal_code, city, telephone_number, veterinarian)
    values ('female', ${SEED_PREFIX}, 'Tester', 'Teststraat 1', '0000', 'Teststad', '000', 'vet')
    returning id`.execute(db)

  await sql`
    insert into pets
      (species, name, breed, gender, sterilized, birth_date, customer_id)
    values ('dog', ${name}, 'mix', 'female', false, '2020-01-01', ${customer.rows[0].id})`.execute(
    db
  )
}

afterAll(async () => {
  // pets cascade from customers
  await sql`delete from customers where first_name like ${SEED_PREFIX + '%'}`.execute(
    db
  )
})

describe('employee.searchPets minimum query length', () => {
  it('returns nothing for a 1-character query but passes a 2-character one', async () => {
    await seedPetNamed('Xena')

    expect(await caller.searchPets('x')).toEqual([])

    const pets = await caller.searchPets('xe')
    expect(pets.length).toBeGreaterThan(0)
  })
})

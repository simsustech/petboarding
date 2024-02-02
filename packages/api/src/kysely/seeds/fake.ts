// import generateData from './fake/generateData.js'
import bcrypt from 'bcrypt'
import { db } from '../index.js'
import { sql } from 'kysely'
import { readFileSync } from 'fs'
const seed = async () => {
  const {
    accounts,
    customers,
    contactPeople,
    pets,
    bookings,
    bookingPet,
    bookingStatuses,
    daycareDates,
    daycarePet,
    categories,
    openingTimes,
    services,
    emailTemplates,
    announcements
  } = JSON.parse(
    readFileSync(new URL('./fake/data.json', import.meta.url).pathname, 'utf-8')
  )

  await db.insertInto('announcements').values(announcements).execute()
  await db.insertInto('categories').values(categories).execute()
  await db.insertInto('openingTimes').values(openingTimes).execute()
  await db.insertInto('services').values(services).execute()
  await db.insertInto('accounts').values(accounts).execute()

  await db.insertInto('customers').values(customers).execute()
  await sql`ALTER SEQUENCE customers_id_seq RESTART WITH ${sql.lit(
    customers.length + 1
  )}`.execute(db)
  await db.insertInto('contactPeople').values(contactPeople).execute()

  await sql`ALTER SEQUENCE contact_people_id_seq RESTART WITH ${sql.lit(
    contactPeople.length + 1
  )}`.execute(db)
  await db.insertInto('pets').values(pets).execute()
  await sql`ALTER SEQUENCE pets_id_seq RESTART WITH ${sql.lit(
    pets.length + 1
  )}`.execute(db)
  await db.insertInto('bookings').values(bookings).execute()
  await sql`ALTER SEQUENCE bookings_id_seq RESTART WITH ${sql.lit(
    bookings.length + 1
  )}`.execute(db)
  await db.insertInto('bookingPetKennel').values(bookingPet).execute()
  await db.insertInto('bookingStatus').values(bookingStatuses).execute()
  await db.insertInto('daycareDates').values(daycareDates).execute()
  await sql`ALTER SEQUENCE daycare_dates_id_seq RESTART WITH ${sql.lit(
    daycareDates.length + 1
  )}`.execute(db)
  await db.insertInto('daycareDatePetKennel').values(daycarePet).execute()
  await db.insertInto('emailTemplates').values(emailTemplates).execute()

  const adminAccounts = await db
    .insertInto('accounts')
    .values([
      {
        email: 'admin@petboarding.app',
        roles: `["administrator", "employee"]`
      }
    ])
    .returning('id')
    .execute()

  const admin = adminAccounts[0]

  await db
    .insertInto('authenticationMethods')
    .values([
      {
        accountId: admin.id,
        provider: 'native',
        password: await bcrypt.hash('qjiNWdT8L', 10)
      }
    ])
    .execute()
}

seed()

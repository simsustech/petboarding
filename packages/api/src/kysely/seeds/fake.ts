// import generateData from './fake/generateData.js'
import { hashPassword } from '@vitrify/tools/scrypt'
import { db } from '../index.js'
import { sql } from 'kysely'
import { readFileSync } from 'fs'
import { OPENING_TIME_TYPE } from '../types.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chunk = (arr: any[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  )

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
    daycarePet
  } = JSON.parse(
    readFileSync(new URL('./fake/data.json', import.meta.url).pathname, 'utf-8')
  )

  const buildings = [
    {
      name: 'Main building',
      location: 'A',
      description: 'The main building'
    },
    {
      name: 'Secondary building',
      location: 'B',
      description: 'The secondary building'
    }
  ]

  const kennels = []
  for (const buildingId of Array.from(
    { length: buildings.length },
    (_, i) => i + 1
  )) {
    kennels.push(
      ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => ({
        name: id.toString(),
        buildingId: buildingId
      }))
    )
  }

  const categories = [
    {
      species: 'dog',
      order: 1,
      name: 'Small'
      // price: 1000
    }
  ]
  const categoryPrices = [
    {
      categoryId: 1,
      date: '2024-01-01',
      listPrice: 1000
    },
    {
      categoryId: 1,
      date: '2025-01-01',
      listPrice: 1500
    }
  ]
  const openingTimes = [
    {
      name: 'Morning',
      startDayCounted: 1,
      endDayCounted: 0.5,
      daysOfWeek: '[0,1,2,3,4,5,6]',
      unavailableHolidays: '["01-01"]',
      startTime: '09:00',
      endTime: '10:00',
      type: OPENING_TIME_TYPE.ALL
    },
    {
      name: 'Evening',
      startDayCounted: 0.5,
      endDayCounted: 1.0,
      daysOfWeek: '[1,2,3,4,5]',
      unavailableHolidays: '["01-01"]',
      startTime: '17:00',
      endTime: '18:00',
      type: OPENING_TIME_TYPE.ALL
    }
  ]

  const services = [
    {
      name: 'Wash pet(s)',
      description: 'Pet(s) will be washed before leaving.',
      type: 'appointment',
      listPrice: null,
      hidden: false
    },
    {
      name: 'Groom pet(s)',
      description: 'Pet(s) will be groomed during their stay.',
      type: 'appointment',
      listPrice: null,
      hidden: false
    },
    {
      name: 'Intensive medical care',
      description: 'Pet(s) required intensive medical care during their stay.',
      type: 'surcharge',
      listPrice: null,
      hidden: true
    },
    {
      name: 'Veterinarian visit',
      description: 'Pet(s) required a visit to the veterinarian',
      type: 'surcharge',
      listPrice: null,
      hidden: true
    }
  ]

  const announcements = [
    {
      title: 'This is a public demo',
      message:
        'Please do NOT enter personal information when using this demo. It may be public to everyone',
      type: 'important',
      expirationDate: '2030-01-01'
    },
    {
      title: 'Email',
      message:
        'The emails send in the demo can be viewed at https://mail.demo.petboarding.app',
      type: 'important',
      expirationDate: '2030-01-01'
    },
    {
      title: 'Admin account',
      message: 'admin@petboarding.app / qjiNWdT8L',
      type: 'general',
      expirationDate: '2030-01-01'
    }
  ]

  const documents = [
    {
      name: 'privacyPolicy',
      content: `# Petboarding
A product of:
simsustech
https://www.simsus.tech
info@simsus.tech
Privacy policy
Petboarding collects the following information:
- First and last name
- Gender
- Address details
- Contact information
The purpose of collecting this information is the following:
- Providing the user the ability to create an account.
- Provide the ability to perform online payments.
The information is shared only with the client (i.e. the business that uses our services). The
information will not be shared with anyone else.
The user has the ability to change or delete their information in their account.
If you have any questions or remarks about the security, please contact info@simsus.tech.

# Privacy verklaring
Petboarding verzamelt de volgende informatie:
- Voor en achternaam
- Geslacht
- Adres gegevens
- Contact gegevens
Het doel van het verzamelen van deze informatie is het volgende:
- Het mogelijk maken voor de gebruiker om een account aan te maken
- Het mogelijk maken om online betalingen te doen
De informatie wordt alleen gedeeld met onze klant (i.e. het bedrijf dat onze dienst afneemt). De
informatie zal niet worden gedeeld met anderen.
De gebruiker heeft de mogelijkheid om zijn informatie te verwijderen of te veranderen in zijn
account.
Heeft u vragen of opmerkingen over de beveiliging, neem dan contact op met info@simsus.tech.`
    },
    {
      name: 'termsAndConditions',
      content: `# Terms and conditions`
    }
  ]

  await db.insertInto('announcements').values(announcements).execute()
  await db.insertInto('buildings').values(buildings).execute()
  await db.insertInto('kennels').values(kennels).execute()
  await db.insertInto('categories').values(categories).execute()
  await db.insertInto('categoryPrices').values(categoryPrices).execute()
  await db.insertInto('openingTimes').values(openingTimes).execute()
  await db.insertInto('services').values(services).execute()
  await db.insertInto('documents').values(documents).execute()

  for (const insertAccounts of chunk(accounts, 1000)) {
    await db.insertInto('accounts').values(insertAccounts).execute()
  }

  for (const insertCustomers of chunk(customers, 1000)) {
    await db.insertInto('customers').values(insertCustomers).execute()
  }
  await sql`ALTER SEQUENCE customers_id_seq RESTART WITH ${sql.lit(
    customers.length + 1
  )}`.execute(db)

  for (const insertContactPeople of chunk(contactPeople, 1000)) {
    await db.insertInto('contactPeople').values(insertContactPeople).execute()
  }
  await sql`ALTER SEQUENCE contact_people_id_seq RESTART WITH ${sql.lit(
    contactPeople.length + 1
  )}`.execute(db)

  for (const insertPets of chunk(pets, 1000)) {
    await db.insertInto('pets').values(insertPets).execute()
  }
  await sql`ALTER SEQUENCE pets_id_seq RESTART WITH ${sql.lit(
    pets.length + 1
  )}`.execute(db)

  for (const insertBookings of chunk(bookings, 1000)) {
    await db.insertInto('bookings').values(insertBookings).execute()
  }
  await sql`ALTER SEQUENCE bookings_id_seq RESTART WITH ${sql.lit(
    bookings.length + 1
  )}`.execute(db)

  for (const insertBookingPets of chunk(bookingPet, 1000)) {
    await db.insertInto('bookingPetKennel').values(insertBookingPets).execute()
  }

  for (const insertBookingStatuses of chunk(bookingStatuses, 1000)) {
    await db.insertInto('bookingStatus').values(insertBookingStatuses).execute()
  }

  for (const insertDaycareDates of chunk(daycareDates, 1000)) {
    await db.insertInto('daycareDates').values(insertDaycareDates).execute()
  }
  await sql`ALTER SEQUENCE daycare_dates_id_seq RESTART WITH ${sql.lit(
    daycareDates.length + 1
  )}`.execute(db)

  for (const insertDaycarePets of chunk(daycarePet, 1000)) {
    await db
      .insertInto('daycareDatePetKennel')
      .values(insertDaycarePets)
      .execute()
  }

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
        password: await hashPassword('qjiNWdT8L')
      }
    ])
    .execute()
}

seed()

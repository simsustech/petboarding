// import generateData from './fake/generateData.js'
import bcrypt from 'bcrypt'
import { db } from '../index.js'
import { sql } from 'kysely'
import { readFileSync } from 'fs'
import { OPENING_TIME_TYPE } from '../types.js'
import { c } from 'compress-tag'

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

  const emailTemplates = [
    {
      name: 'cancelBooking',
      subject: 'Your booking has been canceled.',
      body: c`<h4>Your booking has been canceled.</h4>
      <p>
          Dear {{customer.firstName}} {{customer.lastName}},
      </p>
      <p>
          This email is to inform you that the booking from
          <b>{{startDate}} {{startTime}}</b> until
          <b>{{endDate}} {{endTime}}</b> for your pets
          <b>{{pets}}</b>
          has been canceled with the following reason:
          {{reason}}.
          Please note that a cancelation fee may apply.
      </p>
      <p>
          Kind regards
      </p>`
    },
    {
      name: 'approveBooking',
      subject: c`Your booking has been approved\\{{#if requiredDownPaymentAmount}} (down payment required!)\\{{/if}}.`,
      body: c`<h4>Thanks for your booking.</h4>
        <p>
            Dear {{customer.firstName}} {{customer.lastName}},
        </p>
        \\{{#if requiredDownPaymentAmount}}
          <p style="color:red;">
            This booking requires a down payment. Open the bill with the link below to pay the down payment.
            <br />
            <b>If you do not pay the down payment within 5 days your booking will automatically be canceled.</b>
          </p>
        \\{{/if}}
        \\{{#if invoiceUrl}}
          <p>
          <a href="\\{{invoiceUrl}}">Click here to view and pay the bill for this booking.</a>
          </p>
        \\{{/if}}
        <p>
            This email is to inform you that the booking from
            <b>{{startDate}} {{startTime}}</b> until
            <b>{{endDate}} {{endTime}}</b> for your pets
            <b>{{pets}}</b>
            has been approved.
        </p>
        <p>
            Kind regards
        </p>`
    },
    {
      name: 'rejectBooking',
      subject: 'Your booking has been rejected.',
      body: c`<p>
        Dear {{customer.firstName}} {{customer.lastName}},
      </p>
      <p>
          Unfortunately we have to reject your booking from
          <b>{{startDate}} {{startTime}}</b> until
          <b>{{endDate}} {{endTime}}</b> for your pets
          <b>{{pets}}</b>.
      </p>
      <p>
          Kind regards
      </p>`
    },
    {
      name: 'standbyBooking',
      subject: 'Your booking has been placed on the reserve list.',
      body: c`<p>
        Dear {{customer.firstName}} {{customer.lastName}},
      </p>
      <p>
          Your booking from
          <b>{{startDate}} {{startTime}}</b> until
          <b>{{endDate}} {{endTime}}</b> for your pets
          <b>{{pets}}</b> has been placed on the reserve list.
          We advise you to find an alternative.
      </p>
      <p>
          Kind regards
      </p>`
    },
    {
      name: 'replyBooking',
      subject: 'With regard to your booking.',
      body: ''
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

  await db.insertInto('announcements').values(announcements).execute()
  await db.insertInto('categories').values(categories).execute()
  await db.insertInto('categoryPrices').values(categoryPrices).execute()
  await db.insertInto('openingTimes').values(openingTimes).execute()
  await db.insertInto('services').values(services).execute()

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

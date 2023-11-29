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
  // const {
  //   accounts,
  //   customers,
  //   contactPeople,
  //   pets,
  //   bookings,
  //   bookingPet,
  //   bookingStatuses,
  //   daycareDates,
  //   daycarePet
  // } = generateData()
  // const categories = [
  //   {
  //     species: 'dog',
  //     order: 1,
  //     name: 'Small',
  //     price: 1000
  //   }
  // ]
  // const openingTimes = [
  //   {
  //     name: 'Morning',
  //     startDayCounted: 1,
  //     endDayCounted: 0.5,
  //     daysOfWeek: '[0,1,2,3,4,5,6]',
  //     unavailableHolidays: '["01-01"]',
  //     startTime: '09:00',
  //     endTime: '10:00'
  //   },
  //   {
  //     name: 'Evening',
  //     startDayCounted: 0.5,
  //     endDayCounted: 1.0,
  //     daysOfWeek: '[1,2,3,4,5]',
  //     unavailableHolidays: '["01-01"]',
  //     startTime: '17:00',
  //     endTime: '18:00'
  //   }
  // ]

  // const services = [
  //   {
  //     name: 'Wash pet(s)',
  //     description: 'Pet(s) will be washed before leaving.',
  //     type: 'appointment',
  //     listPrice: null,
  //     hidden: false
  //   },
  //   {
  //     name: 'Groom pet(s)',
  //     description: 'Pet(s) will be groomed during their stay.',
  //     type: 'appointment',
  //     listPrice: null,
  //     hidden: false
  //   },
  //   {
  //     name: 'Intensive medical care',
  //     description: 'Pet(s) required intensive medical care during their stay.',
  //     type: 'surcharge',
  //     listPrice: null,
  //     hidden: true
  //   },
  //   {
  //     name: 'Veterinarian visit',
  //     description: 'Pet(s) required a visit to the veterinarian',
  //     type: 'surcharge',
  //     listPrice: null,
  //     hidden: true
  //   }
  // ]

  // const emailTemplates = [
  //   {
  //     name: 'cancelBooking',
  //     subject: 'Your booking has been cancelled.',
  //     body: c`<h4>Your booking has been cancelled.</h4>
  //     <p>
  //         Dear {{customer.firstName}} {{customer.lastName}},
  //     </p>
  //     <p>
  //         This email is to inform you that the booking from
  //         <b>{{startDate}} {{startTime}}</b> until
  //         <b>{{endDate}} {{endTime}}</b> for your pets
  //         <b>{{pets}}</b>
  //         has been cancelled with the following reason:
  //         {{reason}}.
  //         Please note that a cancellation fee may apply.
  //     </p>
  //     <p>
  //         Kind regards
  //     </p>`
  //   },
  //   {
  //     name: 'approveBooking',
  //     subject: 'Your booking has been approved.',
  //     body: c`<h4>Thanks for your booking.</h4>
  //     <p>
  //         Dear {{customer.firstName}} {{customer.lastName}},
  //     </p>
  //     <p>
  //         This email is to inform you that the booking from
  //         <b>{{startDate}} {{startTime}}</b> until
  //         <b>{{endDate}} {{endTime}}</b> for your pets
  //         <b>{{pets}}</b>
  //         has been approved.
  //     </p>
  //     <p>
  //         Kind regards
  //     </p>`
  //   },
  //   {
  //     name: 'rejectBooking',
  //     subject: 'Your booking has been rejected.',
  //     body: c`<p>
  //       Dear {{customer.firstName}} {{customer.lastName}},
  //     </p>
  //     <p>
  //         Unfortunately we have to reject your booking from
  //         <b>{{startDate}} {{startTime}}</b> until
  //         <b>{{endDate}} {{endTime}}</b> for your pets
  //         <b>{{pets}}</b>.
  //     </p>
  //     <p>
  //         Kind regards
  //     </p>`
  //   },
  //   {
  //     name: 'replyBooking',
  //     subject: 'With regard to your booking.',
  //     body: ''
  //   }
  // ]

  // const announcements = [
  //   {
  //     title: 'This is a public demo',
  //     message:
  //       'Please do NOT enter personal information when using this demo. It may be public to everyone',
  //     type: 'important',
  //     expirationDate: '2030-01-01'
  //   },
  //   {
  //     title: 'Admin account',
  //     message: 'admin@petboarding.app / qjiNWdT8L',
  //     type: 'general',
  //     expirationDate: '2030-01-01'
  //   }
  // ]

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

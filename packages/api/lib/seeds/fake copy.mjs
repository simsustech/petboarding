import generateData from './fake/generateData.mjs'
import bcrypt from 'bcrypt'
import * as compressTag from 'compress-tag'
const { c } = compressTag
export const seed = async (knex) => {
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
  } = generateData()
  const categories = [
    {
      species: 'dog',
      order: 1,
      name: 'Small',
      price: 1000
    }
  ]
  const openingTimes = [
    {
      name: 'Morning',
      start_day_counted: 1,
      end_day_counted: 0.5,
      days_of_week: '[0,1,2,3,4,5,6]',
      unavailable_holidays: '["01-01"]',
      start_time: '09:00',
      end_time: '10:00'
    },
    {
      name: 'Evening',
      start_day_counted: 0.5,
      end_day_counted: 1.0,
      days_of_week: '[1,2,3,4,5]',
      unavailable_holidays: '["01-01"]',
      start_time: '17:00',
      end_time: '18:00'
    }
  ]

  const services = [
    {
      name: 'Wash pet(s)',
      description: 'Pet(s) will be washed before leaving.',
      type: 'appointment',
      list_price: null,
      hidden: false
    },
    {
      name: 'Groom pet(s)',
      description: 'Pet(s) will be groomed during their stay.',
      type: 'appointment',
      list_price: null,
      hidden: false
    },
    {
      name: 'Intensive medical care',
      description: 'Pet(s) required intensive medical care during their stay.',
      type: 'surcharge',
      list_price: null,
      hidden: true
    },
    {
      name: 'Veterinarian visit',
      description: 'Pet(s) required a visit to the veterinarian',
      type: 'surcharge',
      list_price: null,
      hidden: true
    }
  ]

  const emailTemplates = [
    {
      name: 'cancelBooking',
      body: c`<p>
      <b>{{customer.firstName}} {{customer.lastName}}</b> has cancelled the booking from
      <b>{{startDate}} {{startTime}}</b> until
      <b>{{endDate}} {{endTime}}</b> for their pets
      <b>{{pets}}</b> with the following reason: <br /><br />
      <b>{{reason}}</b>
    </p>`
    },
    {
      name: 'approveBooking',
      subject: 'Your booking has been approved.',
      body: c`<h4>Thanks for your booking.</h4>
      <p>
          Dear {{customer.firstName}} {{customer.lastName}},
      </p>
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
      expiration_date: '2030-01-01'
    }
  ]

  await knex('announcements').insert(announcements)
  await knex('categories').insert(categories)
  await knex('opening_times').insert(openingTimes)
  await knex('services').insert(services)
  await knex('accounts').insert(accounts)
  await knex('customers').insert(customers)
  await knex.raw(
    `ALTER SEQUENCE customers_id_seq RESTART WITH ${customers.length + 1}`
  )
  await knex('contact_people').insert(contactPeople)
  await knex.raw(
    `ALTER SEQUENCE contact_people_id_seq RESTART WITH ${
      contactPeople.length + 1
    }`
  )
  await knex('pets').insert(pets)
  await knex.raw(`ALTER SEQUENCE pets_id_seq RESTART WITH ${pets.length + 1}`)
  await knex('bookings').insert(bookings)
  await knex.raw(
    `ALTER SEQUENCE bookings_id_seq RESTART WITH ${bookings.length + 1}`
  )
  await knex('booking_pet_kennel').insert(bookingPet)
  await knex('booking_status').insert(bookingStatuses)
  await knex('daycare_dates').insert(daycareDates)
  await knex.raw(
    `ALTER SEQUENCE daycare_dates_id_seq RESTART WITH ${
      daycareDates.length + 1
    }`
  )
  await knex('daycare_date_pet_kennel').insert(daycarePet)
  await knex('email_templates').insert(emailTemplates)
  const adminAccounts = await knex('accounts')
    .insert([
      {
        email: 'admin@petboarding.app',
        roles: 'administrator,employee'
      }
    ])
    .returning('id')
  const admin = adminAccounts[0]
  await knex('authentication_methods').insert([
    {
      account_id: admin.id,
      provider: 'native',
      password: await bcrypt.hash('qjiNWdT8L', 10)
    }
  ])
}

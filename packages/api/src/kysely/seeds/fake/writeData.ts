import generateData from './generateData.js'
import { writeFileSync } from 'fs'
import { c } from 'compress-tag'
import { OPENING_TIME_TYPE } from '../../types.js'

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
    subject: 'Your booking has been cancelled.',
    body: c`<h4>Your booking has been cancelled.</h4>
    <p>
        Dear {{customer.firstName}} {{customer.lastName}},
    </p>
    <p>
        This email is to inform you that the booking from
        <b>{{startDate}} {{startTime}}</b> until
        <b>{{endDate}} {{endTime}}</b> for your pets
        <b>{{pets}}</b>
        has been cancelled with the following reason:
        {{reason}}.
        Please note that a cancellation fee may apply.
    </p>
    <p>
        Kind regards
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
    title: 'Admin account',
    message: 'admin@petboarding.app / qjiNWdT8L',
    type: 'general',
    expirationDate: '2030-01-01'
  }
]

const json = JSON.stringify({
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
})

writeFileSync(new URL('./data.json', import.meta.url).pathname, json, 'utf-8')

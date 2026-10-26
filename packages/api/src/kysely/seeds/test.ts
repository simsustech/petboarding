import { hashPassword } from '@vitrify/tools/scrypt'
import { db } from '../index.js'
import { sql } from 'kysely'
import { addDays } from 'date-fns'
import {
  BOOKING_STATUS,
  DAYCARE_DATE_STATUS,
  CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS,
  OPENING_TIME_TYPE,
  PERIOD_TYPE,
  PET_ALERT_CONDITIONS,
  SERVICE_TYPE
} from '@petboarding/tools/constants'
import { getRandomInt } from './demo/index.js'

const CURRENT_YEAR = new Date().getFullYear()

// Fixture pet photos: 64x64 solid-colour JPEGs, committed as base64 so the e2e
// seed stays hermetic (no network, unlike the demo seed's `fetch(...)`).
const PET_PHOTO_TEAL_B64 =
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCABAAEADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAUG/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8ArAKLJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/9k='
const PET_PHOTO_ORANGE_B64 =
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCABAAEADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAT/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwC0BELwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//2Q=='

const seed = async () => {
  // Guard: if any test data already exists, skip reseeding
  // Guard: if any accounts already exist, skip reseeding to make seed idempotent
  const existingCount = await sql<{
    count: number
  }>`SELECT count(*)::int as count FROM accounts`.execute(db)
  if (Number(existingCount?.rows?.[0]?.count ?? 0) > 0) {
    console.log('Test database already seeded. Skipping reseed.')
    return
  }

  const accounts = [1, 2, 3, 4, 5].map((nr) => ({
    email: `test${nr}@petboarding.app`
  }))

  const customers = [1, 2, 3, 4, 5].map((nr) => ({
    gender: 'male' as const,
    firstName: `firstName${nr}`,
    lastName: `lastName${nr}`,
    address: `address${nr}`,
    city: `city${nr}`,
    postalCode: `postalCode${nr}`,
    veterinarian: `veterinarian${nr}`,
    telephoneNumber: `telephoneNumber${nr}`,
    accountId: nr
  }))

  const contactPeople = [1, 2, 3, 4, 5].map((nr) => ({
    firstName: `firstName${nr}`,
    lastName: `lastName${nr}`,
    telephoneNumber: `telephoneNumber${nr}`,
    customerId: nr
  }))

  const pets = [1, 2, 3, 4, 5].map((nr) => ({
    species: 'dog',
    name: `name${nr}`,
    breed: `name${nr}`,
    categoryId: 1,
    birthDate: '2020-02-02',
    gender: 'male',
    sterilized: true,
    customerId: nr,
    rating: nr === 2 ? 4 : 0,
    // Pet photo. The layout/picker show a camera icon (and preview on hover)
    // only when `image` is non-empty, so the fixture supplies one per pet; the
    // demo seed fetches bytes over the network, which a hermetic e2e seed must
    // not do, so these are two committed 64x64 JPEGs (teal / orange), cycled.
    image: Buffer.from(
      nr % 2 === 0 ? PET_PHOTO_TEAL_B64 : PET_PHOTO_ORANGE_B64,
      'base64'
    ),
    food: {
      timesADay: 2,
      amount: getRandomInt(300),
      amountUnit: 'gram' as const,
      kind: 'Generic'
    }
  }))

  const petAlerts = [
    {
      petId: 2,
      condition: PET_ALERT_CONDITIONS.AGGRESSIVE,
      startDate: '2024-01-05',
      endDate: '2024-01-12'
    },
    {
      petId: 2,
      condition: PET_ALERT_CONDITIONS.DIABETIC,
      startDate: null,
      endDate: null
    }
  ]

  const bookings = [1, 2, 3, 4, 5].map((nr) => ({
    startDate: `2024-01-0${nr}`,
    endDate: `2024-01-1${nr}`,
    startTimeId: 1,
    endTimeId: 1,
    customerId: nr
  }))
  bookings.push({
    startDate: `${CURRENT_YEAR}-01-01`,
    endDate: `${CURRENT_YEAR}-01-11`,
    startTimeId: 1,
    endTimeId: 1,
    customerId: 5
  })

  // Booking 2 / pet 2 is intentionally seeded *with* `kennelId: 1` so the
  // kennelLayout drag-to-waitlist e2e can exercise a non-null
  // `bookingPetKennel.kennelId`, which is the state needed to reproduce the
  // original bug where pets reappear in their original kennel on a fresh
  // server read.
  const bookingPet: Array<{
    bookingId: number
    petId: number
    kennelId?: number | null
  }> = [
    { bookingId: 1, petId: 1 },
    { bookingId: 2, petId: 2, kennelId: 1 },
    { bookingId: 3, petId: 3 },
    { bookingId: 4, petId: 4 },
    { bookingId: 5, petId: 5 }
  ]
  bookingPet.push({
    bookingId: 6,
    petId: 5
  })

  const bookingStatusesEnum = [
    BOOKING_STATUS.PENDING,
    BOOKING_STATUS.APPROVED,
    BOOKING_STATUS.REJECTED,
    BOOKING_STATUS.CANCELED,
    BOOKING_STATUS.CANCELED_OUTSIDE_PERIOD
  ]

  const daycareDateStatusesEnum = [
    DAYCARE_DATE_STATUS.PENDING,
    DAYCARE_DATE_STATUS.APPROVED,
    DAYCARE_DATE_STATUS.REJECTED,
    DAYCARE_DATE_STATUS.CANCELED,
    DAYCARE_DATE_STATUS.STANDBY
  ]
  const bookingStatuses = [1, 2, 3, 4, 5].map((nr) => ({
    ...bookings[nr - 1],
    bookingId: nr,
    status: bookingStatusesEnum[nr - 1],
    petIds: `[${nr}]`,
    modifiedAt: new Date().toISOString(),
    customerId: undefined
  }))

  // Override booking #5 status to PENDING for the approve test
  bookingStatuses[4].status = BOOKING_STATUS.PENDING
  bookingStatuses.push({
    ...bookings[5],
    bookingId: 6,
    status: bookingStatusesEnum[0],
    petIds: `[${5}]`,
    modifiedAt: new Date().toISOString(),
    customerId: undefined
  })

  // Booking 7: modified booking (27.5→20.5 days, Zomervakantie 2026)
  bookings.push({
    startDate: '2026-07-20',
    endDate: '2026-08-09',
    startTimeId: 1,
    endTimeId: 1,
    customerId: 1
  })
  bookingPet.push({
    bookingId: 7,
    petId: 1
  })
  bookingStatuses.push({
    startDate: '2026-07-20',
    endDate: '2026-08-16',
    startTimeId: 1,
    endTimeId: 1,
    bookingId: 7,
    customerId: undefined,
    status: BOOKING_STATUS.APPROVED,
    petIds: '[1]',
    modifiedAt: '2025-11-05T12:28:00.000Z'
  })
  bookingStatuses.push({
    startDate: '2026-07-20',
    endDate: '2026-08-09',
    startTimeId: 1,
    endTimeId: 1,
    bookingId: 7,
    customerId: undefined,
    status: BOOKING_STATUS.PENDING,
    petIds: '[1]',
    modifiedAt: '2026-07-15T14:32:00.000Z'
  })
  bookingStatuses.push({
    startDate: '2026-07-20',
    endDate: '2026-08-09',
    startTimeId: 1,
    endTimeId: 1,
    bookingId: 7,
    customerId: undefined,
    status: BOOKING_STATUS.APPROVED,
    petIds: '[1]',
    modifiedAt: '2026-07-15T19:08:00.000Z'
  })

  bookings.push({
    startDate: `${CURRENT_YEAR}-02-01`,
    endDate: `${CURRENT_YEAR}-02-11`,
    startTimeId: 1,
    endTimeId: 1,
    customerId: 2
  })
  bookingPet.push({
    bookingId: 8,
    petId: 2
  })
  bookingStatuses.push({
    ...bookings.at(-1)!,
    bookingId: 8,
    status: BOOKING_STATUS.PENDING,
    petIds: '[2]',
    modifiedAt: new Date().toISOString(),
    customerId: undefined
  })

  // Bookings 9 + 10 (kennel-picker tint fixture, plan step 4): on
  // 2024-03-01 → 2024-03-10 pet 3 sits in kennel 1 and pet 4 in kennel 2, so
  // the picker's compatibility tint has a picked pet and an occupant on one
  // date — deliberately WITHOUT touching pet 2's relations, which
  // tests/e2e/features/deceased-pet-relations.spec.ts asserts stay empty in
  // pet 2's relations dialog select.
  bookings.push({
    startDate: '2024-03-01',
    endDate: '2024-03-10',
    startTimeId: 1,
    endTimeId: 1,
    customerId: 3
  })
  bookingPet.push({
    bookingId: 9,
    petId: 3,
    kennelId: 1
  })
  bookingStatuses.push({
    ...bookings.at(-1)!,
    bookingId: 9,
    status: BOOKING_STATUS.APPROVED,
    petIds: '[3]',
    modifiedAt: new Date().toISOString(),
    customerId: undefined
  })
  bookings.push({
    startDate: '2024-03-01',
    endDate: '2024-03-10',
    startTimeId: 1,
    endTimeId: 1,
    customerId: 4
  })
  bookingPet.push({
    bookingId: 10,
    petId: 4,
    kennelId: 2
  })
  bookingStatuses.push({
    ...bookings.at(-1)!,
    bookingId: 10,
    status: BOOKING_STATUS.APPROVED,
    petIds: '[4]',
    modifiedAt: new Date().toISOString(),
    customerId: undefined
  })

  // Tint-testing windows (bookings 11–16): three more dates where two pets are
  // visible together so the picker's rating badges can be eyeballed across the
  // palette — Apr: pet 1 in kennel 3 + pet 5 on the waitlist (★8 green),
  // May: pet 5 in kennel 1 + pet 3 in kennel 2 (★1 red),
  // Jun: pet 4 in kennel 1 + pet 1 in kennel 2 (★10 emerald).
  // pet 2 stays out of every pair: deceased-pet-relations.spec.ts pins its
  // relations dialog select.
  const tintWindows: {
    startDate: string
    endDate: string
    customerId: number
    bookingId: number
    petId: number
    kennelId?: number
  }[] = [
    {
      startDate: '2024-04-01',
      endDate: '2024-04-10',
      customerId: 1,
      bookingId: 11,
      petId: 1,
      kennelId: 3
    },
    {
      startDate: '2024-04-01',
      endDate: '2024-04-10',
      customerId: 5,
      bookingId: 12,
      petId: 5
    },
    {
      startDate: '2024-05-01',
      endDate: '2024-05-10',
      customerId: 5,
      bookingId: 13,
      petId: 5,
      kennelId: 1
    },
    {
      startDate: '2024-05-01',
      endDate: '2024-05-10',
      customerId: 3,
      bookingId: 14,
      petId: 3,
      kennelId: 2
    },
    {
      startDate: '2024-06-01',
      endDate: '2024-06-10',
      customerId: 4,
      bookingId: 15,
      petId: 4,
      kennelId: 1
    },
    {
      startDate: '2024-06-01',
      endDate: '2024-06-10',
      customerId: 1,
      bookingId: 16,
      petId: 1,
      kennelId: 2
    },
    // Jul 2024: FOUR pets share kennel 1. The picker excludes the pet being
    // placed from a kennel's occupant list (you are moving it, so it is not an
    // "other" occupant), so three must be left over to exercise the cap
    // (MAX_VISIBLE_OCCUPANTS = 2 → two chips + a "+1 more" remainder).
    {
      startDate: '2024-07-01',
      endDate: '2024-07-10',
      customerId: 3,
      bookingId: 17,
      petId: 3,
      kennelId: 1
    },
    {
      startDate: '2024-07-01',
      endDate: '2024-07-10',
      customerId: 4,
      bookingId: 18,
      petId: 4,
      kennelId: 1
    },
    {
      startDate: '2024-07-01',
      endDate: '2024-07-10',
      customerId: 5,
      bookingId: 19,
      petId: 5,
      kennelId: 1
    },
    // Pet 1 is the fourth occupant, and the one the test opens the picker from.
    // Self-exclusion then leaves three: two chips + a "+1 more" remainder.
    {
      startDate: '2024-07-01',
      endDate: '2024-07-10',
      customerId: 1,
      bookingId: 20,
      petId: 1,
      kennelId: 1
    }
  ]
  for (const w of tintWindows) {
    bookings.push({
      startDate: w.startDate,
      endDate: w.endDate,
      startTimeId: 1,
      endTimeId: 1,
      customerId: w.customerId
    })
    bookingPet.push({
      bookingId: w.bookingId,
      petId: w.petId,
      kennelId: w.kennelId
    })
    bookingStatuses.push({
      ...bookings.at(-1)!,
      bookingId: w.bookingId,
      status: BOOKING_STATUS.APPROVED,
      petIds: `[${w.petId}]`,
      modifiedAt: new Date().toISOString(),
      customerId: undefined
    })
  }

  const daycareDates = [1, 2, 3, 4, 5].map((nr) => ({
    date: `2024-02-0${nr}`,
    customerId: nr,
    status: daycareDateStatusesEnum[nr - 1]
  }))

  const daycarePet = [1, 2, 3, 4, 5].map((nr) => ({
    daycareDateId: nr,
    petId: nr
  }))

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
      // unavailableHolidays: '["01-01"]',
      unavailableHolidays: '[]',
      startTime: '09:00',
      endTime: '10:00',
      type: OPENING_TIME_TYPE.ALL
    },
    {
      name: 'Evening',
      startDayCounted: 0.5,
      endDayCounted: 1.0,
      daysOfWeek: '[0,1,2,3,4,5,6]',
      unavailableHolidays: '[]',
      // unavailableHolidays: '["01-01"]',
      startTime: '17:00',
      endTime: '18:00',
      type: OPENING_TIME_TYPE.ALL
    }
  ]

  const services = [
    {
      name: 'Wash pet(s)',
      description: 'Pet(s) will be washed before leaving.',
      type: SERVICE_TYPE.APPOINTMENT,
      listPrice: null,
      hidden: false
    },
    {
      name: 'Groom pet(s)',
      description: 'Pet(s) will be groomed during their stay.',
      type: SERVICE_TYPE.APPOINTMENT,
      listPrice: null,
      hidden: false
    },
    {
      name: 'Intensive medical care',
      description: 'Pet(s) required intensive medical care during their stay.',
      type: SERVICE_TYPE.SURCHARGE,
      listPrice: null,
      hidden: true
    },
    {
      name: 'Veterinarian visit',
      description: 'Pet(s) required a visit to the veterinarian',
      type: SERVICE_TYPE.SURCHARGE,
      listPrice: null,
      hidden: true
    }
  ]

  const documents = [
    {
      name: 'privacyPolicy',
      content: `# Privacy policy

A product of:
simsustech
https://www.simsus.tech
info@simsus.tech

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
      content: `# Terms and conditions

These terms and conditions apply to every booking made through Petboarding and to
every service the client (the business using Petboarding) provides for the pet.

## 1. Bookings

A booking is a request until the client approves it. The client may reject a booking
or place it on the reserve list. Times are indicative: arrival and departure happen
within the opening times the client publishes. The customer is responsible for the
accuracy of the details entered for the pet, including species, medication and
alerts.

## 2. Payment

Prices follow the categories and services the client publishes. Payment is due
before the start of the booking unless the client agreed otherwise in writing. Any
surcharge for a period or a vacation day is charged per day.

## 3. Cancellation

Cancelling before the start of the booking is free of charge unless the client
publishes a cancellation fee. Cancelling during the booking charges the days the pet
stayed, plus any day the client cannot rebook. The client may invoice a cancellation
cost in the cases the client publishes.

## 4. Liability

The customer declares that the pet is healthy and that the vaccinations the client
requires are up to date. The customer reports contagious diseases before arrival.
The client does not accept liability for damage the pet causes to itself or to
others, except in the case of intent or gross negligence.

## 5. Privacy

The personal data Petboarding processes for this booking is described in the privacy
policy the client publishes.

# Algemene voorwaarden

Deze algemene voorwaarden gelden voor elke boeking via Petboarding en voor elke dienst
die de klant (het bedrijf dat Petboarding gebruikt) voor het dier levert.

## 1. Boekingen

Een boeking is een aanvraag totdat de klant deze goedkeurt. De klant kan een boeking
weigeren of op de reservelijst plaatsen. Tijden zijn indicatief: aankomst en vertrek
vinden plaats binnen de openingstijden die de klant publiceert. De klant is
verantwoordelijk voor de juistheid van de gegevens van het dier, waaronder soort,
medicatie en alerts.

## 2. Betaling

Prijzen volgen de categorie\u00ebn en diensten die de klant publiceert. Betaling vindt
plaats voor de start van de boeking, tenzij de klant schriftelijk anders is
overeengekomen. Een toeslag voor een periode of vakantiedag wordt per dag gerekend.

## 3. Annulering

Annuleren voor de start van de boeking is kosteloos, tenzij de klant een
annuleringskosten publiceert. Annuleren tijdens de boeking brengt de dagen in rekening
die het dier is gebleven, plus een dag die de klant niet opnieuw kan verhuren. De klant
kan annuleringskosten factureren in de gevallen die de klant publiceert.`
    }
  ]

  // const emailTemplates = [
  //   {
  //     name: 'cancelBooking',
  //     subject: 'Your booking has been canceled.',
  //     body: c`<h4>Your booking has been canceled.</h4>
  //     <p>
  //         Dear {{customer.firstName}} {{customer.lastName}},
  //     </p>
  //     <p>
  //         This email is to inform you that the booking from
  //         <b>{{startDate}} {{startTime}}</b> until
  //         <b>{{endDate}} {{endTime}}</b> for your pets
  //         <b>{{pets}}</b>
  //         has been canceled with the following reason:
  //         {{reason}}.
  //         Please note that a cancelation fee may apply.
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
  //     name: 'standbyBooking',
  //     subject: 'Your booking has been placed on the reserve list.',
  //     body: c`<p>
  //       Dear {{customer.firstName}} {{customer.lastName}},
  //     </p>
  //     <p>
  //         Your booking from
  //         <b>{{startDate}} {{startTime}}</b> until
  //         <b>{{endDate}} {{endTime}}</b> for your pets
  //         <b>{{pets}}</b> has been placed on the reserve list.
  //         We advise you to find an alternative.
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

  const buildings = [
    {
      name: 'Main building',
      location: 'A',
      description: 'The main building'
    }
  ]

  const kennels = Array.from({ length: 10 }, (_, i) => ({
    name: (i + 1).toString(),
    buildingId: 1
  }))

  const daycareSubscriptions = [
    {
      description: '5 days per week',
      numberOfDays: 5,
      validityPeriod: JSON.stringify({ years: 0, months: 1, days: 0 }),
      listPrice: 25000
    }
  ]

  const announcements = [
    {
      title: 'This is a public demo',
      message:
        'Please do NOT enter personal information when using this demo. It may be public to everyone',
      type: 'important',
      expirationDate: '2030-01-01'
    }
  ]

  const customerDaycareSubscriptions = [
    {
      effectiveDate: `${CURRENT_YEAR}-01-01`,
      expirationDate: `${CURRENT_YEAR + 1}-12-31`,
      status: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID,
      daycareSubscriptionId: 1,
      customerId: 1
    }
  ]

  await db.insertInto('buildings').values(buildings).execute()
  await db.insertInto('kennels').values(kennels).execute()
  await db.insertInto('announcements').values(announcements).execute()

  const baseDate = new Date('2030-01-01')
  const vacations = Array.from({ length: 12 }, (_, i) => ({
    name: `Vacation ${String(i + 1).padStart(2, '0')}`,
    startDate: addDays(baseDate, i * 7)
      .toISOString()
      .slice(0, 10),
    endDate: addDays(baseDate, i * 7 + 2)
      .toISOString()
      .slice(0, 10),
    surchargePerDay: 0
  }))
  await db.insertInto('vacations').values(vacations).execute()

  const periodBase = new Date('2030-06-01')
  const periods = Array.from({ length: 12 }, (_, i) => ({
    startDate: addDays(periodBase, i * 3)
      .toISOString()
      .slice(0, 10),
    endDate: addDays(periodBase, i * 3 + 1)
      .toISOString()
      .slice(0, 10),
    type: PERIOD_TYPE.UNAVAILABLE_FOR_ALL,
    comments: `Period ${String(i + 1).padStart(2, '0')}`
  }))
  await db.insertInto('periods').values(periods).execute()

  // Reset the sequence so categoryPrices.categoryId=1 references the inserted category
  // Reset sequence so category always gets id=1 for categoryPrices to reference
  await sql`ALTER SEQUENCE categories_id_seq RESTART WITH 1`.execute(db)
  await db.insertInto('categories').values(categories).execute()
  await db.insertInto('categoryPrices').values(categoryPrices).execute()
  await db.insertInto('openingTimes').values(openingTimes).execute()
  await db.insertInto('services').values(services).execute()
  await db.insertInto('accounts').values(accounts).execute()

  await db.insertInto('customers').values(customers).execute()
  await sql`ALTER SEQUENCE customers_id_seq RESTART WITH ${sql.lit(
    customers.length + 1
  )}`.execute(db)

  await db
    .insertInto('daycareSubscriptions')
    .values(daycareSubscriptions)
    .execute()
  await db
    .insertInto('customerDaycareSubscriptions')
    .values(customerDaycareSubscriptions)
    .execute()
  await db.insertInto('contactPeople').values(contactPeople).execute()

  await sql`ALTER SEQUENCE contact_people_id_seq RESTART WITH ${sql.lit(
    contactPeople.length + 1
  )}`.execute(db)
  await db.insertInto('pets').values(pets).execute()
  await db.insertInto('petAlerts').values(petAlerts).execute()

  // Kennel-picker tint e2e fixture (plan step 4 + 2026-10-07 badge extension):
  // rating pairs across the palette — (3,4) r3 orange (Mar), (1,5) r8 green
  // (Apr), (3,5) r1 red (May), (1,4) r10 emerald (Jun). pet_id1 < pet_id2 is
  // required (migration 29 check constraint); must run after the pets insert
  // (FK pet_relations_pet_id1_fkey). Deliberately no row involving pet 2 —
  // deceased-pet-relations.spec.ts pins pet 2's relations dialog select.
  const petRelations = [
    { petId1: 3, petId2: 4, rating: 3 },
    { petId1: 1, petId2: 5, rating: 8 },
    { petId1: 3, petId2: 5, rating: 1 },
    { petId1: 1, petId2: 4, rating: 10 }
  ]
  await db.insertInto('petRelations').values(petRelations).execute()
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
  // await db.insertInto('emailTemplates').values(emailTemplates).execute()
  await db.insertInto('documents').values(documents).execute()

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

  const [adminCustomer] = await db
    .insertInto('customers')
    .values({
      gender: 'other',
      firstName: 'Alex',
      lastName: 'Administrator',
      address: '1 Test Street',
      city: 'Testville',
      postalCode: '1234 AB',
      veterinarian: 'Dr. Example',
      telephoneNumber: '+31 20 123 4567',
      accountId: admin.id
    })
    .returning('id')
    .execute()

  await db
    .insertInto('customerDaycareSubscriptions')
    .values({
      effectiveDate: `${CURRENT_YEAR}-01-01`,
      expirationDate: `${CURRENT_YEAR + 1}-12-31`,
      status: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID,
      daycareSubscriptionId: 1,
      customerId: adminCustomer.id
    })
    .execute()

  await db
    .insertInto('contactPeople')
    .values({
      firstName: 'Sam',
      lastName: 'Contact',
      telephoneNumber: '+31 20 123 4568',
      customerId: adminCustomer.id
    })
    .execute()

  await db
    .insertInto('pets')
    .values([
      {
        species: 'dog',
        name: 'Buddy',
        breed: 'Labrador Retriever',
        categoryId: 1,
        birthDate: '2021-04-12',
        gender: 'male',
        sterilized: true,
        customerId: adminCustomer.id,
        food: {
          timesADay: 2,
          amount: 250,
          amountUnit: 'gram' as const,
          kind: 'Adult kibble'
        }
      },
      {
        species: 'cat',
        name: 'Milo',
        breed: 'European Shorthair',
        categoryId: 1,
        birthDate: '2022-09-03',
        gender: 'male',
        sterilized: true,
        customerId: adminCustomer.id,
        food: {
          timesADay: 2,
          amount: 80,
          amountUnit: 'gram' as const,
          kind: 'Indoor cat food'
        }
      }
    ])
    .execute()

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

  await db
    .insertInto('authenticationMethods')
    .values([
      {
        accountId: 1,
        provider: 'native',
        password: await hashPassword('qjiNWdT8L')
      }
    ])
    .execute()
  await db
    .updateTable('accounts')
    .set({ roles: '["administrator","employee"]' })
    .where('id', '=', 1)
    .execute()

  // A profileless administrator for the empty-state specs. admin@petboarding.app
  // now always ships with a customer profile, contact people and pets, so those
  // specs need an account that genuinely has none.
  const [profilelessAdmin] = await db
    .insertInto('accounts')
    .values({
      email: 'admin-profileless@petboarding.app',
      roles: `["administrator", "employee"]`
    })
    .returning('id')
    .execute()

  await db
    .insertInto('authenticationMethods')
    .values({
      accountId: profilelessAdmin.id,
      provider: 'native',
      password: await hashPassword('qjiNWdT8L')
    })
    .execute()
}

seed()

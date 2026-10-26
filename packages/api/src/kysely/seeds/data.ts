import { hashPassword } from '@vitrify/tools/scrypt'
import { db } from '../index.js'
import env from '@vitrify/tools/env'
import { OPENING_TIME_TYPE, SERVICE_TYPE } from '@petboarding/tools/constants'
import { getAllVacations } from './vacations/index.js'

const ADMIN_PASSWORD = env.read('PETBOARDING_ADMIN_PASSWORD')
if (!ADMIN_PASSWORD)
  throw new Error('Please provide a PETBOARDING_ADMIN_PASSWORD env variable.')

const seed = async () => {
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
  //     subject: c`Your booking has been approved\\{{#if requiredDownPaymentAmount}} (down payment required!)\\{{/if}}.`,
  //     body: c`<h4>Thanks for your booking.</h4>
  //     <p>
  //         Dear {{customer.firstName}} {{customer.lastName}},
  //     </p>
  //     \\{{#if requiredDownPaymentAmount}}
  //       <p style="color:red;">
  //         This booking requires a down payment. Open the bill with the link below to pay the down payment.
  //         <br />
  //         <b>If you do not pay the down payment within 5 days your booking will automatically be canceled.</b>
  //       </p>
  //     \\{{/if}}
  //     \\{{#if invoiceUrl}}
  //       <p>
  //       <a href="\\{{invoiceUrl}}">Click here to view and pay the bill for this booking.</a>
  //       </p>
  //     \\{{/if}}
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

  // const announcements = []

  // await db.insertInto('announcements').values(announcements).execute()
  await db.insertInto('categories').values(categories).execute()
  await db.insertInto('categoryPrices').values(categoryPrices).execute()
  await db.insertInto('openingTimes').values(openingTimes).execute()
  await db.insertInto('services').values(services).execute()
  await db.insertInto('documents').values(documents).execute()
  // await db.insertInto('emailTemplates').values(emailTemplates).execute()

  const vacations = getAllVacations()
  await db.insertInto('vacations').values(vacations).execute()

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
        password: await hashPassword(ADMIN_PASSWORD)
      }
    ])
    .execute()
}

seed()

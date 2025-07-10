import { hashPassword } from '@vitrify/tools/scrypt'
import { db } from '../index.js'
import env from '@vitrify/tools/env'
import { OPENING_TIME_TYPE, SERVICE_TYPE } from '../types.js'

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

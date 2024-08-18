import { faker } from '@faker-js/faker'
import { addDays } from 'date-fns'
import { DAYCARE_DATE_STATUS } from '../../types.js'

const NUMBER_OF_CUSTOMERS = 200
const MAX_CONTACT_PEOPLE_PER_CUSTOMER = 2
const MAX_PETS_PER_CUSTOMER = 3
const MAX_BOOKINGS_PER_CUSTOMER = 3
const MAX_DAYCARE_DATES_PER_CUSTOMER = 10

const createAccount = () => ({
  email: faker.internet.email()
})

const createCustomer = (accountId: number) => ({
  gender: faker.person.sex(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  postalCode: faker.location.zipCode('####??'),
  veterinarian: faker.person.fullName(),
  telephoneNumber: faker.phone.number(),
  accountId: accountId
})

const createContactPerson = (customerId: number) => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  telephoneNumber: faker.phone.number(),
  customerId: customerId
})

let petId = 0
const createPet = (customerId: number) => {
  const rating =
    faker.number.int({
      min: 0,
      max: 5
    }) || undefined

  const sterilized = faker.datatype.boolean()
  petId++
  return {
    rating,
    species: 'dog',
    name: faker.person.firstName(),
    breed: faker.animal.dog(),
    birthDate: faker.date.past({ years: 10 }).toISOString().split('T')[0],
    color: faker.color.human(),
    food: `${getRandomInt(200)} gr`,
    gender: getRandomInt(2) > 1 ? 'male' : 'female',
    sterilized,
    chemicalSterilizationDate:
      sterilized && faker.number.int({ max: 9 }) === 9
        ? faker.date.past({ years: 1 }).toISOString().split('T')[0]
        : undefined,
    customerId: customerId,
    id: petId
  }
}

const getRandomInt = (max: number) => {
  return Math.floor(Math.random() * max) + 1
}

let bookingId = 0
const createBooking = ({
  startDate,
  customerId
}: {
  startDate: string
  customerId: number
}) => {
  const startFrom = new Date(startDate)
  startDate = faker.date
    .soon({
      days: 90,
      refDate: startFrom
    })
    .toISOString()
    .split('T')[0]
  const endDate = faker.date
    .soon({
      days: 30,
      refDate: startDate
    })
    .toISOString()
    .split('T')[0]
  bookingId++
  return {
    customerId: customerId,
    startDate,
    endDate,
    startTimeId: getRandomInt(2),
    endTimeId: getRandomInt(2),
    id: bookingId
  }
}

let daycareDateId = 0
const createDaycareDate = ({
  startDate,
  customerId
}: {
  startDate: string
  customerId: number
}) => {
  const startFrom = addDays(new Date(startDate), 1)
  // const date = faker.date.soon(15, startFrom).toISOString().split('T')[0]
  const date = faker.date
    .soon({
      days: 15,
      refDate: startFrom
    })
    .toISOString()
    .split('T')[0]
  daycareDateId++
  return {
    customerId: customerId,
    date,
    status:
      getRandomInt(10) > 9
        ? faker.helpers.arrayElement([
            DAYCARE_DATE_STATUS.REJECTED,
            DAYCARE_DATE_STATUS.PENDING,
            DAYCARE_DATE_STATUS.STANDBY,
            DAYCARE_DATE_STATUS.CANCELLED
          ])
        : DAYCARE_DATE_STATUS.APPROVED,
    id: daycareDateId
  }
}

export default () => {
  const accounts: unknown[] = []
  const customers = []
  const contactPeople = []
  const pets = []
  const bookings = []
  const bookingPet: unknown[] = []
  const bookingStatuses = []
  const daycareDates = []
  const daycarePet: unknown[] = []

  for (let i = 1; i < NUMBER_OF_CUSTOMERS + 1; i++) {
    accounts.push(createAccount())
    customers.push(createCustomer(i))
    for (let j = 1; j <= getRandomInt(MAX_CONTACT_PEOPLE_PER_CUSTOMER); j++) {
      contactPeople.push(createContactPerson(i))
    }
    const ownedPets = []
    for (let j = 1; j <= getRandomInt(MAX_PETS_PER_CUSTOMER); j++) {
      const pet = createPet(i)
      pets.push(pet)
      ownedPets.push(pet)
    }
    let booking = {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      startTimeId: 1,
      endTimeId: 1,
      id: 0,
      customerId: i
    }
    if (getRandomInt(2) === 2) {
      for (let j = 1; j <= getRandomInt(MAX_BOOKINGS_PER_CUSTOMER); j++) {
        booking = createBooking({ startDate: booking.endDate, customerId: i })
        const bookingStatus = {
          startDate: booking.startDate,
          endDate: booking.endDate,
          startTimeId: booking.startTimeId,
          endTimeId: booking.endTimeId,
          bookingId: booking.id,
          petIds: `[${ownedPets.map((pet) => pet.id).toString()}]`,
          modifiedAt: new Date().toISOString(),
          status: 'pending'
        }

        bookingStatuses.push(bookingStatus)
        if (getRandomInt(10) > 2) {
          bookingStatuses.push({
            ...bookingStatus,
            modifiedAt: faker.date
              .soon({
                days: 1,
                refDate: new Date()
              })
              .toISOString(),
            status:
              getRandomInt(10) > 9
                ? faker.helpers.arrayElement([
                    'rejected',
                    'standby',
                    'cancelled'
                  ])
                : 'approved'
          })
        }
        bookings.push(booking)
        ownedPets.forEach((pet) => {
          bookingPet.push({
            petId: pet.id,
            bookingId: booking.id
          })
        })
      }
    } else {
      let daycareDate = {
        date: new Date().toISOString().split('T')[0],
        customerId: i,
        status: DAYCARE_DATE_STATUS.PENDING,
        id: 0
      }
      for (let j = 1; j <= getRandomInt(MAX_DAYCARE_DATES_PER_CUSTOMER); j++) {
        daycareDate = createDaycareDate({
          startDate: daycareDate.date,
          customerId: i
        })
        daycareDates.push(daycareDate)
        ownedPets.forEach((pet) => {
          daycarePet.push({
            petId: pet.id,
            daycareDateId: daycareDate.id
          })
        })
      }
    }
  }
  return {
    accounts,
    customers,
    contactPeople,
    pets,
    bookings,
    bookingPet,
    bookingStatuses,
    daycareDates,
    daycarePet
  }
}

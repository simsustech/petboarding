import Faker from '@faker-js/faker'
import datefns from 'date-fns'
const { faker } = Faker
const { addDays } = datefns

const NUMBER_OF_CUSTOMERS = 200
const MAX_CONTACT_PEOPLE_PER_CUSTOMER = 2
const MAX_PETS_PER_CUSTOMER = 3
const MAX_BOOKINGS_PER_CUSTOMER = 3
const MAX_DAYCARE_DATES_PER_CUSTOMER = 10

const createAccount = () => ({
  email: faker.internet.email()
})

const createCustomer = (accountId) => ({
  gender: faker.person.sex(),
  first_name: faker.person.firstName(),
  last_name: faker.person.lastName(),
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  postal_code: faker.location.zipCode('####??'),
  veterinarian: faker.person.fullName(),
  telephone_number: faker.phone.number(),
  account_id: accountId
})

const createContactPerson = (customerId) => ({
  first_name: faker.person.firstName(),
  last_name: faker.person.lastName(),
  telephone_number: faker.phone.number(),
  customer_id: customerId
})

let petId = 0
const createPet = (customerId) => {
  const rating =
    faker.number.int({
      min: 0,
      max: 5
    }) || undefined
  // const rating =
  //   faker.random.numeric() === 9
  //     ? faker.random.numeric(1, { bannedDigits: [0, 6, 7, 8.9] })
  //     : undefined
  const sterilized = faker.datatype.boolean()
  petId++
  return {
    rating,
    species: 'dog',
    name: faker.person.firstName(),
    breed: faker.animal.dog(),
    birth_date: faker.date.past({ years: 10 }),
    gender: getRandomInt(2) > 1 ? 'male' : 'female',
    sterilized,
    chemical_sterilization_date:
      sterilized && faker.number.int({ max: 9 }) === 9
        ? faker.date.past({ years: 1 })
        : undefined,
    customer_id: customerId,
    id: petId
  }
}

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max) + 1
}

let bookingId = 0
const createBooking = ({ startDate, customerId }) => {
  const startFrom = new Date(startDate)
  const start_date = faker.date
    .soon({
      days: 90,
      refDate: startFrom
    })
    .toISOString()
    .split('T')[0]
  const end_date = faker.date
    .soon({
      days: 30,
      refDate: start_date
    })
    .toISOString()
    .split('T')[0]
  bookingId++
  return {
    customer_id: customerId,
    start_date,
    end_date,
    start_time_id: getRandomInt(2),
    end_time_id: getRandomInt(2),
    id: bookingId
  }
}

let daycareDateId = 0
const createDaycareDate = ({ startDate, customerId }) => {
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
    customer_id: customerId,
    date,
    status:
      getRandomInt(10) > 9
        ? faker.helpers.arrayElement([
            'rejected',
            'pending',
            'standby',
            'cancelled'
          ])
        : 'approved',
    id: daycareDateId
  }
}

export default () => {
  const accounts = []
  const customers = []
  const contactPeople = []
  const pets = []
  const bookings = []
  const bookingPet = []
  const bookingStatuses = []
  const daycareDates = []
  const daycarePet = []

  for (let i = 1; i < NUMBER_OF_CUSTOMERS + 1; i++) {
    accounts.push(createAccount())
    customers.push(createCustomer(i))
    for (let j = 1; j <= getRandomInt(MAX_CONTACT_PEOPLE_PER_CUSTOMER); j++) {
      contactPeople.push(createContactPerson(i))
    }
    let ownedPets = []
    for (let j = 1; j <= getRandomInt(MAX_PETS_PER_CUSTOMER); j++) {
      let pet = createPet(i)
      pets.push(pet)
      ownedPets.push(pet)
    }
    let booking = {
      end_date: new Date().toISOString().split('T')[0]
    }
    if (getRandomInt(2) === 2) {
      for (let j = 1; j <= getRandomInt(MAX_BOOKINGS_PER_CUSTOMER); j++) {
        booking = createBooking({ startDate: booking.end_date, customerId: i })
        const bookingStatus = {
          ...booking,
          booking_id: booking.id,
          pet_ids: `[${ownedPets.map((pet) => pet.id).toString()}]`,
          modified_at: new Date().toISOString(),
          status: 'pending'
        }
        delete bookingStatus.id
        delete bookingStatus.customer_id
        bookingStatuses.push(bookingStatus)
        if (getRandomInt(10) > 2) {
          bookingStatuses.push({
            ...bookingStatus,
            modified_at: faker.date
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
            pet_id: pet.id,
            booking_id: booking.id
          })
        })
      }
    } else {
      let daycareDate = {
        date: new Date().toISOString().split('T')[0]
      }
      for (let j = 1; j <= getRandomInt(MAX_DAYCARE_DATES_PER_CUSTOMER); j++) {
        daycareDate = createDaycareDate({
          startDate: daycareDate.date,
          customerId: i
        })
        daycareDates.push(daycareDate)
        ownedPets.forEach((pet) => {
          daycarePet.push({
            pet_id: pet.id,
            daycare_date_id: daycareDate.id
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

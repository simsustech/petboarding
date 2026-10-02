import generateData from './generateData.js'
import { writeFileSync } from 'fs'

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

const json = JSON.stringify({
  accounts,
  customers,
  contactPeople,
  pets,
  bookings,
  bookingPet,
  bookingStatuses,
  daycareDates,
  daycarePet
})

writeFileSync(new URL('./data.json', import.meta.url).pathname, json, 'utf-8')

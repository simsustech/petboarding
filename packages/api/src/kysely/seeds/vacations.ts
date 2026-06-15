import { db } from '../index.js'
import { getAllVacations } from './vacations/index.js'

const seedVacations = async () => {
  const vacations = getAllVacations()
  await db.insertInto('vacations').values(vacations).execute()
  console.log(`Seeded ${vacations.length} vacations`)
  await db.destroy()
}

seedVacations()

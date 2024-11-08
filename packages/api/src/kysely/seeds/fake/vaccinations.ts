import { faker } from '@faker-js/faker'
import { db } from '../../index.js'

const createVaccinations = async () => {
  const image = Buffer.from(
    await (
      await fetch(faker.image.avatar()).then((res) => res.blob())
    ).arrayBuffer()
  )

  const types = [['parvo', 'distemper', 'hepatitis'], ['kennelcough']]

  const pets = await db.selectFrom('pets').selectAll().execute()

  const vaccinations = pets.map((pet) => ({
    image: image,
    expirationDate: new Date().toISOString(),
    types: JSON.stringify(types[Math.floor(Math.random() * types.length)]),
    petId: pet.id
  }))

  await db.insertInto('vaccinations').values(vaccinations).execute()
}

createVaccinations()

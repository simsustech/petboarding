import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import * as z from 'zod'
import { pet } from '../../zod/pet.js'
import { VACCINATION_IMAGE_SIZE } from '../../zod/vaccination.js'
import { vaccination } from '../../zod/vaccination.js'
import sharp from 'sharp'
import { subYears } from 'date-fns'
import {
  findPet,
  findPets,
  searchPets,
  updatePet
} from '../../repositories/pet.js'
import {
  createVaccination,
  findVaccinations
} from '../../repositories/vaccination.js'
import { convertPetImage } from '../user/pets.js'
import type { FastifyInstance } from 'fastify'

const employeePetValidation = pet.omit({
  customer: true,
  customerId: true
})

export const convertVaccinationImage = async (uri: string) => {
  const buffer = await sharp(Buffer.from(uri, 'base64'))
    .rotate()
    .resize(VACCINATION_IMAGE_SIZE.width, VACCINATION_IMAGE_SIZE.height, {
      fit: 'inside'
    })
    .toFormat('jpeg', { mozjpeg: true })
    .toBuffer()
  return buffer
}
export const employeePetRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  searchPets: procedure.input(z.string()).query(async ({ input }) => {
    const searchPhrase = input
    if (input) {
      const pets = searchPets(searchPhrase)
      return pets
    }
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  getPet: procedure
    .input(
      z.object({
        id: z.number()
      })
    )
    .query(async ({ input }) => {
      const { id } = input

      if (id) {
        const pet = findPet({
          criteria: {
            id
          },
          select: ['rating', 'comments'],
          relations: {
            vaccinations: true
          }
        })
        return pet
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  getPetsByIds: procedure
    .input(
      z.object({
        ids: z.number().array()
      })
    )
    .query(async ({ input }) => {
      const { ids } = input

      if (ids && ids.length) {
        const pets = await findPets({
          criteria: {
            ids
          },
          select: ['rating', 'comments'],
          relations: {
            vaccinations: true
          }
        })
        return pets
      }
      return []
      // throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  getPetsByCustomerId: procedure
    .input(
      z.object({
        customerId: z.number().optional()
      })
    )
    .query(async ({ input }) => {
      const { customerId } = input

      if (customerId) {
        const pets = await findPets({
          criteria: {
            customerId
          },
          select: ['rating', 'comments'],
          relations: {
            vaccinations: true
          }
        })
        return pets
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  updatePet: procedure
    .input(employeePetValidation)
    .mutation(async ({ input }) => {
      let image: Buffer
      const { id } = input
      if (id) {
        const updateWith = {
          rating: input.rating,
          name: input.name,
          breed: input.breed,
          birthDate: input.birthDate,
          gender: input.gender,
          sterilized: input.sterilized,
          categoryId: input.categoryId,
          chemicalSterilizationDate: input.chemicalSterilizationDate,
          chipNumber: input.chipNumber,
          color: input.color,
          comments: input.comments,
          deceased: input.deceased,
          food: input.food,
          medicines: input.medicines,
          particularities: input.particularities,
          species: input.species,
          weight: input.weight,
          insured: input.insured
        }

        if (input.image) {
          const uri = input.image.split(';base64,').pop()
          if (uri) {
            image = await convertPetImage(uri)

            const pet = await updatePet(
              {
                id
              },
              {
                ...updateWith,
                image
              }
            )
            return pet
          }
        } else {
          const pet = await updatePet(
            {
              id
            },
            {
              ...updateWith
            }
          )
          return pet
        }
      }

      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  createVaccination: procedure
    .input(vaccination)
    .mutation(async ({ input }) => {
      let image: Buffer
      if (input.image) {
        const uri = input.image.split(';base64,').pop()
        if (uri) {
          image = await convertVaccinationImage(uri)

          const vaccination = createVaccination({
            expirationDate: input.expirationDate,
            types: JSON.stringify(input.types),
            petId: input.petId,
            image
          })

          return vaccination
        }
      }

      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  getVaccinationsByPetId: procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const { id } = input
      const threeYearsInThePast = subYears(new Date(), 3)
        .toISOString()
        .slice(0, 10)
      const vaccinations = findVaccinations({
        criteria: {
          expirationDate: threeYearsInThePast,
          petId: id
        }
      })

      if (vaccinations) return vaccinations
      throw new TRPCError({ code: 'BAD_REQUEST' })
    })
})

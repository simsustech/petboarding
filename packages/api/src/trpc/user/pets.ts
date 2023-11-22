import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import { pet } from '../../zod/pet.js'
import sharp from 'sharp'
import { PET_IMAGE_SIZE } from '../../zod/pet.js'
import { findPets, createPet, updatePet } from '../../repositories/pet.js'
import type { Pet } from '../../repositories/pet.js'
import type { FastifyInstance } from 'fastify'
import { findCustomer } from 'src/repositories/customer'

export const userPetValidation = pet.omit({
  customerId: true,
  customer: true,
  vaccinations: true,
  comments: true,
  rating: true,
  categoryId: true
})

export const convertPetImage = async (uri: string) => {
  const buffer = sharp(Buffer.from(uri, 'base64'))
    .resize(PET_IMAGE_SIZE.width, PET_IMAGE_SIZE.height, {
      fit: 'inside'
    })
    .toFormat('jpeg', { mozjpeg: true })
    .toBuffer()
  return buffer
}

export const userPetRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getPets: procedure.query(async ({ ctx }) => {
    if (ctx.account?.id) {
      const customer = await findCustomer({
        criteria: {
          accountId: Number(ctx.account.id)
        }
      })

      if (customer?.id) {
        const pets = await findPets({
          criteria: {
            customerId: customer.id,
            deceased: false
          },
          select: ['image'],
          relations: {
            vaccinations: true
          }
        })

        return pets
      }
    }
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  createPet: procedure
    .input(userPetValidation)
    .mutation(async ({ input, ctx }) => {
      if (ctx.account?.id) {
        const customer = await findCustomer({
          criteria: {
            accountId: Number(ctx.account.id)
          }
        })

        if (customer?.id) {
          let image: Buffer
          let pet: Pet
          if (input.image) {
            const uri = input.image.split(';base64,').pop()
            if (uri) {
              image = await convertPetImage(uri)
              pet = await createPet({
                ...input,
                customerId: customer.id,
                image
              })
              return pet
            }
          } else {
            pet = await createPet({
              ...input,
              customerId: customer.id,
              image: null
            })
            return pet
          }
        }
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  updatePet: procedure
    .input(userPetValidation.required({ id: true }))
    .mutation(async ({ input, ctx }) => {
      if (input.id && ctx.account?.id) {
        const customer = await findCustomer({
          criteria: {
            accountId: Number(ctx.account.id)
          }
        })

        if (customer) {
          let image: Buffer
          let pet: Pet
          if (input.image) {
            const uri = input.image.split(';base64,').pop()
            if (uri) {
              image = await convertPetImage(uri)

              pet = await updatePet(
                {
                  id: input.id
                },
                {
                  ...input,
                  image,
                  customerId: customer.id
                }
              )
              return pet
            }
          } else {
            pet = await updatePet(
              {
                id: input.id
              },
              {
                ...input,
                image: null,
                customerId: customer.id
              }
            )
            return pet
          }
        }
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    })
})

import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import { z } from 'zod'
import { categoryPrice } from '../../zod/categoryPrice.js'
import {
  findCategoryPrices,
  createCategoryPrice,
  updateCategoryPrice,
  deleteCategoryPrice
} from '../../repositories/categoryPrice.js'
import type { FastifyInstance } from 'fastify'

export const configurationCategoryPriceRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getCategoryPrices: procedure.query(async () => {
    const categoryPrices = await findCategoryPrices({
      criteria: {}
    })
    if (categoryPrices) return categoryPrices
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  createCategoryPrice: procedure
    .input(categoryPrice)
    .mutation(async ({ input }) => {
      const categoryPrice = await createCategoryPrice(input)

      if (categoryPrice) return true

      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  updateCategoryPrice: procedure
    .input(categoryPrice)
    .mutation(async ({ input }) => {
      if (input.id) {
        const categoryPrice = await updateCategoryPrice(
          {
            id: input.id
          },
          input
        )

        if (categoryPrice) return true

        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
    }),
  deleteCategoryPrice: procedure
    .input(z.number())
    .mutation(async ({ input }) => {
      const result = await deleteCategoryPrice(input)
      if (result.numDeletedRows) return true
      throw new TRPCError({ code: 'BAD_REQUEST' })
    })
})

import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import { z } from 'zod'
import { category } from '../../zod/category.js'
import {
  findCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../../repositories/category'
import type { FastifyInstance } from 'fastify'

export const configurationCategoryRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getCategories: procedure.query(async () => {
    const categories = await findCategories({
      criteria: {}
    })
    if (categories) return categories
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  createCategory: procedure.input(category).mutation(async ({ input }) => {
    const category = await createCategory(input)

    if (category) return true

    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  updateCategory: procedure.input(category).mutation(async ({ input }) => {
    if (input.id) {
      const category = await updateCategory(
        {
          id: input.id
        },
        input
      )

      if (category) return true

      throw new TRPCError({ code: 'BAD_REQUEST' })
    }
  }),
  deleteCategory: procedure.input(z.number()).mutation(async ({ input }) => {
    const result = await deleteCategory(input)
    if (result.numDeletedRows) return true
    throw new TRPCError({ code: 'BAD_REQUEST' })
  })
})

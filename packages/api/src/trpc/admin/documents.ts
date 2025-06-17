import { t } from '../index.js'
import * as z from 'zod'
import type { FastifyInstance } from 'fastify'
import { updateDocument } from 'src/repositories/document.js'

export const adminDocumentRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  updateTermsAndConditions: procedure
    .input(
      z.object({
        content: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const { content } = input
      updateDocument(
        {
          name: 'termsAndConditions'
        },
        {
          content
        }
      )
    }),
  updatePrivacyPolicy: procedure
    .input(
      z.object({
        content: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const { content } = input
      updateDocument(
        {
          name: 'privacyPolicy'
        },
        {
          content
        }
      )
    })
})

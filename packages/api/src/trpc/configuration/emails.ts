import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import { emailTemplate } from '../../zod/emailtemplate.js'
import {
  findEmailTemplates,
  updateEmailTemplate
} from '../../repositories/emailTemplate.js'
import type { FastifyInstance } from 'fastify'

export const configurationEmailRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getBookingEmailReplies: procedure.query(async () => {
    const templates = findEmailTemplates({
      criteria: {
        names: ['approveBooking', 'rejectBooking', 'replyBooking']
      }
    })

    if (templates) return templates
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  updateBookingEmailReply: procedure
    .input(emailTemplate)
    .mutation(async ({ input }) => {
      if (input.id) {
        const template = await updateEmailTemplate(
          {
            id: input.id
          },
          input
        )
        if (template) return true
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    })
})

import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import { z } from 'zod'
import { announcement } from '../../zod/announcement.js'
import {
  findAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../../repositories/announcement'
import type { FastifyInstance } from 'fastify'

export const configurationAnnouncementRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getAnnouncements: procedure.query(async () => {
    const announcements = await findAnnouncements({
      criteria: {}
    })
    if (announcements) return announcements
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  createAnnouncement: procedure
    .input(announcement)
    .mutation(async ({ input }) => {
      const announcement = await createAnnouncement(input)

      if (announcement) return true

      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  updateAnnouncement: procedure
    .input(announcement)
    .mutation(async ({ input }) => {
      if (input.id) {
        const announcement = await updateAnnouncement(
          {
            id: input.id
          },
          input
        )

        if (announcement) return true

        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
    }),
  deleteAnnouncement: procedure
    .input(z.number())
    .mutation(async ({ input }) => {
      const result = await deleteAnnouncement(input)
      if (result.numDeletedRows) return true
      throw new TRPCError({ code: 'BAD_REQUEST' })
    })
})

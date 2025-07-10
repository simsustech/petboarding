import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useConfigurationGetAnnouncementsQuery = defineQuery(() => {
  const { data: announcements, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetAnnouncementsQuery'],
    query: () => trpc.configuration.getAnnouncements.query()
  })

  return {
    announcements,
    ...rest
  }
})

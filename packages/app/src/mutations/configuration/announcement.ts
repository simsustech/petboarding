import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { Announcement } from '@petboarding/api/zod'

export const useConfigurationCreateAnnouncementMutation = () => {
  const { ...rest } = useMutation({
    mutation: (announcement: Announcement) =>
      trpc.configuration.createAnnouncement.mutate(announcement)
  })
  return {
    ...rest
  }
}

export const useConfigurationUpdateAnnouncementMutation = () => {
  const { ...rest } = useMutation({
    mutation: (announcement: Announcement) =>
      trpc.configuration.updateAnnouncement.mutate(announcement)
  })
  return {
    ...rest
  }
}

export const useConfigurationDeleteAnnouncementMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({ id }: { id: number }) =>
      trpc.configuration.deleteAnnouncement.mutate(id)
  })
  return {
    ...rest
  }
}

import * as z from 'zod'

export enum ANNOUNCEMENT_TYPE {
  GENERAL = 'general',
  IMPORTANT = 'important',
  PRIORITY = 'priority',
  URGENT = 'urgent'
}

export const announcementValidation = {
  id: z.number().optional(),
  title: z.string(),
  message: z.string(),
  type: z.enum(ANNOUNCEMENT_TYPE),
  expirationDate: z.string()
}

export const announcement = z.object(announcementValidation)

export type Announcement = z.infer<typeof announcement>

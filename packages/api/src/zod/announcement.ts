import * as z from 'zod'

import { ANNOUNCEMENT_TYPE } from '@petboarding/tools/constants'

export const announcementValidation = {
  id: z.number().optional(),
  title: z.string(),
  message: z.string(),
  type: z.enum(ANNOUNCEMENT_TYPE),
  expirationDate: z.string()
}

export const announcement = z.object(announcementValidation)

export type Announcement = z.infer<typeof announcement>

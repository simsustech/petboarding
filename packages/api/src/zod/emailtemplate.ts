import * as z from 'zod'

export const emailTemplateValidation = {
  id: z.number().optional(),
  name: z.enum([
    'approveBooking',
    'rejectBooking',
    'replyBooking',
    'standbyBooking'
  ]),
  subject: z.string(),
  body: z.string()
}

export const emailTemplate = z.object(emailTemplateValidation)

export type EmailTemplate = z.infer<typeof emailTemplate>

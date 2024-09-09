export const bookingEmailTemplates = import.meta.glob<{
  subject: string
  body: string
}>('./**/*.ts')

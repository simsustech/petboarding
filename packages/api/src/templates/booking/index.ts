export const bookingTemplates = import.meta.glob<{
  reason: string
}>('./**/*.ts')

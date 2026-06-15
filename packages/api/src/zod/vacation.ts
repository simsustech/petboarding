import * as z from 'zod'

export const vacationValidation = {
  id: z.number().optional(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  surchargePerDay: z.number().optional()
}

export const vacation = z.object(vacationValidation)

export type Vacation = z.infer<typeof vacation>

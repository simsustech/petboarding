import * as z from 'zod'

export enum SERVICE_TYPE {
  APPOINTMENT = 'appointment',
  SURCHARGE = 'surcharge'
}

export const serviceValidation = {
  id: z.number().optional(),
  name: z.string(),
  description: z.string().optional(),
  type: z.nativeEnum(SERVICE_TYPE),
  listPrice: z.number().nullable(),
  hidden: z.boolean().optional(),
  disabled: z.boolean().optional()
}

export const service = z.object(serviceValidation)

export type Service = z.infer<typeof service>

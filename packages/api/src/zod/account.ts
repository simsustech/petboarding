import * as z from 'zod'

export enum PETBOARDING_ACCOUNT_ROLES {
  ADMINISTRATOR = 'administrator',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  INTERN = 'intern',
  POINT_OF_SALE = 'pointofsale'
}

export const accountValidation = {
  id: z.number().optional(),
  name: z.string().optional(),
  email: z.string(),
  verified: z.boolean(),
  customFields: z.unknown().optional(),
  roles: z.array(z.nativeEnum(PETBOARDING_ACCOUNT_ROLES))
}

export const account = z.object(accountValidation)

export type Account = z.infer<typeof account>

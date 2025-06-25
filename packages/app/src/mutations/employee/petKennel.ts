import type { Pet } from '@petboarding/api/zod'
import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useEmployeeSetBookingPetKennelMutation = () => {
  const { ...rest } = useMutation({
    mutation: (
      petKennel: Pick<Pet, 'id' | 'name' | 'food' | 'medicines'> & {
        id: number
        customer: {
          lastName: string
        }
        kennelId: number | null
        bookingId: number
      }
    ) => trpc.employee.setBookingPetKennel.mutate(petKennel)
  })
  return {
    ...rest
  }
}

export const useEmployeeSetDaycareDatePetKennelMutation = () => {
  const { ...rest } = useMutation({
    mutation: (
      petKennel: Pick<Pet, 'id' | 'name' | 'food' | 'medicines'> & {
        id: number
        customer: {
          lastName: string
        }
        kennelId: number | null
        daycareDateId: number
      }
    ) => trpc.employee.setDaycareDatePetKennel.mutate(petKennel)
  })
  return {
    ...rest
  }
}

import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { Category, CategoryPrice } from '@petboarding/api/zod'

export const useConfigurationCreateCategoryMutation = () => {
  const { ...rest } = useMutation({
    mutation: (category: Category) =>
      trpc.configuration.createCategory.mutate(category)
  })
  return {
    ...rest
  }
}

export const useConfigurationUpdateCategoryMutation = () => {
  const { ...rest } = useMutation({
    mutation: (category: Category) =>
      trpc.configuration.updateCategory.mutate(category)
  })
  return {
    ...rest
  }
}

export const useConfigurationDeleteCategoryMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({ id }: { id: number }) =>
      trpc.configuration.deleteCategory.mutate(id)
  })
  return {
    ...rest
  }
}

export const useConfigurationCreateCategoryPriceMutation = () => {
  const { ...rest } = useMutation({
    mutation: (categoryPrice: CategoryPrice) =>
      trpc.configuration.createCategoryPrice.mutate(categoryPrice)
  })
  return {
    ...rest
  }
}

export const useConfigurationDeleteCategoryPriceMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({ id }: { id: number }) =>
      trpc.configuration.deleteCategoryPrice.mutate(id)
  })
  return {
    ...rest
  }
}

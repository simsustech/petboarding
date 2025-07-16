<template>
  <q-page padding @create="openCreateDialog">
    <categories-list
      v-if="categories"
      v-model="categories"
      show-edit-button
      show-delete-button
      @update="openUpdateCategoryDialog"
      @delete="openDeleteCategoryDialog"
      @add-price="openCreateCategoryPriceDialog"
      @delete-price="openDeleteCategoryPriceDialog"
    />
  </q-page>
  <responsive-dialog
    ref="createCategoryDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="create"
  >
    <category-form ref="createCategoryFormRef" @submit="createCategory" />
  </responsive-dialog>
  <responsive-dialog
    ref="updateCategoryDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="update"
  >
    <category-form ref="updateCategoryFormRef" @submit="updateCategory" />
  </responsive-dialog>
  <responsive-dialog
    ref="createCategoryPriceDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="submitCategoryPrice"
  >
    <category-price-form
      ref="createCategoryPriceFormRef"
      @submit="createCategoryPrice"
    />
  </responsive-dialog>
</template>

<script lang="ts">
export default {
  name: 'AdminCategoriesPage'
}
</script>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useLang } from '../../../../lang/index.js'
import { ResponsiveDialog, ResourcePage } from '@simsustech/quasar-components'
import { Category, CategoryPrice } from '@petboarding/api/zod'
import CategoryForm from '../../../../components/category/CategoryForm.vue'
import CategoryPriceForm from '../../../../components/category/CategoryPriceForm.vue'
import CategoriesList from '../../../../components/category/CategoriesList.vue'
import { useQuasar } from 'quasar'
import { EventBus } from 'quasar'
import { inject } from 'vue'
import { useConfigurationGetCategoriesQuery } from 'src/queries/configuration/category.js'
import {
  useConfigurationCreateCategoryMutation,
  useConfigurationCreateCategoryPriceMutation,
  useConfigurationDeleteCategoryMutation,
  useConfigurationDeleteCategoryPriceMutation,
  useConfigurationUpdateCategoryMutation
} from 'src/mutations/configuration/category.js'

const bus = inject<EventBus>('bus')!
bus.on('administrator-configuration-open-categories-create-dialog', () => {
  if (openCreateDialog)
    openCreateDialog({
      done: () => {}
    })
})

const { categories, refetch: execute } = useConfigurationGetCategoriesQuery()

const { mutateAsync: createCategoryMutation } =
  useConfigurationCreateCategoryMutation()
const { mutateAsync: updateCategoryMutation } =
  useConfigurationUpdateCategoryMutation()
const { mutateAsync: deleteCategoryMutation } =
  useConfigurationDeleteCategoryMutation()

const { mutateAsync: createCategoryPriceMutation } =
  useConfigurationCreateCategoryPriceMutation()
const { mutateAsync: deleteCategoryPriceMutation } =
  useConfigurationDeleteCategoryPriceMutation()

const lang = useLang()
const $q = useQuasar()

const createCategoryDialogRef = ref<InstanceType<typeof ResponsiveDialog>>()
const createCategoryFormRef = ref<InstanceType<typeof CategoryForm>>()
const openCreateDialog: InstanceType<
  typeof ResourcePage
>['$props']['onCreate'] = () => {
  createCategoryDialogRef.value?.functions.open()
}

const create: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterCreate = (success?: boolean) => {
    done(success)
    execute()
  }
  createCategoryFormRef.value?.functions.submit({ done: afterCreate })
}

const createCategory: InstanceType<
  typeof CategoryForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  try {
    await createCategoryMutation(data)
    done(true)
    await execute()
  } catch (e) {
    done(false)
  }
}

const updateCategoryDialogRef = ref<typeof ResponsiveDialog>()
const updateCategoryFormRef = ref<typeof CategoryForm>()

const openUpdateCategoryDialog = ({ data }: { data: Category }) => {
  updateCategoryDialogRef.value?.functions.open()
  nextTick(() => {
    updateCategoryFormRef.value?.functions.setValue(data)
  })
}

const update: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterUpdate = (success?: boolean) => {
    done(success)
    execute()
  }
  updateCategoryFormRef.value?.functions.submit({ done: afterUpdate })
}

const updateCategory: InstanceType<
  typeof CategoryForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  try {
    await updateCategoryMutation(data)
    done(true)
    await execute()
  } catch (e) {
    done(false)
  }
}

const openDeleteCategoryDialog = ({ data }: { data: Category }) => {
  $q.dialog({
    html: true,
    cancel: true,
    message: `${lang.value.category.messages.verifyDeletion}<br />
    ${lang.value.category.fields.name}: ${data.name}<br />
    `
  }).onOk(async () => {
    try {
      await deleteCategoryMutation({ id: data.id })
      await execute()
    } catch (e) {}
  })
}

const openDeleteCategoryPriceDialog = ({ data }: { data: CategoryPrice }) => {
  $q.dialog({
    html: true,
    cancel: true,
    message: `${lang.value.categoryPrice.messages.verifyDeletion}<br />
    ${lang.value.categoryPrice.fields.date}: ${data.date}<br />
    `
  }).onOk(async () => {
    try {
      await deleteCategoryPriceMutation({ id: data.id })
      await execute()
    } catch (e) {}
  })
}

const createCategoryPriceDialogRef =
  ref<InstanceType<typeof ResponsiveDialog>>()
const createCategoryPriceFormRef = ref<InstanceType<typeof CategoryPriceForm>>()
const openCreateCategoryPriceDialog: InstanceType<
  typeof CategoriesList
>['$props']['onAddPrice'] = ({ data }) => {
  createCategoryPriceDialogRef.value?.functions.open()
  nextTick(() => {
    createCategoryPriceFormRef.value?.functions.setValue({
      categoryId: data.id!,
      date: new Date().toISOString().slice(0, 10),
      listPrice: 0
    })
  })
}

const submitCategoryPrice: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterCreate = (success?: boolean) => {
    done(success)
    execute()
  }
  createCategoryPriceFormRef.value?.functions.submit({ done: afterCreate })
}

const createCategoryPrice: InstanceType<
  typeof CategoryPriceForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  try {
    await createCategoryPriceMutation(data)
    done(true)
    await execute()
  } catch (e) {
    done(false)
  }
}

onMounted(async () => {
  execute()
})
</script>

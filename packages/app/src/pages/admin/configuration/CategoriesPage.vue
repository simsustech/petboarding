<template>
  <resource-page
    :icons="{ add: 'i-mdi-add', edit: 'i-mdi-edit' }"
    type="create"
    @create="openCreateDialog"
  >
    <template #header>
      {{ lang.category.title }}
    </template>
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
  </resource-page>
  <responsive-dialog
    :icons="{ close: 'i-mdi-close' }"
    ref="createCategoryDialogRef"
    persistent
    @submit="create"
  >
    <category-form ref="createCategoryFormRef" @submit="createCategory" />
  </responsive-dialog>
  <responsive-dialog
    :icons="{ close: 'i-mdi-close' }"
    ref="updateCategoryDialogRef"
    persistent
    @submit="update"
  >
    <category-form ref="updateCategoryFormRef" @submit="updateCategory" />
  </responsive-dialog>
  <responsive-dialog
    :icons="{ close: 'i-mdi-close' }"
    ref="createCategoryPriceDialogRef"
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
import { useLang } from '../../../lang/index.js'
import { ResponsiveDialog, ResourcePage } from '@simsustech/quasar-components'
import { createUseTrpc } from '../../../trpc.js'
import { Category, CategoryPrice } from '@petboarding/api/zod'
import CategoryForm from '../../../components/category/CategoryForm.vue'
import CategoryPriceForm from '../../../components/category/CategoryPriceForm.vue'
import CategoriesList from '../../../components/category/CategoriesList.vue'
import { useQuasar } from 'quasar'
const { useQuery, useMutation } = await createUseTrpc()

const { data: categories, execute } = useQuery(
  'configuration.getCategories',
  {}
)

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
  const result = useMutation('configuration.createCategory', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (done) done(!result.error.value)
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
  const result = useMutation('configuration.updateCategory', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (done) done(!result.error.value)
}

const openDeleteCategoryDialog = ({ data }: { data: Category }) => {
  $q.dialog({
    html: true,
    cancel: true,
    message: `${lang.value.category.messages.verifyDeletion}<br />
    ${lang.value.category.fields.name}: ${data.name}<br />
    `
  }).onOk(async () => {
    const result = useMutation('configuration.deleteCategory', {
      args: data.id,
      immediate: true
    })

    await result.immediatePromise
    if (!result.error.value) await execute()
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
    const result = useMutation('configuration.deleteCategoryPrice', {
      args: data.id,
      immediate: true
    })

    await result.immediatePromise
    if (!result.error.value) await execute()
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
  const result = useMutation('configuration.createCategoryPrice', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (done) {
    done(!result.error.value)
    await execute()
  }
}

onMounted(async () => {
  execute()
})
</script>

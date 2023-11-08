<template>
  <q-page>
    <pet-select
      :model-value="ids"
      multiple
      clearable
      @update:model-value="setParam"
    />

    <div class="row">
      <pet-card
        v-for="pet in data"
        :key="pet.id"
        :model-value="pet"
        :categories="categories"
        use-rating
        show-add-vaccination
        @add:vaccination="openCreateVaccinationDialog"
        @update="openUpdatePetDialog"
        @open-customer="openCustomer"
      />
    </div>
  </q-page>
  <responsive-dialog ref="updatePetDialogRef" persistent @submit="update">
    <pet-form
      ref="updatePetFormRef"
      :categories="categories"
      use-comments
      use-food
      use-rating
      use-category
      use-deceased
      @submit="updatePet"
    ></pet-form>
  </responsive-dialog>

  <responsive-dialog
    ref="createVaccinationDialogRef"
    persistent
    @submit="submitVaccination"
  >
    <vaccination-form
      ref="createVaccinationFormRef"
      @submit="createVaccination"
    />
  </responsive-dialog>
</template>

<script lang="ts">
export default {
  name: 'EmployeePetsPage'
}
</script>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { createUseTrpc } from '../../trpc.js'
import PetSelect from '../../components/employee/PetSelect.vue'
import PetCard from '../../components/pet/PetCard.vue'
import PetForm from '../../components/pet/PetForm.vue'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { extend } from 'quasar'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import VaccinationForm from '../../components/vaccination/VaccinationForm.vue'

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

const route = useRoute()
const router = useRouter()
const { useQuery, useMutation } = await createUseTrpc()

const ids = ref(((route.params.ids as string[]) || []).map((id) => Number(id)))
onBeforeRouteUpdate((to) => {
  if (to.params.ids && Array.isArray(to.params.ids)) {
    ids.value = to.params.ids.map((id) => Number(id))
  }
})

const setParam = (ids: number[]) => router.push({ params: { ids } })
const { data, execute } = useQuery('employee.getPetsByIds', {
  args: reactive({ ids }),
  reactive: {
    args: true
  }
})

const { data: categories, execute: executeCategories } = useQuery(
  'public.getCategories',
  {
    // immediate: true
  }
)

const updatePetDialogRef = ref<typeof ResponsiveDialog>()
const updatePetFormRef = ref<typeof PetForm>()
const openUpdatePetDialog: InstanceType<
  typeof PetCard
>['$props']['onUpdate'] = ({ data }) => {
  updatePetDialogRef.value?.functions.open()
  nextTick(() => {
    updatePetFormRef.value?.functions.setValue(data)
  })
}

const update: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterUpdate = (success?: boolean) => {
    done(success)
    execute()
  }
  updatePetFormRef.value?.functions.submit({ done: afterUpdate })
}

const updatePet: InstanceType<typeof PetForm>['$props']['onSubmit'] = async ({
  pet,
  done
}) => {
  pet = extend(true, {}, pet)
  delete pet.customerId

  const result = useMutation('employee.updatePet', {
    args: pet as WithRequired<typeof pet, 'id'>,
    immediate: true
  })

  await result.immediatePromise

  done(!result.error.value)
}

const createVaccinationDialogRef = ref<typeof ResponsiveDialog>()
const createVaccinationFormRef = ref<typeof VaccinationForm>()
const openCreateVaccinationDialog: InstanceType<
  typeof PetCard
>['$props']['onAdd:vaccination'] = ({ data }) => {
  createVaccinationDialogRef.value?.functions.open()
  nextTick(() => {
    createVaccinationFormRef.value?.functions.setValue({
      petId: data.id,
      species: data.species
    })
  })
}
const submitVaccination: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = ({ done }) => {
  createVaccinationFormRef.value?.functions.submit({ done })
}
const createVaccination: InstanceType<
  typeof VaccinationForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  const vaccination = extend(true, {}, data)

  const result = useMutation('employee.createVaccination', {
    args: vaccination,
    immediate: true
  })

  await result.immediatePromise

  if (!result.error.value) execute()
  done(!result.error.value)
}

const openCustomer: InstanceType<
  typeof PetCard
>['$props']['onOpenCustomer'] = ({ id }) =>
  router.push(`/employee/customers/${id}`)

onMounted(async () => {
  await executeCategories()
  if (route.params.ids) {
    execute()
  }
})
</script>

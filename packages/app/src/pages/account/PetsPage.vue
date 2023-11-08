<template>
  <resource-page
    type="create"
    :disabled="!contactPeopleData?.length"
    @create="openCreateDialog"
    @update="openUpdateDialog"
  >
    <template #header>
      {{ lang.pet.title }}
    </template>
    <div v-if="ready">
      <div v-if="contactPeopleData?.length" class="row">
        <pet-card
          v-for="pet in data"
          :key="pet.id"
          class="col-12"
          :model-value="pet"
          :categories="categories"
          @update="openUpdateDialog"
        />
      </div>

      <div v-else>
        <router-link to="/account/contactpeople">{{
          lang.pet.messages.addContactPeople
        }}</router-link>
      </div>
    </div>

    <responsive-dialog ref="updateDialogRef" persistent @submit="update">
      <pet-form
        ref="updatePetFormRef"
        use-food
        :categories="categories"
        @submit="updatePet"
      ></pet-form>
    </responsive-dialog>
    <responsive-dialog ref="createDialogRef" persistent @submit="create">
      <pet-form
        ref="createPetFormRef"
        use-food
        :categories="categories"
        @submit="createPet"
      ></pet-form>
    </responsive-dialog>
  </resource-page>
</template>

<script lang="ts">
export default {
  name: 'AccountPetsPage'
}
</script>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { createUseTrpc } from '../../trpc.js'
import { ResourcePage, ResponsiveDialog } from '@simsustech/quasar-components'
import PetForm from '../../components/pet/PetForm.vue'
import PetCard from '../../components/pet/PetCard.vue'
import { useLang } from '../../lang/index.js'
import { extend } from 'quasar'
const { useQuery, useMutation } = await createUseTrpc()
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

const lang = useLang()

const { data: contactPeopleData, execute: executeContactPeople } = useQuery(
  'user.getContactPeople',
  {
    // immediate: true
  }
)

const { data: categories, execute: executeCategories } = useQuery(
  'public.getCategories',
  {
    // immediate: true
  }
)

const { data, execute } = useQuery('user.getPets', {
  // immediate: true
})

const updatePetFormRef = ref<typeof PetForm>()
const createPetFormRef = ref<typeof PetForm>()
const updateDialogRef = ref<typeof ResponsiveDialog>()
const createDialogRef = ref<typeof ResponsiveDialog>()

const openUpdateDialog: InstanceType<
  typeof ResourcePage
>['$props']['onUpdate'] = ({ data }) => {
  updateDialogRef.value?.functions.open()
  nextTick(() => {
    updatePetFormRef.value?.functions.setValue(data)
  })
}

const openCreateDialog: InstanceType<
  typeof ResourcePage
>['$props']['onCreate'] = () => {
  createDialogRef.value?.functions.open()
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

const create: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterCreate = (success?: boolean) => {
    done(success)
    execute()
  }
  createPetFormRef.value?.functions.submit({ done: afterCreate })
}

const updatePet: InstanceType<typeof PetForm>['$props']['onSubmit'] = async ({
  pet,
  done
}) => {
  pet = extend(true, {}, pet)
  delete pet.customerId

  const result = useMutation('user.updatePet', {
    args: pet as WithRequired<typeof pet, 'id'>,
    immediate: true
  })

  await result.immediatePromise

  done(!result.error.value)
}

const createPet: InstanceType<typeof PetForm>['$props']['onSubmit'] = async ({
  pet,
  done
}) => {
  delete pet.customerId

  const result = useMutation('user.createPet', {
    args: pet as WithRequired<typeof pet, 'id'>,
    immediate: true
  })

  await result.immediatePromise

  done(!result.error.value)
}

const ready = ref<boolean>(false)
onMounted(async () => {
  // await executeCustomer()
  await executeContactPeople()
  await executeCategories()
  await execute()
  ready.value = true
})
</script>

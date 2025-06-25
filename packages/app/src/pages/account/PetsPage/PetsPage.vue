<template>
  <q-page padding>
    <div v-if="ready">
      <div v-if="contactPeopleData?.length" class="row q-col-gutter-md">
        <pet-card
          v-for="pet in data"
          :key="pet.id"
          class="col-12 col-md-4"
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
  </q-page>
  <responsive-dialog
    ref="updateDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="update"
  >
    <pet-form
      ref="updatePetFormRef"
      use-food
      :categories="categories"
      @submit="updatePet"
    ></pet-form>
  </responsive-dialog>
  <responsive-dialog
    ref="createDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="create"
  >
    <pet-form
      ref="createPetFormRef"
      use-food
      :categories="categories"
      @submit="createPet"
    ></pet-form>
  </responsive-dialog>
</template>

<script lang="ts">
export default {
  name: 'AccountPetsPage'
}
</script>

<script setup lang="ts">
import { ref, nextTick, onMounted, inject } from 'vue'
import { ResourcePage, ResponsiveDialog } from '@simsustech/quasar-components'
import PetForm from '../../../components/pet/PetForm.vue'
import PetCard from '../../../components/pet/PetCard.vue'
import { useLang } from '../../../lang/index.js'
import { extend } from 'quasar'

import { EventBus } from 'quasar'
import { useAccountGetContactPeopleQuery } from 'src/queries/account/contactperson.js'
import { useAccountGetPetsQuery } from 'src/queries/account/pet.js'
import { usePublicGetCategories } from 'src/queries/public.js'
import {
  useAccountCreatePetMutation,
  useAccountUpdatePetMutation
} from 'src/mutations/account/pet.js'

const bus = inject<EventBus>('bus')!
bus.on('account-open-pets-create-dialog', () => {
  if (openCreateDialog)
    openCreateDialog({
      done: () => {}
    })
})

const lang = useLang()

// const { data: contactPeopleData, execute: executeContactPeople } = useQuery(
//   'user.getContactPeople',
//   {
//     // immediate: true
//   }
// )

// const { data: categories, execute: executeCategories } = useQuery(
//   'public.getCategories',
//   {
//     // immediate: true
//   }
// )

// const { data, execute } = useQuery('user.getPets', {
//   // immediate: true
// })

const { contactPeople: contactPeopleData, refetch: executeContactPeople } =
  useAccountGetContactPeopleQuery()
const { pets: data, refetch: execute } = useAccountGetPetsQuery()
const { categories, refetch: executeCategories } = usePublicGetCategories()

const { mutateAsync: createPetMutation } = useAccountCreatePetMutation()
const { mutateAsync: updatePetMutation } = useAccountUpdatePetMutation()

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

  try {
    await updatePetMutation(pet)

    done()
    await execute()
  } catch (e) {}
}

const createPet: InstanceType<typeof PetForm>['$props']['onSubmit'] = async ({
  pet,
  done
}) => {
  delete pet.customerId

  try {
    await createPetMutation(pet)

    done()
    await execute()
  } catch (e) {}
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

<template>
  <accounts-table
    v-if="accounts"
    :model-value="accounts"
    :mapped-roles="mappedRoles"
    :count="count"
    v-model:pagination="pagination"
    v-model:criteria="criteria"
    @add-role="onAddRole"
    @remove-role="onRemoveRole"
  />
</template>

<script lang="ts">
export default {
  name: 'AdminAccountsPage'
}
</script>

<script setup lang="ts">
import { AccountsTable } from '@simsustech/quasar-components/authentication'
import { createUseTrpc } from '../../trpc.js'
import { computed, reactive, ref } from 'vue'
import { useLang } from '../../lang/index.js'
import { PETBOARDING_ACCOUNT_ROLES } from '@petboarding/api/zod'
const { useQuery, useMutation } = await createUseTrpc()

const lang = useLang()

const pagination = ref({
  limit: 5,
  offset: 0,
  sortBy: null as 'id' | 'email' | 'name' | null,
  descending: false
})

const criteria = ref({
  name: '',
  email: '',
  roles: []
})

const { data: accounts, execute: executeAccounts } = useQuery(
  'admin.getAccounts',
  {
    args: reactive({ pagination, criteria }),
    immediate: true,
    reactive: true
  }
)

const { data: count } = useQuery('admin.getAccountsCount', {
  args: reactive({ criteria }),
  immediate: true,
  initialData: 0
})

const mappedRoles = computed(() =>
  Object.values(PETBOARDING_ACCOUNT_ROLES).reduce(
    (acc, cur) => {
      acc[cur] = lang.value.account.roles[cur]
      return acc
    },
    {} as Record<PETBOARDING_ACCOUNT_ROLES, string>
  )
)

const onAddRole = async ({ id, role }: { id: number; role: string }) => {
  const result = useMutation('admin.addRole', {
    args: { id, role: role as PETBOARDING_ACCOUNT_ROLES },
    immediate: true
  })

  await result.immediatePromise

  if (!result.error.value) executeAccounts()
}

const onRemoveRole = async ({ id, role }: { id: number; role: string }) => {
  const result = useMutation('admin.removeRole', {
    args: { id, role: role as PETBOARDING_ACCOUNT_ROLES },
    immediate: true
  })

  await result.immediatePromise

  if (!result.error.value) executeAccounts()
}
</script>

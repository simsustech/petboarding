import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { user } from '../../oauth.js'
import { computed } from 'vue'

export const useAdminSlimfactHealthCheckQuery = defineQuery(() => {
  // Same session source MainLayout.vue:519's watch reads: arm only for admins,
  // so sessions without `administrator` never issue the health check (401s).
  const isAdmin = computed(
    () => user.value?.roles?.includes('administrator') ?? false
  )
  const { data, ...rest } = useQuery({
    enabled: !import.meta.env.SSR && isAdmin,
    key: () => ['adminSlimfactHealthCheck'],
    query: () => trpc.admin.slimfactHealthcheck.query()
  })

  return {
    data,
    ...rest
  }
})

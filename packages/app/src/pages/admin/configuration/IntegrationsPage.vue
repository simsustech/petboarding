<template>
  <q-page padding>
    <q-list>
      <q-item>
        <q-item-section>
          <q-item-label> SlimFact </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon
            v-if="slimfactError?.message === 'BAD_REQUEST'"
            name="i-mdi-cancel"
            color="red"
          />
          <q-form
            v-else-if="
              slimfactError?.message === 'UNAUTHORIZED' ||
              slimfactData?.exp - new Date().getTime() / 1000 < 604800
            "
            id="slimFactForm"
            action="/federated/slimfact"
            method="post"
          >
            <login-button type="submit" class="col">
              <template #icon> </template>
            </login-button>
          </q-form>
          <!-- The status must not be icon-only (audit): name it. -->
          <div v-else class="row items-center">
            <q-icon name="i-mdi-check" color="positive" />
            <q-item-label caption class="q-ml-xs">
              {{ lang.integrations.connected }}
            </q-item-label>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { LoginButton } from '@simsustech/quasar-components/authentication'
import { onMounted } from 'vue'
import { useAdminSlimfactHealthCheckQuery } from 'src/queries/admin/slimfact.js'
import { useLang } from 'src/lang/index.js'
const lang = useLang()

const {
  data: slimfactData,
  error: slimfactError,
  refetch: refetchSlimfactHealthCheck
} = useAdminSlimfactHealthCheckQuery()

onMounted(async () => {
  await refetchSlimfactHealthCheck()
})
</script>

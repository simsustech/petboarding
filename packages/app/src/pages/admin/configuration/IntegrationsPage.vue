<template>
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
          v-else-if="slimfactError?.message === 'UNAUTHORIZED'"
          id="slimFactForm"
          action="/federated/slimfact"
          method="post"
        >
          <login-button
            type="submit"
            class="col"
            text-color="primary"
            color="white"
          >
            <template #icon> </template>
          </login-button>
        </q-form>
        <q-icon v-else name="i-mdi-check" color="green" />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { LoginButton } from '@simsustech/quasar-components/authentication'

import { createUseTrpc } from '../../../trpc.js'
const { useQuery } = await createUseTrpc()

const { error: slimfactError } = useQuery('admin.slimfactHealthcheck', {
  immediate: true,
  initialData: false
})
</script>

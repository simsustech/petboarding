<template>
  <q-tabs>
    <q-route-tab icon="i-mdi-home" to="/" label="Home" />
    <q-route-tab
      v-if="user"
      icon="i-mdi-person"
      to="/account"
      :label="lang.account.title"
    />
    <q-route-tab
      v-if="user?.roles.includes('employee')"
      icon="i-mdi-account-star"
      to="/employee"
      :label="lang.employee"
    />
    <q-route-tab
      v-if="user?.roles.includes('administrator')"
      icon="i-mdi-account-cog"
      to="/admin"
      :label="lang.administrator"
    />
  </q-tabs>
</template>

<script setup lang="ts">
import { useUser } from '../oauth.js'
import { useLang } from '../lang/index.js'

const user = await useUser()
const lang = useLang()
</script>

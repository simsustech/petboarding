<template>
  <q-list separator>
    <q-item v-if="!user" clickable @click="login">
      <q-item-section avatar><q-icon name="i-mdi-login" /></q-item-section>
      <q-item-section> Login </q-item-section>
    </q-item>
    <q-item to="/availability">
      <q-item-section avatar>
        <q-icon name="i-mdi-info" />
      </q-item-section>
      <q-item-section>
        <q-item-label> {{ lang.availability.title }} </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { useLang } from '../../lang/index.js'
import { oAuthClient, user } from '../../oauth.js'
const lang = useLang()

const login = () => {
  if (oAuthClient.value) oAuthClient.value.signIn({})
}
</script>

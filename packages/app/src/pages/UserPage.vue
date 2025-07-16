<template>
  <q-page padding>
    <div class="grid grid-cols-12 gap-3">
      <q-card class="col-span-12 md:col-span-4">
        <dashboard-user-menu-list />
      </q-card>

      <q-card v-if="user" class="col-span-12 md:col-span-4">
        <q-item>
          <q-item-section avatar>
            <q-icon name="i-mdi-person"></q-icon>
          </q-item-section>

          <q-item-section>
            <q-item-label
              >{{ user.email }}
              <!-- <q-icon
                name="i-mdi-check"
                :color="user.verified ? 'green' : 'grey'"
              >
                <q-tooltip>
                  {{ user.verified ? 'Email verified' : 'Email not verified' }}
                </q-tooltip>
              </q-icon> -->
            </q-item-label>
          </q-item-section>

          <q-item-section side top> </q-item-section>
        </q-item>
        <q-item clickable :href="emailChangeUri">
          <q-item-section>
            <q-item-label>
              {{ lang.account.messages.changeEmailAddress }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <!-- <q-item clickable @click="emailVerifyRoute"> Verify email address</q-item> -->
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { user } from '../oauth.js'
import { useLang } from '../lang/index.js'
import DashboardUserMenuList from '../components/dashboard/DashboardAccountMenuList.vue'

const lang = useLang()
const emailChangeUri =
  import.meta.env.VITE_OIDC_EMAIL_CHANGE_URI || `./interaction/email/change`
</script>

<template>
  <q-page padding>
    <q-list>
      <q-expansion-item :content-inset-level="1">
        <template #header>
          <q-item-section>
            <q-item-label>
              {{ lang.termsAndConditions }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn icon="i-mdi-more-vert" flat>
              <q-menu>
                <q-list>
                  <q-item
                    v-close-popup
                    clickable
                    data-testid="edit-button"
                    @click.stop="openTermsAndConditionsDialog"
                  >
                    <q-item-section>
                      <q-item-label>
                        {{ lang.update }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
        </template>
        <q-markdown :src="termsAndConditions" />
      </q-expansion-item>

      <q-expansion-item :content-inset-level="1">
        <template #header>
          <q-item-section>
            <q-item-label>
              {{ lang.privacyPolicy }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn icon="i-mdi-more-vert" flat>
              <q-menu>
                <q-list>
                  <q-item
                    v-close-popup
                    clickable
                    data-testid="edit-button"
                    @click.stop="openPrivacyPolicyDialog"
                  >
                    <q-item-section>
                      <q-item-label>
                        {{ lang.update }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
        </template>
        <q-markdown :src="privacyPolicy" />
      </q-expansion-item>
    </q-list>
  </q-page>

  <responsive-dialog
    ref="termsAndConditionsDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="updateTermsAndConditions"
  >
    <q-input v-model="termsAndConditionsCopy" type="textarea" />
  </responsive-dialog>

  <responsive-dialog
    ref="privacyPolicyDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="updatePrivacyPolicy"
  >
    <q-input v-model="privacyPolicyCopy" type="textarea" />
  </responsive-dialog>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { QMarkdown } from '@quasar/quasar-ui-qmarkdown'
import '@quasar/quasar-ui-qmarkdown/dist/index.css'
import { useLang } from '../../../lang/index.js'
import { ref } from 'vue'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import {
  usePublicGetPrivacyPolicyQuery,
  usePublicGetTermsAndConditionsQuery
} from 'src/queries/public.js'
import {
  useAdminUpdatePrivacyPolicyMutation,
  useAdminUpdateTermsAndConditionsMutation
} from 'src/mutations/admin/document.js'

const { termsAndConditions, refetch: executeTermsAndConditions } =
  usePublicGetTermsAndConditionsQuery()
const { privacyPolicy, refetch: executePrivacyPolicy } =
  usePublicGetPrivacyPolicyQuery()
const { mutateAsync: updateTermsAndConditionsMutation } =
  useAdminUpdateTermsAndConditionsMutation()
const { mutateAsync: updatePrivacyPolicyMutation } =
  useAdminUpdatePrivacyPolicyMutation()
const lang = useLang()

const termsAndConditionsCopy = ref<string>()
const termsAndConditionsDialogRef = ref<typeof ResponsiveDialog>()

const openTermsAndConditionsDialog = () => {
  termsAndConditionsDialogRef.value?.functions.open()
}

const updateTermsAndConditions = async ({ done }) => {
  try {
    await updateTermsAndConditionsMutation({
      content: termsAndConditionsCopy.value
    })
    done()
    await executeTermsAndConditions()
  } catch (e) {
    console.error(e)
  }
}

const privacyPolicyCopy = ref<string>()
const privacyPolicyDialogRef = ref<typeof ResponsiveDialog>()

const openPrivacyPolicyDialog = () => {
  privacyPolicyDialogRef.value?.functions.open()
}

const updatePrivacyPolicy = async ({ done }) => {
  try {
    await updatePrivacyPolicyMutation({
      content: privacyPolicyCopy.value
    })
    done(true)
    await executePrivacyPolicy()
  } catch (e) {
    console.error(e)
    done(false)
  }
}

onMounted(async () => {
  await executeTermsAndConditions()
  await executePrivacyPolicy()
  termsAndConditionsCopy.value = termsAndConditions.value
  privacyPolicyCopy.value = privacyPolicy.value
})
</script>

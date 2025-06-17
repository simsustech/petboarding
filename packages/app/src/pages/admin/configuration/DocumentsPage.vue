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
import { createUseTrpc } from '../../../trpc.js'
import { useLang } from '../../../lang/index.js'
import { ref } from 'vue'
import { ResponsiveDialog } from '@simsustech/quasar-components'

const { useQuery, useMutation } = await createUseTrpc()
const lang = useLang()

const { data: termsAndConditions, execute: executeTermsAndConditions } =
  useQuery('public.getTermsAndConditions')
const termsAndConditionsCopy = ref<string>()
const termsAndConditionsDialogRef = ref<typeof ResponsiveDialog>()

const openTermsAndConditionsDialog = () => {
  termsAndConditionsDialogRef.value?.functions.open()
}

const updateTermsAndConditions = async ({ done }) => {
  const { immediatePromise } = useMutation('admin.updateTermsAndConditions', {
    args: {
      content: termsAndConditionsCopy.value
    },
    immediate: true
  })
  done()
  await immediatePromise
  await executeTermsAndConditions()
}

const { data: privacyPolicy, execute: executePrivacyPolicy } = useQuery(
  'public.getPrivacyPolicy'
)
const privacyPolicyCopy = ref<string>()
const privacyPolicyDialogRef = ref<typeof ResponsiveDialog>()

const openPrivacyPolicyDialog = () => {
  privacyPolicyDialogRef.value?.functions.open()
}

const updatePrivacyPolicy = async ({ done }) => {
  const { immediatePromise } = useMutation('admin.updatePrivacyPolicy', {
    args: {
      content: privacyPolicyCopy.value
    },
    immediate: true
  })
  done()
  await immediatePromise
  await executePrivacyPolicy()
}

onMounted(async () => {
  await executeTermsAndConditions()
  await executePrivacyPolicy()
  termsAndConditionsCopy.value = termsAndConditions.value
  privacyPolicyCopy.value = privacyPolicy.value
})
</script>

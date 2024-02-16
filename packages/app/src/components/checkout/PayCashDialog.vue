<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        {{ lang.checkout.messages.amountPaid }}
        <q-input
          :model-value="amount"
          type="number"
          step="0.01"
          @update:model-value="updateAmount"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          color="primary"
          flat
          :label="$q.lang.label.cancel"
          @click="onDialogCancel"
        />
        <q-btn
          color="primary"
          flat
          :label="$q.lang.label.ok"
          @click="onClickOk"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { ref } from 'vue'
import { useLang } from '../../lang/index.js'

const lang = useLang()
const amount = ref(0)
defineEmits([
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent()
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome

// this is part of our example (so not required)
function onClickOk() {
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK(amount.value)
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}

const updateAmount = (value: number | string | null) => {
  if (value) {
    if (typeof value === 'string') value = Number(value)
    amount.value = Math.round(value * 100) / 100
  }
}
</script>

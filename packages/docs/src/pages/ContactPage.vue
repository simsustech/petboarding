<template>
  <q-page padding>
    <div v-if="$q.lang.isoName === 'nl'">
      <a>Heeft u vragen of suggesties? Neem gerust contact op.</a><br />
      <a
        >Bent u een software ontwikkelaar? Bekijk dan ook eens de
        <a href="https://github.com/simsustech/petboarding">Github pagina</a>.
      </a>
    </div>
    <div v-if="$q.lang.isoName === 'en-US'">
      <a>Heeft u vragen of suggesties? Neem gerust contact op.</a><br />
      <a
        >Bent u een software ontwikkelaar? Bekijk dan ook eens de
        <a href="https://github.com/simsustech/petboarding">Github pagina</a>.
      </a>
    </div>
    <q-list>
      <q-item>
        <q-item-section avatar>
          <q-icon name="email" />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            <q-no-ssr>
              {{ email }}
            </q-no-ssr>
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<scirpt lang="ts">
export default {
  name: 'IndexPage'
}
</scirpt>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const lang = ref($q.lang.isoName)
watch($q.lang, (newVal) => {
  lang.value = newVal.isoName
})

const email = 'info@petboarding.app'
</script>

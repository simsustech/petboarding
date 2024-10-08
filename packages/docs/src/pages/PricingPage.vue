<template>
  <q-page padding>
    <div class="row q-mt-lg justify-evenly q-col-gutter-x-md">
      <comparison-card
        v-for="(option, index) in options[lang]"
        class="col-12 col-md-4"
        :title="option.title"
        :price="option.price"
        :key="index"
        :pros="option.pros"
        :cons="option.cons"
      ></comparison-card>
    </div>

    <div
      class="row full-width justify-center bg-primary q-pb-lg q-pt-lg q-mt-lg"
    >
      <div v-if="lang === 'nl'">
        <div class="col-4">
          <div class="row justify-center">
            <a class="text-h5">Geïnteresserd?</a>
          </div>
          <div class="row justify-center">
            <q-btn
              href="mailto:info@petboarding.app"
              label="Neem contact op"
              color="accent"
            />
          </div>
        </div>
      </div>
      <div v-if="lang === 'en-US'">
        <div class="col-4">
          <div class="row justify-center">
            <a class="text-h5">Interested?</a>
          </div>
          <div class="row justify-center">
            <q-no-ssr>
              <q-btn
                href="mailto:info@petboarding.app"
                label="Contact us"
                color="accent"
              />
            </q-no-ssr>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<scirpt lang="ts">
export default {
  name: 'IndexPage'
}
</scirpt>

<script setup lang="ts">
import { ref, watch } from 'vue'
import ComparisonCard from '../components/ComparisonCard.vue'
import FeatureCard from '../components/FeatureCard.vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const lang = ref($q.lang.isoName)
watch($q.lang, (newVal) => {
  lang.value = newVal.isoName
})
const options = ref({
  nl: [
    {
      title: 'Standaard',
      price: '€40 per maand',
      pros: [
        {
          message: 'Online klantomgeving.'
        },
        {
          message: 'Vaccinatie registratie.'
        },
        {
          message: 'Automatisch gegenereerde voer- ren reserveringslabels.'
        },
        {
          message: 'Dag-, week- en maandoverzichten van pension en dagopvang.'
        },
        {
          message:
            'Persoonlijk aangepaste strategie voor het berekenen van pension- en annuleringskosten.'
        },
        {
          message:
            'Persoonlijk aangepaste email templates voor het behandelen van reserveringen.'
        },
        {
          message: 'Notificatie bij dubbele reserveringen.'
        },
        {
          message: 'Notificatie bij verlopen reserveringen.'
        },
        {
          message: 'Persoonlijke ondersteuning.'
        }
      ],
      cons: []
    },
    {
      title: 'Zelf hosten',
      price: '€0',
      pros: [
        {
          message: 'Alle betaalde features.'
        }
      ],
      cons: [
        {
          message: 'Geen persoonlijke ondersteuning.'
        }
      ]
    }
  ],
  'en-US': [
    {
      title: 'Standard',
      price: '€40 per month',
      pros: [
        {
          message: 'Online customer portal.'
        },
        {
          message: 'Vaccination registration.'
        },
        {
          message: 'Automatically generated pet- and booking labels.'
        },
        {
          message: 'Day-, week and month overviews of boarding and daycare.'
        },
        {
          message:
            'Custom strategies for calculating the booking- and cancelation costs.'
        },
        {
          message: 'Custom email templates for handling bookings.'
        },
        {
          message: 'Notification on double bookings'
        },
        {
          message: 'Notification on expired vaccinations.'
        },
        {
          message: 'Personal support.'
        }
      ],
      cons: []
    },
    {
      title: 'Self hosted',
      price: '€0',
      pros: [
        {
          message: 'All paid features.'
        }
      ],
      cons: [
        {
          message: 'No personal support.'
        }
      ]
    }
  ]
})
</script>

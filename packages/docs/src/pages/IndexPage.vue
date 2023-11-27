<template>
  <q-page>
    <!-- <div class="row">
      <div class="col text-center">
        <a class="text-h4">Petboarding</a><br />
        <q-img
          loading="eager"
          style="max-width: 100px"
          :img-style="{ overflow: 'visible', width: '100%' }"
          :src="logoUrl"
          placeholder-src="~assets/logo.svg"
        />
      </div>
    </div> -->
    <div class="row justify-center q-ma-md">
      <div v-if="lang === 'nl'">
        <a class="text-h5"> Software voor uw dierenpension </a>
        <br />
        <p>
          Laat uw klanten online reserveren en bespaar tijd met uw
          administratie.
        </p>
      </div>
      <div v-if="lang === 'en-US'">
        <a class="text-h5"> Software for your pet boarding business. </a>
        <br />
        <p>
          Let your customers place their bookings online and save time on your
          administration.
        </p>
      </div>
    </div>

    <div class="row justify-center q-col-gutter-x-md q-ma-md">
      <feature-card
        v-for="(feature, index) in features[lang]"
        class="col-4"
        :key="index"
        :title="feature.title"
        :content="feature.content"
        :img-src="feature.imgSrc"
      />
    </div>

    <div
      class="row full-width justify-center bg-primary q-pb-lg q-pt-lg q-mt-lg q-ma-md"
    >
      <div v-if="lang === 'nl'" class="q-pa-none q-ma-none">
        <div class="col-4">
          <div class="row justify-center">
            <a class="text-h5">Probeer de demo</a>
          </div>
          <div class="row justify-center">
            <q-btn
              href="https://demo.petboarding.app"
              label="Open demo"
              color="accent"
            />
          </div>
        </div>
      </div>
      <div v-if="lang === 'en-US'" class="q-pa-none q-ma-none">
        <div class="col-4">
          <div class="row justify-center">
            <a class="text-h5">Try the demo</a>
          </div>
          <div class="row justify-center">
            <q-btn
              href="https://demo.petboarding.app"
              label="Open demo"
              color="accent"
            />
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

const features = ref({
  nl: [
    {
      title: 'Online reserveren',
      content:
        'Laat uw klanten online reserveren en stuur automatisch gegenereerde antwoorden.',
      imgSrc: '/features/nl/bookings.png'
    },
    {
      title: 'Agenda',
      content: 'Dag- en weekoverzichten van de bezetting.',
      imgSrc: '/features/nl/agenda.png'
    },
    {
      title: 'Dag overzicht',
      content: 'Handig overzicht van de aankomsten en vertrekken van de dag.',
      imgSrc: '/features/nl/overview.png'
    }
  ],
  'en-US': [
    {
      title: 'Online bookings',
      content:
        'Let your customers place their bookings online and send automatically generated replies.',
      imgSrc: '/features/en-US/bookings.png'
    },
    {
      title: 'Agenda',
      content: 'Day- and week overviews of the occupancy.',
      imgSrc: '/features/en-US/agenda.png'
    },
    {
      title: 'Overview',
      content: 'Useful overview of the arrivals and departures of the day.',
      imgSrc: '/features/en-US/overview.png'
    }
  ]
})
</script>

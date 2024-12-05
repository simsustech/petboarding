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
    <div class="row q-mt-xl justify-center q-ma-md">
      <div v-if="lang === 'nl'">
        <a class="text-h5">
          Vergemakkelijk de administratie van uw dierenpension.
        </a>
        <br />
        <p>Laat uw klanten online reserveren en bespaar tijd en geld.</p>
      </div>
      <div v-if="lang === 'en-US'">
        <a class="text-h5">
          Ease the administration of your pet boarding business.
        </a>
        <br />
        <p>
          Let your customers place their bookings online and save time and
          money.
        </p>
      </div>
    </div>

    <div class="row full-width justify-center q-pb-lg q-ma-md">
      <q-carousel
        v-model="slide"
        class="full-width"
        animated
        arrows
        infinite
        control-color="primary"
        style="height: 100%"
      >
        <q-carousel-slide
          v-for="(slide, index) in slides[lang]"
          :key="index"
          :name="index"
        >
          <q-img :src="slide.imgSrc" style="height: 400px" fit="contain" />
          <div class="text-subtitle1 text-center">
            {{ slide.title }}
          </div>
        </q-carousel-slide>
      </q-carousel>
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
    <div class="row justify-center q-gutter-sm q-ma-md">
      <feature-card
        v-for="(feature, index) in features[lang]"
        class="col-12 col-md-4"
        :key="index"
        :title="feature.title"
        :content="feature.content"
        :img-src="feature.imgSrc"
      />
    </div>

    <div class="row full-width justify-center q-pb-lg q-ma-md">
      <q-carousel
        v-model="responsiveSlide"
        class="full-width"
        animated
        arrows
        infinite
        control-color="primary"
        style="min-height: 470px"
      >
        <q-carousel-slide
          v-for="(slide, index) in responsiveSlides[lang]"
          :key="index"
          :name="index"
        >
          <q-img :src="slide.imgSrc" style="height: 350px" fit="contain" />
          <div class="q-mt-md text-subtitle1 text-center">
            {{ slide.title }}
          </div>
        </q-carousel-slide>
      </q-carousel>
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
import FeatureCard from '../components/FeatureCard.vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const lang = ref($q.lang.isoName)
watch($q.lang, (newVal) => {
  lang.value = newVal.isoName
})

const slide = ref(0)
const slides = ref({
  nl: [
    {
      title: 'Klanten plaatsen hun reserveringen online.',
      imgSrc: '/landing/nl/bookingpending.png'
    },
    {
      title: 'Beheerders behandelen de nieuwe reserveringen.',
      imgSrc: '/landing/nl/approvebooking.png'
    },
    {
      title:
        'Klanten krijgen een bevestiging per email en zien de status online.',
      imgSrc: '/landing/nl/bookingapproved.png'
    },
    {
      title:
        'Medewerkers zien de reserveringen terug in het dag- en weekoverzicht.',
      imgSrc: '/landing/nl/dayoverview.png'
    }
  ],
  'en-US': [
    {
      title: 'Customers place their bookings online.',
      imgSrc: '/landing/en-US/bookingpending.png'
    },
    {
      title: 'Administrators handle the new bookings.',
      imgSrc: '/landing/en-US/approvebooking.png'
    },
    {
      title:
        'Customers receive a confirmation email and can see the status online.',
      imgSrc: '/landing/en-US/bookingapproved.png'
    },
    {
      title: 'Employees will see the bookings in the day- and week overviews.',
      imgSrc: '/landing/en-US/dayoverview.png'
    }
  ]
})

const responsiveSlide = ref(0)
const responsiveSlides = ref({
  nl: [
    {
      title: 'Petboarding werkt op de browser van uw PC.',
      imgSrc: '/landing/nl/browser.png'
    },
    {
      title: 'En natuurlijk ook up uw tablet.',
      imgSrc: '/landing/nl/tablet.png'
    }
  ],
  'en-US': [
    {
      title: 'Petboarding works on the browser of your PC.',
      imgSrc: '/landing/en-US/browser.png'
    },
    {
      title: 'And of course also on your tablet.',
      imgSrc: '/landing/en-US/tablet.png'
    }
  ]
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
    },
    {
      title: 'Kennel indeling',
      content: 'Beheer uw kennel indeling online.',
      imgSrc: '/features/nl/kennellayout.png'
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
    },
    {
      title: 'Kennel layout',
      content: 'Manage your kennel layout online.',
      imgSrc: '/features/en-US/kennellayout.png'
    }
  ]
})
</script>

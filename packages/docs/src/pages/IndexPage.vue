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
    <div class="column justify-center" style="min-height: inherit">
      <div class="col bg-primary"></div>
      <div class="col bg-primary">
        <div class="row items-center">
          <div class="col-12 col-md-5 justify-center q-pa-md">
            <div class="row justify-center">
              <div v-if="lang === 'nl'" style="max-width: 350px">
                <a class="text-h4">
                  Vergemakkelijk de administratie van uw dierenpension.
                </a>
                <br />
                <a class="text-h6">
                  In Petboarding regelt u uw administratie online en zo bespaart
                  u tijd voor u en uw klanten.
                </a>
                <br />
                <q-btn
                  class="q-mt-md"
                  color="accent"
                  href="https://www.petboarding.app"
                >
                  Open de demo
                </q-btn>
                <br />
                <router-link class="q-ml-md text-caption" to="/pricing"
                  >Of bekijk de opties.</router-link
                >
              </div>
              <div v-if="lang === 'en-US'" style="max-width: 350px">
                <a class="text-h4">
                  Ease the administration of your pet boarding business.
                </a>
                <br />
                <a class="text-h6">
                  In Petboarding you do the paperwork online and this way you
                  save time for you and your customers.
                </a>
                <br />
                <q-btn
                  class="q-mt-md"
                  color="accent"
                  href="https://www.petboarding.app"
                >
                  Open th demo
                </q-btn>
                <br />
                <router-link class="text-caption" to="/pricing"
                  >Or look at the options.</router-link
                >
              </div>
            </div>
          </div>
          <div class="col-12 col-md-7">
            <q-carousel
              v-model="slide"
              class="bg-primary"
              animated
              arrows
              infinite
              control-color="secondary"
              style="height: 100%"
            >
              <q-carousel-slide
                v-for="(slide, index) in slides[lang]"
                :key="index"
                :name="index"
              >
                <q-img
                  :src="slide.imgSrc"
                  style="height: 400px"
                  fit="contain"
                />
                <div class="text-subtitle1 text-center">
                  {{ slide.title }}
                </div>
              </q-carousel-slide>
            </q-carousel>
          </div>
        </div>
        <div class="col bg-primary"></div>
      </div>
    </div>
    <!-- 
    <div class="row q-mt-xl justify-center q-ma-md">
      <div v-if="lang === 'nl'">
        <a class="text-h5">
          Vergemakkelijk de administratie van uw dierenpension.
        </a>
        <br />
        <p>
          In Petboarding regelt u uw administratie online en zo bespaart u tijd
          voor u en uw klanten.
        </p>
      </div>
      <div v-if="lang === 'en-US'">
        <a class="text-h5">
          Ease the administration of your pet boarding business.
        </a>
        <br />
        <p>
          In Petboarding you do the paperwork online and this way you save time
          for you and your customers.
        </p>
      </div>
    </div> -->

    <!-- <div class="row full-width justify-center q-pb-lg q-ma-md">
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
    </div> -->
    <!-- <div
      class="row full-width justify-center bg-primary q-pb-lg q-pt-lg q-mt-lg q-ma-md"
    >
      <div v-if="lang === 'nl'" class="q-pa-none q-ma-none">
        <div class="col-4">
          <div class="row justify-center">
            <a class="text-h5">Open de demo</a>
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
            <a class="text-h5">Open the demo</a>
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
    </div> -->
    <div class="row justify-center q-gutter-sm q-ma-md">
      <div class="col text-center q-pl-lg q-pr-lg" style="max-width: 1000px">
        <div v-if="lang === 'nl'">
          <a class="text-h3"> Regel uw administratie waar dan ook.</a>
          <br />
          <a>
            Uw beveiligde omgeving is op alle plaatsen met een internet
            verbinding te bereiken. Petboarding neemt zoveel mogelijk werk uit
            uw handen, maar het noodzakelijke regelt u eenvoudig op ieder
            apparaat.
          </a>
        </div>
        <div v-if="lang === 'en-US'">
          <a class="text-h3"> Do your paperwork anywhere.</a>
          <br />
          <a>
            Your secure environment is accessible on all places with an internet
            connection. Petboarding will take most of the work out of your
            hands, but the necessities can easily be performed on any device.
          </a>
        </div>
      </div>
    </div>

    <div class="row justify-center q-gutter-sm q-ma-md q-ml-lg q-mr-lg">
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
      content:
        'Handig overzicht van de dieren die arriveren of vertrekken op die dag.',
      imgSrc: '/features/nl/overview.png'
    },
    {
      title: 'Kennel indeling',
      content: 'Beheer uw kennel indeling online.',
      imgSrc: '/features/nl/kennellayout.png'
    },
    {
      title: 'SlimFact integratie.',
      content: 'Integratie met SlimFact voor online betalingen.',
      imgSrc: './features/nl/slimfact.png'
    },
    {
      title: 'Dagopvang abonnementen',
      content:
        'Als u dagopvang abonnementen activeert moeten klanten eerst een abonnement voor X dagen aanschaffen voordat zij nieuwe dagopvang datums aan kunnen vragen.',
      imgSrc: './features/nl/daycaresubscriptions.png'
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
      content: 'Useful overview of the pets which arrive or depart that day.',
      imgSrc: '/features/en-US/overview.png'
    },
    {
      title: 'Kennel layout',
      content: 'Manage your kennel layout online.',
      imgSrc: '/features/en-US/kennellayout.png'
    },
    {
      title: 'SlimFact integration',
      content: 'Integration with SlimFact for online payments.',
      imgSrc: './features/en-US/slimfact.png'
    },
    {
      title: 'Daycare subscriptions',
      content:
        'If enabled, customers need to purchase a daycare subscription for X days before they can request new daycare dates.',
      imgSrc: './features/en-US/daycaresubscriptions.png'
    }
  ]
})
</script>

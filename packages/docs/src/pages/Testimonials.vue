<template>
  <q-page padding>
    <div class="row q-ml-md text-h6">{{ lang.testimonial.labels.clients }}</div>

    <div class="row">
      <testimonial-card
        v-for="testimonial in clients"
        :id="testimonial.id"
        :key="testimonial.id"
        :image="testimonial.image"
        :name="testimonial.name"
        :company="testimonial.company"
        :url="testimonial.url"
        :content="testimonial[$q.lang.isoName]"
        class="col"
      />
    </div>

    <div class="row q-mt-md q-ml-md text-h6">
      {{ lang.testimonial.labels.endUsers }}
    </div>

    <div class="row">
      <testimonial-card
        v-for="testimonial in endUsers"
        :id="testimonial.id"
        :key="testimonial.id"
        :name="testimonial.name"
        :content="testimonial[$q.lang.isoName]"
        class="col"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { clients, endUsers } from '../assets/testimonials/index.js'
import TestimonialCard from '../components/TestimonialCard.vue'
import { useLang } from '../lang/index.js'

const $q = useQuasar()
const lang = useLang()
</script>

<template>
  <q-page padding>
    <testimonial-card
      v-for="testimonial in testimonials"
      :id="testimonial.id"
      :key="testimonial.id"
      :owner="testimonial.owner"
      :company="testimonial.company"
      :url="testimonial.url"
      :content="testimonial[$q.lang.isoName]"
    />
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import testimonials from '../assets/testimonials/index.js'
import TestimonialCard from '../components/TestimonialCard.vue'

const $q = useQuasar()
</script>

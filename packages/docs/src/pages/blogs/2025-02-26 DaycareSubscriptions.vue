<template>
  <blog-post v-bind="{ url }">
    <template #title> Daycare subscriptions </template>
    <template #date>{{ formatDate('2025-02-26') }}</template>
    <p>
      Petboarding works with prepaid daycare subscriptions. The reasoning behind
      it is as follows.
    </p>
    <ul>
      <li>
        <p class="">
          Keeping up with postpaid subscriptions is a big hassle and might
          disrupt the relationship with the customers. For example, do you still
          allow them to use your services when their last subscription has not
          been paid yet? By making the subscriptions prepaid, it is clear to
          both parties that only paid subscriptions are eligible for use.
        </p>
      </li>
      <li>
        <p class="">
          The fairest method for both parties is that all booked days are
          billed. It is up to the owner how to handle cancellations, but
          customers will never be billed for days they have not booked. This in
          contrast to periodic (e.g monthly) subscriptions, where the customer
          might not use the services but will still be billed.
        </p>
      </li>
      <li>
        <p class="">
          To prevent customers from holding on to subscriptions long after its
          price has increased, an expiration date can be set on each
          subscription.
        </p>
      </li>
      <li>
        <p>
          If the owner insists on montly subscriptions, they can set the
          expiration date to the end of the month. You can limit the number of
          days that can be used that month, or set it to 31 to allow 'unlimited'
          access. Although not recommended, Petboarding is flexible enough to
          make this possible.
        </p>
      </li>
    </ul>
  </blog-post>
</template>

<script setup lang="ts">
import BlogPost, { Props } from '../../components/BlogPost.vue'
import { formatDate } from '../../tools.js'
defineProps<Props>()
</script>

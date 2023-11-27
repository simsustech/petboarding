import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: 'home',
        component: () => import('src/pages/IndexPage.vue'),
        alias: ''
      },
      {
        path: 'pricing',
        component: () => import('src/pages/PricingPage.vue')
      },
      {
        path: 'contact',
        component: () => import('src/pages/ContactPage.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/Error404Page.vue')
  }
]

export default routes

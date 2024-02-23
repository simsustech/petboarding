import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      {
        path: 'home',
        component: () => import('../pages/IndexPage.vue'),
        alias: ''
      },
      {
        path: 'pricing',
        component: () => import('../pages/PricingPage.vue')
      },
      {
        path: 'contact',
        component: () => import('../pages/ContactPage.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/Error404Page.vue')
  }
]

export default routes

import { RouteRecordRaw } from 'vue-router'

const blogPages = import.meta.glob('../pages/blogs/*.vue')

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
        path: 'testimonials',
        component: () => import('../pages/Testimonials.vue')
      },
      {
        path: 'contact',
        component: () => import('../pages/ContactPage.vue')
      },
      {
        path: 'documentation',
        component: () => import('../pages/DocumentationPage.vue'),
        children: [
          {
            path: 'users',
            component: () => import('../pages/documentation/Users.vue')
          }
        ]
      },
      {
        path: 'blog',
        component: () => import('../pages/BlogPage.vue')
      },
      {
        path: 'blogs',
        component: () => import('../pages/BlogWrapper.vue'),
        children: Object.entries(blogPages).map(([key, value]) => {
          const path = key
            .split('/')
            .at(-1)
            ?.replace('.vue', '')
            .replaceAll(' ', '-')
          console.log(path)
          return {
            path: path!,
            component: value
          }
        })
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/404',
    alias: '/:catchAll(.*)*',
    component: () => import('../pages/Error404Page.vue')
  }
]

export default routes

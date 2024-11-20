import { RouteRecordRaw } from 'vue-router'
import { userRouteKey, redirectRouteKey } from '../oauth.js'
import { today } from '@quasar/quasar-ui-qcalendar'
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('../pages/IndexPage.vue') },
      {
        path: 'availability',
        alias: ['beschikbaarheid'],
        component: () => import('../pages/AvailabilityPage.vue')
      },
      {
        path: 'information',
        alias: ['informatie'],
        component: () => import('../pages/InformationPage.vue')
      },
      {
        path: 'redirect',
        name: redirectRouteKey,
        children: [
          {
            path: '',
            component: () => import('../pages/RedirectPage.vue')
          },
          {
            path: 'slimfact',
            component: () => import('../pages/redirect/AuthenticatedPage.vue')
          }
        ]
      },
      {
        path: 'user',
        name: userRouteKey,
        component: () => import('../pages/UserPage.vue')
      },
      {
        path: 'admin',
        component: () => import('../pages/AdminPage.vue'),
        children: [
          {
            path: 'overview',
            component: () => import('../pages/admin/OverviewPage.vue')
          },
          {
            path: 'accounts',
            component: () => import('../pages/admin/AccountsPage.vue')
          },
          {
            path: 'bookings',
            component: () => import('../pages/admin/BookingsPage.vue')
          },
          {
            path: 'daycare',
            component: () => import('../pages/admin/DaycarePage.vue')
          },
          {
            path: 'occupancy/:date?',
            component: () => import('../pages/admin/OccupancyPage.vue'),
            beforeEnter: (route) => {
              if (!route.params.date) {
                return {
                  path: route.path + '/' + today()
                }
              }
            }
          },
          {
            path: 'announcements',
            component: () => import('../pages/admin/AnnouncementsPage.vue')
          },
          {
            path: 'periods',
            component: () => import('../pages/admin/PeriodsPage.vue')
          },
          {
            path: 'configuration',
            component: () => import('../pages/admin/ConfigurationPage.vue'),
            children: [
              {
                path: 'categories',
                component: () =>
                  import('../pages/admin/configuration/CategoriesPage.vue')
              },
              {
                path: 'services',
                component: () =>
                  import('../pages/admin/configuration/ServicesPage.vue')
              },
              {
                path: 'email',
                component: () =>
                  import(
                    '../pages/admin/configuration/BookingEmailRepliesPage.vue'
                  )
              },
              {
                path: 'openingtimes',
                component: () =>
                  import('../pages/admin/configuration/OpeningTimesPage.vue')
              },
              {
                path: 'integrations',
                component: () =>
                  import('../pages/admin/configuration/IntegrationsPage.vue')
              },
              {
                path: 'daycaresubscriptions',
                component: () =>
                  import(
                    '../pages/admin/configuration/DaycareSubscriptionsPage.vue'
                  )
              },
              {
                path: 'buildings',
                component: () =>
                  import('../pages/admin/configuration/BuildingsPage.vue')
              },
              {
                path: 'kennels',
                component: () =>
                  import('../pages/admin/configuration/KennelsPage.vue')
              }
            ]
          }
        ]
      },
      {
        path: 'employee',
        component: () => import('../pages/EmployeePage.vue'),
        children: [
          {
            path: 'overview/:date?',
            component: () => import('../pages/employee/OverviewPage.vue'),
            beforeEnter: (route) => {
              if (!route.params.date) {
                return {
                  path: route.path + '/' + today()
                }
              }
            }
          },
          {
            path: 'agenda/:date?',
            component: () => import('../pages/employee/AgendaPage.vue'),
            beforeEnter: (route) => {
              if (!route.params.date) {
                return {
                  path: route.path + '/' + today()
                }
              }
            }
          },
          {
            path: 'customers/:id?',
            component: () => import('../pages/employee/CustomersPage.vue')
          },
          {
            path: 'pets/:ids*',
            component: () => import('../pages/employee/PetsPage.vue')
          },
          {
            path: 'bookings/:ids*',
            component: () => import('../pages/employee/BookingsPage.vue')
          },
          {
            path: 'labels',
            component: () => import('../pages/employee/LabelsPage.vue'),
            children: [
              {
                path: 'pets/:ids*',
                component: () =>
                  import('../pages/employee/labels/PetLabelsPage.vue')
              },
              {
                path: 'bookings/:ids*',
                component: () =>
                  import('../pages/employee/labels/BookingLabelsPage.vue')
              }
            ]
          },
          {
            path: 'kennellayout/:date?',
            name: 'employeekennellayout',
            component: () => import('../pages/employee/KennelLayout.vue'),
            beforeEnter: (route) => {
              if (!route.params.date) {
                return {
                  path: route.path + '/' + today()
                }
              }
            }
          }
        ]
      },
      {
        path: 'account',
        component: () => import('../pages/AccountPage.vue'),
        beforeEnter: async () => {
          // oAuth doesn't work in SSR
          // return { path: '' }
          // const user = await useUser()
          // if (!user.value) {
          //   return { path: '' }
          // }
        },
        children: [
          {
            path: 'customer',
            component: () => import('../pages/account/CustomerPage.vue')
          },
          {
            path: 'contactpeople',
            component: () => import('../pages/account/ContactPeoplePage.vue')
          },
          {
            path: 'pets',
            component: () => import('../pages/account/PetsPage.vue')
          },
          {
            path: 'bookings',
            component: () => import('../pages/account/BookingsPage.vue')
          },
          {
            path: 'daycare',
            component: () => import('../pages/account/DaycarePage.vue')
          }
        ]
      },
      {
        path: '/:catchAll(.*)*',
        component: () => import('../pages/Error404Page.vue')
      }
    ]
  },
  {
    path: '/print',
    component: () => import('../layouts/PrintLayout.vue'),
    children: [
      {
        path: 'kennellayout/:date?',
        name: 'printkennellayout',
        component: () => import('../pages/print/KennelLayout.vue'),
        beforeEnter: (route) => {
          if (!route.params.date) {
            return {
              path: route.path + '/' + today()
            }
          }
        }
      }
    ]
  }
  // Always leave this as last one,
  // but you can also remove it
]

export default routes

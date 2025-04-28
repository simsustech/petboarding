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
        component: () => import('../pages/AvailabilityPage.vue'),
        meta: {
          lang: 'availability'
        }
      },
      {
        path: 'information',
        alias: ['informatie'],
        component: () => import('../pages/InformationPage.vue'),
        meta: {
          lang: 'information'
        }
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
            path: 'financial',
            component: () => import('../pages/admin/FinancialPage.vue'),
            children: [
              {
                path: 'overview',
                component: () =>
                  import('../pages/admin/financial/FinancialOverviewPage.vue')
              },
              {
                path: 'bookings',
                component: () =>
                  import('../pages/admin/financial/FinancialBookingsPage.vue')
              }
            ]
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
        children: [
          {
            path: '',
            component: () => import('../pages/EmployeePage.vue')
          },
          {
            path: 'overview/:date?',
            component: () => import('../pages/employee/OverviewPage.vue'),
            beforeEnter: (route) => {
              if (!route.params.date) {
                return {
                  path: route.path + '/' + today()
                }
              }
            },
            meta: {
              lang: 'overview'
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
            },
            meta: {
              lang: 'agenda'
            }
          },
          {
            path: 'customers/:id?',
            component: () => import('../pages/employee/CustomersPage.vue'),
            meta: {
              lang: 'customer'
            }
          },
          {
            path: 'pets/:ids*',
            component: () => import('../pages/employee/PetsPage.vue'),
            meta: {
              lang: 'pet'
            }
          },
          {
            path: 'bookings/:ids*',
            component: () => import('../pages/employee/BookingsPage.vue'),
            meta: {
              lang: 'booking'
            }
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
            },
            meta: {
              lang: 'kennellayout'
            }
          }
        ]
      },
      {
        path: 'account',
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
            path: '',
            component: () => import('../pages/AccountPage.vue')
          },
          {
            path: 'customer',
            components: {
              default: () =>
                import('../pages/account/CustomerPage/CustomerPage.vue'),
              fabs: () =>
                import('../pages/account/CustomerPage/CustomerPageFabs.vue')
            },
            meta: {
              lang: 'customer'
            }
          },
          {
            path: 'contactpeople',
            components: {
              default: () =>
                import(
                  '../pages/account/ContactPeoplePage/ContactPeoplePage.vue'
                ),
              fabs: () =>
                import(
                  '../pages/account/ContactPeoplePage/ContactPeoplePageFabs.vue'
                )
            },
            meta: {
              lang: 'contactperson'
            }
          },
          {
            path: 'pets',
            components: {
              default: () => import('../pages/account/PetsPage/PetsPage.vue'),
              fabs: () => import('../pages/account/PetsPage/PetsPageFabs.vue')
            },
            meta: {
              lang: 'pet'
            }
          },
          {
            path: 'bookings',
            components: {
              default: () =>
                import('../pages/account/BookingsPage/BookingsPage.vue'),
              fabs: () =>
                import('../pages/account/BookingsPage/BookingsPageFabs.vue')
            },
            meta: {
              lang: 'booking'
            }
          },
          {
            path: 'daycare',
            components: {
              default: () =>
                import('../pages/account/DaycarePage/DaycarePage.vue'),
              fabs: () =>
                import('../pages/account/DaycarePage/DaycarePageFabs.vue')
            },
            meta: {
              lang: 'daycare'
            }
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
      },
      {
        path: 'pets/:ids*',
        component: () => import('../pages/print/PetLabelsPage.vue')
      },
      {
        path: 'bookings/:ids*',
        component: () => import('../pages/print/BookingLabelsPage.vue')
      },
      {
        path: 'overview/:date',
        component: () => import('../pages/print/OverviewPage.vue')
      }
    ]
  }
  // Always leave this as last one,
  // but you can also remove it
]

export default routes

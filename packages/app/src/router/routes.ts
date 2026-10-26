import { RouteRecordRaw } from 'vue-router'
import { userRouteKey, redirectRouteKey } from '../oauth.js'
import { today } from '@timestamp-js/core'

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
        meta: { lang: 'administration' },
        children: [
          {
            path: '',
            meta: { lang: 'administration' },
            component: () => import('../pages/AdminPage.vue')
          },
          {
            path: 'financial',
            meta: { lang: 'financial' },
            children: [
              {
                path: '',
                meta: { lang: 'financial' },
                component: () => import('../pages/admin/FinancialPage.vue')
              },
              {
                path: 'overview',
                meta: { lang: 'overview' },
                component: () =>
                  import('../pages/admin/financial/FinancialOverviewPage.vue')
              },
              {
                path: 'bookings',
                meta: { lang: 'booking' },
                component: () =>
                  import('../pages/admin/financial/FinancialBookingsPage.vue')
              }
            ]
          },
          {
            path: 'accounts',
            meta: { lang: 'accounts' },
            component: () => import('../pages/admin/AccountsPage.vue')
          },
          {
            path: 'bookings',
            meta: { lang: 'booking' },
            component: () => import('../pages/admin/BookingsPage.vue')
          },
          {
            path: 'daycare',
            meta: { lang: 'daycare' },
            component: () => import('../pages/admin/DaycarePage.vue')
          },
          {
            path: 'occupancy/:date?',
            meta: { lang: 'occupancy' },
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
            meta: { lang: 'announcement' },
            components: {
              default: () =>
                import('../pages/admin/AnnouncementsPage/AnnouncementsPage.vue'),
              fabs: () =>
                import('../pages/admin/AnnouncementsPage/AnnouncementsPageFabs.vue')
            }
          },
          {
            path: 'periods',
            meta: { lang: 'period' },
            components: {
              default: () =>
                import('../pages/admin/PeriodsPage/PeriodsPage.vue'),
              fabs: () =>
                import('../pages/admin/PeriodsPage/PeriodsPageFabs.vue')
            }
          },
          {
            path: 'configuration',
            meta: { lang: 'configuration' },
            children: [
              {
                path: '',
                meta: { lang: 'configuration' },
                component: () => import('../pages/admin/ConfigurationPage.vue')
              },
              {
                path: 'categories',
                meta: { lang: 'category' },
                components: {
                  default: () =>
                    import('../pages/admin/configuration/CategoriesPage/CategoriesPage.vue'),
                  fabs: () =>
                    import('../pages/admin/configuration/CategoriesPage/CategoriesPageFabs.vue')
                }
              },
              {
                path: 'services',
                meta: { lang: 'service' },
                components: {
                  default: () =>
                    import('../pages/admin/configuration/ServicesPage/ServicesPage.vue'),
                  fabs: () =>
                    import('../pages/admin/configuration/ServicesPage/ServicesPageFabs.vue')
                }
              },
              {
                path: 'openingtimes',
                meta: { lang: 'openingTimes' },
                components: {
                  default: () =>
                    import('../pages/admin/configuration/OpeningTimesPage/OpeningTimesPage.vue'),
                  fabs: () =>
                    import('../pages/admin/configuration/OpeningTimesPage/OpeningTimesPageFabs.vue')
                }
              },
              {
                path: 'integrations',
                meta: { lang: 'integrations' },
                name: 'integrations',
                component: () =>
                  import('../pages/admin/configuration/IntegrationsPage.vue')
              },
              {
                path: 'daycaresubscriptions',
                meta: { lang: 'daycareSubscription' },
                components: {
                  default: () =>
                    import('../pages/admin/configuration/DaycareSubscriptionsPage/DaycareSubscriptionsPage.vue'),
                  fabs: () =>
                    import('../pages/admin/configuration/DaycareSubscriptionsPage/DaycareSubscriptionsPageFabs.vue')
                }
              },
              {
                path: 'buildings',
                meta: { lang: 'building' },
                components: {
                  default: () =>
                    import('../pages/admin/configuration/BuildingsPage/BuildingsPage.vue'),
                  fabs: () =>
                    import('../pages/admin/configuration/BuildingsPage/BuildingsPageFabs.vue')
                }
              },
              {
                path: 'kennels',
                meta: { lang: 'kennel' },
                components: {
                  default: () =>
                    import('../pages/admin/configuration/KennelsPage/KennelsPage.vue'),
                  fabs: () =>
                    import('../pages/admin/configuration/KennelsPage/KennelsPageFabs.vue')
                }
              },
              {
                path: 'documents',
                meta: { lang: 'document' },
                component: () =>
                  import('../pages/admin/configuration/DocumentsPage.vue')
              },
              {
                path: 'vacations',
                meta: { lang: 'vacation' },
                components: {
                  default: () =>
                    import('../pages/admin/configuration/VacationsPage/VacationsPage.vue'),
                  fabs: () =>
                    import('../pages/admin/configuration/VacationsPage/VacationsPageFabs.vue')
                }
              }
            ]
          }
        ]
      },
      {
        path: 'employee',
        meta: { lang: 'overview' },
        children: [
          {
            path: '',
            meta: { lang: 'overview' },
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
                meta: { lang: 'labelsPage' },
                component: () =>
                  import('../pages/employee/labels/PetLabelsPage.vue')
              },
              {
                path: 'bookings/:ids*',
                meta: { lang: 'labelsPage' },
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
        meta: { lang: 'account' },
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
            meta: { lang: 'account' },
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
                import('../pages/account/ContactPeoplePage/ContactPeoplePage.vue'),
              fabs: () =>
                import('../pages/account/ContactPeoplePage/ContactPeoplePageFabs.vue')
            },
            meta: {
              lang: 'contactPerson'
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
      // Always leave this as last one,
      // but you can also remove it
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
      },
      {
        path: 'termsandconditions',
        component: () => import('../pages/TermsAndConditions.vue'),
        alias: ['algemenevoorwaarden']
      },
      {
        path: 'privacypolicy',
        component: () => import('../pages/PrivacyPolicy.vue'),
        alias: ['privacyverklaring']
      }
    ]
  }
]

export default routes

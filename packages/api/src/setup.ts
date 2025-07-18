import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import modularapiPlugin from '@modular-api/api'
import { createAccountMethods } from '@modular-api/fastify-oidc/kysely'
import { createRouter, createContext } from './trpc/index.js'
import env from '@vitrify/tools/env'
import { fastifySsrPlugin as appSsrPlugin } from '@petboarding/app/fastify-ssr-plugin'
import { onAppRendered as appOnAppRendered } from '@petboarding/app/hooks'
import { db as kysely } from '../src/kysely/index.js'
import { oidcClientPlugin } from '@modular-api/api'
import { createSlimfactTrpcClient } from './slimfact/index.js'
import { initialize } from './pgboss.js'
import {
  findCustomerDaycareSubscription,
  setCustomerDaycareSubscriptionStatus
} from './repositories/customerDaycareSubscription.js'
import { type Invoice } from '@modular-api/fastify-checkout'
import { InvoiceStatus } from '@modular-api/fastify-checkout/types'

import {
  BOOKING_STATUS,
  CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS
} from './kysely/types.js'
import { createBookingStatus, findBooking } from './repositories/booking.js'
import { generateTheme } from 'unocss-preset-quasar/theme'

// const getString = (str: string) => str
// const host = getString(__HOST__)

const theme = generateTheme(
  env.read('SOURCE_COLOR') || env.read('VITE_SOURCE_COLOR')
)

const sassVariables = {
  $primary:
    env.read('SASS_VARIABLE_PRIMARY') || env.read('VITE_SASS_VARIABLE_PRIMARY'),
  $secondary:
    env.read('SASS_VARIABLE_SECONDARY') ||
    env.read('VITE_SASS_VARIABLE_SECONDARY'),
  $accent:
    env.read('SASS_VARIABLE_ACCENT') || env.read('VITE_SASS_VARIABLE_ACCENT'),
  $dark: env.read('SASS_VARIABLE_DARK') || env.read('VITE_SASS_VARIABLE_DARK'),
  $positive:
    env.read('SASS_VARIABLE_POSITIVE') ||
    env.read('VITE_SASS_VARIABLE_POSITIVE'),
  $negative:
    env.read('SASS_VARIABLE_NEGATIVE') ||
    env.read('VITE_SASS_VARIABLE_NEGATIVE'),
  $info: env.read('SASS_VARIABLE_INFO') || env.read('VITE_SASS_VARIABLE_INFO'),
  $warning:
    env.read('SASS_VARIABLE_WARNING') || env.read('VITE_SASS_VARIABLE_WARNING')
}

/**
 * Only used in SSR/SSG
 */
export default async function (fastify: FastifyInstance) {
  const host = env.read('API_HOST') || env.read('VITE_API_HOST')

  if (!host)
    throw new Error(
      'Please define a API_HOST or VITE_API_HOST environment variable'
    )

  const corsOrigin = [`https://${host}`]

  console.log('Running setup function....')
  const accountMethods = await createAccountMethods(
    fastify,
    kysely,
    {
      OTP_SECRET: env.read('OTP_SECRET') || env.read('VITE_OTP_SECRET'),
      OTP_VALIDITY_SECONDS:
        env.read('OTP_VALIDITY_SECONDS') ||
        env.read('VITE_OTP_VALIDITY_SECONDS'),
      EMAIL_FOOTER: env.read('EMAIL_FOOTER') || env.read('VITE_EMAIL_FOOTER')
    },
    env.read('VITE_LANG') || 'en-US'
  )

  const slimfactHost =
    env.read('VITE_SLIMFACT_HOST') || env.read('SLIMFACT_HOST')

  if (slimfactHost) {
    corsOrigin.push(`https://${slimfactHost}`)
    await fastify.register(oidcClientPlugin, {
      name: 'slimfact',
      clientId: 'petboarding',
      clientHost: host,
      serverHost: slimfactHost,
      // serverHost: 'demo.slimfact.app'
      kysely
    })

    createSlimfactTrpcClient({
      host: `https://${slimfactHost}`,
      fastify
    })

    fastify.post(
      '/webhook/slimfact',
      async (
        request: FastifyRequest<{ Body: { uuid: string } }>,
        reply: FastifyReply
      ) => {
        const { uuid } = request.body
        const invoice = await fastify.slimfact.admin.getInvoice.query({ uuid })
        if (invoice) {
          const customerDaycareSubscription =
            await findCustomerDaycareSubscription({
              criteria: {
                invoiceUuid: uuid
              }
            })
          const booking = await findBooking({
            criteria: {
              invoiceUuid: uuid
            }
          })
          if (customerDaycareSubscription) {
            const getCustomerDaycareSubscriptionStatus = ({
              invoice,
              customerDaycareSubscriptionStatus
            }: {
              invoice: Invoice
              customerDaycareSubscriptionStatus: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS
            }) => {
              if (invoice.status === InvoiceStatus.PAID)
                return CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID
              if (invoice.status === InvoiceStatus.CANCELED)
                return CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.CANCELED
              if (
                typeof invoice.amountDue === 'number' &&
                invoice.amountDue <= 0
              ) {
                return CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID
              }
              return customerDaycareSubscriptionStatus
            }
            await setCustomerDaycareSubscriptionStatus({
              id: customerDaycareSubscription.id,
              status: getCustomerDaycareSubscriptionStatus({
                invoice: invoice,
                customerDaycareSubscriptionStatus:
                  customerDaycareSubscription.status
              })
            })
          }

          if (booking) {
            if (
              booking.status?.status === BOOKING_STATUS.AWAITING_DOWNPAYMENT
            ) {
              if (
                invoice.amountPaid &&
                invoice.requiredDownPaymentAmount &&
                invoice.amountPaid >= invoice.requiredDownPaymentAmount
              ) {
                await createBookingStatus({
                  booking,
                  petIds: booking.pets.map((pet) => pet.id),
                  status: BOOKING_STATUS.APPROVED
                })
              }
            }
          }
        }
        return reply.send()
      }
    )
  }

  await fastify.register(modularapiPlugin, {
    kysely,
    cors: {
      origin: corsOrigin
    },
    trpc: {
      createRouter,
      createContext
    },
    oidc: {
      issuerName:
        env.read('OIDC_ISSUER_NAME') || env.read('VITE_OIDC_ISSUER_NAME'),
      locale: env.read('VITE_LANG') || 'en-US',
      themeColors: theme['colors'],
      sassVariables,
      issuer: `https://${host}`,
      accountMethods,
      firstPartyClients: ['petboarding'],
      jwksURL: new URL('./jwks/jwks.json', import.meta.url),
      // federated: {
      //   microsoft: {
      //     clientId: 'someId',
      //     wellKnownUrl: 'wellKnownUrl'
      //   }
      // },
      configuration: {
        cookies: {
          // https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#cookieskeys
          keys: (
            env.read('OIDC_COOKIES_KEYS') || env.read('VITE_OIDC_COOKIES_KEYS')
          ).split(',')
        },
        routes: {
          authorization: '/authorize',
          token: '/oauth/token'
        },
        // ttl: {
        //   AccessToken: 3 * 60
        // },
        clients: [
          {
            client_id:
              env.read('OIDC_CLIENT_ID') ||
              env.read('VITE_OIDC_CLIENT_ID') ||
              'petboarding',
            client_name: 'Petboarding webapp',
            logo_uri: 'https://www.petboarding.app/logo.png',
            grant_types: ['authorization_code', 'refresh_token'],
            scope: 'openid offline_access profile email api',
            client_secret: 'secret',
            redirect_uris: [`https://${host}/redirect`],
            token_endpoint_auth_method: 'none',
            'urn:custom:client:allowed-cors-origins': [`https://${host}`]
          }
        ],
        scopes: ['openid', 'offline_access', 'profile', 'email', 'api'],
        claims: {
          acr: null,
          auth_time: null,
          iss: null,
          openid: ['sub'],
          sid: null,
          profile: ['name', 'picture'],
          email: ['email', 'email_verified'],
          api: ['roles']
        }
      }
    },
    nodemailer: {
      defaults: { from: env.read('MAIL_FROM') || env.read('VITE_MAIL_FROM') },
      transport: {
        host: env.read('MAIL_HOST') || env.read('VITE_MAIL_HOST'),
        port: Number(env.read('MAIL_PORT') || env.read('VITE_MAIL_PORT')),
        secure:
          (env.read('MAIL_SECURE') || env.read('VITE_MAIL_SECURE')) === 'false'
            ? false
            : true,
        auth:
          (env.read('MAIL_USER') || env.read('VITE_MAIL_USER')) &&
          (env.read('MAIL_PASS') || env.read('VITE_MAIL_PASS'))
            ? {
                user: env.read('MAIL_USER') || env.read('VITE_MAIL_USER'),
                pass: env.read('MAIL_PASS') || env.read('VITE_MAIL_PASS')
              }
            : {}
      }
    },
    configuration: () => ({
      API_HOST: host,
      LICENSE_KEY: env.read('VITE_LICENSE_KEY'),
      LANG: env.read('VITE_LANG') || 'en-US',
      COUNTRY: env.read('VITE_COUNTRY') || 'NL',
      TITLE: env.read('VITE_TITLE') || 'Petboarding',
      ALLOWED_SPECIES: (
        env.read('ALLOWED_SPECIES') || env.read('VITE_ALLOWED_SPECIES')
      )?.split(','),
      DAYCARE_DISABLED_WEEKDAYS: (
        env.read('DAYCARE_DISABLED_WEEKDAYS') ||
        env.read('VITE_DAYCARE_DISABLED_WEEKDAYS')
      )
        ?.split(',')
        .map(Number),
      MANDATORY_VACCINATIONS_DOG: (
        env.read('MANDATORY_VACCINATIONS_DOG') ||
        env.read('VITE_MANDATORY_VACCINATIONS_DOG')
      )?.split(','),
      MANDATORY_VACCINATIONS_CAT: (
        env.read('MANDATORY_VACCINATIONS_CAT') ||
        env.read('VITE_MANDATORY_VACCINATIONS_CAT')
      )?.split(','),
      TERMS_AND_CONDITIONS_URL: env.read('VITE_TERMS_AND_CONDITIONS_URL'),
      SASS_VARIABLES: sassVariables,
      UNIT_OF_MASS: env.read('UNIT_OF_MASS') || env.read('VITE_UNIT_OF_MASS'),
      CURRENCY: env.read('CURRENCY') || env.read('VITE_CURRENCY'),
      INTEGRATIONS: {
        slimfact: {
          host: slimfactHost
        }
      },
      SUPPORT_EMAIL:
        env.read('SUPPORT_EMAIL') || env.read('VITE_SUPPORT_EMAIL'),
      THEME_COLORS: theme['colors']
    })
  })

  await fastify.register(appSsrPlugin, {
    host,
    onAppRendered: appOnAppRendered
  })

  const boss = await initialize({ fastify })
  fastify.decorate('pg-boss', boss)

  fastify.addHook('onClose', async () => {
    await boss.stop()
  })
}

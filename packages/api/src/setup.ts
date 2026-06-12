import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import modularapiPlugin from '@modular-api/api'
import { createAccountMethods } from '@modular-api/fastify-oidc/kysely'
import { createRouter, createContext } from './trpc/index.js'
import { config } from './env.js'
import { fastifySsrPlugin as appSsrPlugin } from '@petboarding/app/fastify-ssr-plugin'
import { hooks } from '@petboarding/app/hooks'
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
} from '@petboarding/tools/constants'
import { createBookingStatus, findBooking } from './repositories/booking.js'
import { registerHealthRoutes } from './routes/health.js'
import { generateTheme } from 'unocss-preset-quasar/theme'

const theme = generateTheme(config.sourceColor)

function isBase32(input: string) {
  const regex = /^([A-Z2-7=]{8})+$/
  return regex.test(input)
}

/**
 * Only used in SSR/SSG
 */
export default async function (fastify: FastifyInstance) {
  const host = config.apiHost
  const OTP_SECRET = config.otpSecret

  if (!isBase32(OTP_SECRET)) {
    throw new Error('OTP_SECRET is not a valid Base32 encoded string.')
  }

  const corsOrigin = [`https://${host}`]

  await registerHealthRoutes(fastify)

  console.log('Running setup function....')
  const accountMethods = await createAccountMethods(
    fastify,
    kysely,
    {
      OTP_SECRET,
      OTP_VALIDITY_SECONDS: config.otpValiditySeconds,
      EMAIL_FOOTER: config.emailFooter
    },
    config.lang
  )

  const slimfactHost = config.slimfactHost

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
      issuerName: config.oidcIssuerName,
      locale: config.lang,
      themeColors: theme['colors'],
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
          keys: config.oidcCookiesKeys.split(',')
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
            client_id: config.oidcClientId,
            client_name: 'Petboarding webapp',
            logo_uri: 'https://www.petboarding.app/logo.png',
            grant_types: ['authorization_code', 'refresh_token'],
            scope: 'openid offline_access profile email api',
            client_secret: config.oidcClientSecret,
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
      },
      defaultCredentials: {
        email: config.modularapiDefaultEmail,
        password: config.modularapiDefaultPassword
      }
    },
    nodemailer: {
      defaults: { from: config.mailFrom },
      transport: {
        host: config.mailHost,
        port: config.mailPort,
        secure: config.mailSecure,
        auth:
          config.mailUser && config.mailPass
            ? {
                user: config.mailUser,
                pass: config.mailPass
              }
            : {}
      }
    },
    configuration: () => ({
      API_HOST: host,
      LICENSE_KEY: config.licenseKey,
      LANG: config.lang,
      COUNTRY: config.country,
      TITLE: config.title,
      ALLOWED_SPECIES: config.allowedSpecies,
      DAYCARE_DISABLED_WEEKDAYS: config.daycareDisabledWeekdays,
      MANDATORY_VACCINATIONS_DOG: config.mandatoryVaccinationsDog,
      MANDATORY_VACCINATIONS_CAT: config.mandatoryVaccinationsCat,
      TERMS_AND_CONDITIONS_URL: config.termsAndConditionsUrl,
      UNIT_OF_MASS: config.unitOfMass,
      CURRENCY: config.currency,
      INTEGRATIONS: {
        slimfact: {
          host: slimfactHost
        }
      },
      SUPPORT_EMAIL: config.supportEmail,
      THEME_COLORS: theme['colors']
    })
  })

  await fastify.register(appSsrPlugin, {
    host,
    onAppRendered: hooks.appOnAppRendered
  })

  const boss = await initialize({ fastify })
  fastify.decorate('pg-boss', boss)

  fastify.addHook('onClose', async () => {
    await boss.stop()
  })
}

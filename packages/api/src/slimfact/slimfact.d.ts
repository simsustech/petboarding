import type { inferAsyncReturnType } from '@trpc/server'
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'
import type { FastifyInstance } from 'fastify'
import { SLIMFACT_ACCOUNT_ROLES } from '../zod/account.js'
export declare const t: {
  _config: import('@trpc/server/unstable-core-do-not-import').RootConfig<{
    ctx: {
      account: {
        id: string
        roles?: string[]
      } | null
    }
    meta: object
    errorShape: import('@trpc/server/unstable-core-do-not-import').DefaultErrorShape
    transformer: false
  }>
  procedure: import('@trpc/server/unstable-core-do-not-import').ProcedureBuilder<
    {
      account: {
        id: string
        roles?: string[]
      } | null
    },
    object,
    object,
    typeof import('@trpc/server/unstable-core-do-not-import').unsetMarker,
    typeof import('@trpc/server/unstable-core-do-not-import').unsetMarker,
    typeof import('@trpc/server/unstable-core-do-not-import').unsetMarker,
    typeof import('@trpc/server/unstable-core-do-not-import').unsetMarker,
    false
  >
  middleware: <$ContextOverrides>(
    fn: import('@trpc/server/unstable-core-do-not-import').MiddlewareFunction<
      {
        account: {
          id: string
          roles?: string[]
        } | null
      },
      object,
      object,
      $ContextOverrides,
      unknown
    >
  ) => import('@trpc/server/unstable-core-do-not-import').MiddlewareBuilder<
    {
      account: {
        id: string
        roles?: string[]
      } | null
    },
    object,
    $ContextOverrides,
    unknown
  >
  router: <
    TInput extends
      import('@trpc/server/unstable-core-do-not-import').CreateRouterOptions
  >(
    input: TInput
  ) => import('@trpc/server/unstable-core-do-not-import').BuiltRouter<
    {
      ctx: {
        account: {
          id: string
          roles?: string[]
        } | null
      }
      meta: object
      errorShape: import('@trpc/server/unstable-core-do-not-import').DefaultErrorShape
      transformer: false
    },
    import('@trpc/server/unstable-core-do-not-import').DecorateCreateRouterOptions<TInput>
  >
  mergeRouters: typeof import('@trpc/server/unstable-core-do-not-import').mergeRouters
  createCallerFactory: <TRecord extends import('@trpc/server').RouterRecord>(
    router: Pick<
      import('@trpc/server/unstable-core-do-not-import').Router<
        {
          ctx: {
            account: {
              id: string
              roles?: string[]
            } | null
          }
          meta: object
          errorShape: import('@trpc/server/unstable-core-do-not-import').DefaultErrorShape
          transformer: false
        },
        TRecord
      >,
      '_def'
    >
  ) => import('@trpc/server/unstable-core-do-not-import').RouterCaller<
    {
      ctx: {
        account: {
          id: string
          roles?: string[]
        } | null
      }
      meta: object
      errorShape: import('@trpc/server/unstable-core-do-not-import').DefaultErrorShape
      transformer: false
    },
    TRecord
  >
}
export declare const userProcedure: import('@trpc/server/unstable-core-do-not-import').ProcedureBuilder<
  {
    account: {
      id: string
      roles?: string[]
    } | null
  },
  object,
  {
    account: {
      id: string
      roles?: string[]
    } | null
  },
  typeof import('@trpc/server/unstable-core-do-not-import').unsetMarker,
  typeof import('@trpc/server/unstable-core-do-not-import').unsetMarker,
  typeof import('@trpc/server/unstable-core-do-not-import').unsetMarker,
  typeof import('@trpc/server/unstable-core-do-not-import').unsetMarker,
  false
>
export declare const adminProcedure: import('@trpc/server/unstable-core-do-not-import').ProcedureBuilder<
  {
    account: {
      id: string
      roles?: string[]
    } | null
  },
  object,
  {
    account: {
      id: string
      roles?: string[]
    } | null
  },
  typeof import('@trpc/server/unstable-core-do-not-import').unsetMarker,
  typeof import('@trpc/server/unstable-core-do-not-import').unsetMarker,
  typeof import('@trpc/server/unstable-core-do-not-import').unsetMarker,
  typeof import('@trpc/server/unstable-core-do-not-import').unsetMarker,
  false
>
export declare const employeeProcedure: import('@trpc/server/unstable-core-do-not-import').ProcedureBuilder<
  {
    account: {
      id: string
      roles?: string[]
    } | null
  },
  object,
  {
    account: {
      id: string
      roles?: string[]
    } | null
  },
  typeof import('@trpc/server/unstable-core-do-not-import').unsetMarker,
  typeof import('@trpc/server/unstable-core-do-not-import').unsetMarker,
  typeof import('@trpc/server/unstable-core-do-not-import').unsetMarker,
  typeof import('@trpc/server/unstable-core-do-not-import').unsetMarker,
  false
>
export declare const createRouter: (
  fastify: FastifyInstance
) => import('@trpc/server/unstable-core-do-not-import').BuiltRouter<
  {
    ctx: object
    meta: object
    errorShape: import('@trpc/server/unstable-core-do-not-import').DefaultErrorShape
    transformer: false
  },
  import('@trpc/server/unstable-core-do-not-import').DecorateCreateRouterOptions<{
    user: import('@trpc/server/unstable-core-do-not-import').BuiltRouter<
      {
        ctx: {
          account: {
            id: string
            roles?: string[]
          } | null
        }
        meta: object
        errorShape: import('@trpc/server/unstable-core-do-not-import').DefaultErrorShape
        transformer: false
      },
      import('@trpc/server/unstable-core-do-not-import').DecorateCreateRouterOptions<{
        getInvoices: import('@trpc/server').TRPCQueryProcedure<{
          input: void
          output: import('@modular-api/fastify-checkout').Invoice[]
        }>
        getReceipts: import('@trpc/server').TRPCQueryProcedure<{
          input: void
          output: import('@modular-api/fastify-checkout').Invoice[]
        }>
        getBills: import('@trpc/server').TRPCQueryProcedure<{
          input: void
          output: import('@modular-api/fastify-checkout').Invoice[]
        }>
      }>
    >
    admin: import('@trpc/server/unstable-core-do-not-import').BuiltRouter<
      {
        ctx: {
          account: {
            id: string
            roles?: string[]
          } | null
        }
        meta: object
        errorShape: import('@trpc/server/unstable-core-do-not-import').DefaultErrorShape
        transformer: false
      },
      import('@trpc/server/unstable-core-do-not-import').DecorateCreateRouterOptions<{
        healthcheck: import('@trpc/server').TRPCQueryProcedure<{
          input: void
          output: boolean
        }>
        createSubscription: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            name: string | null
            companyId: number
            clientId: number
            numberPrefixTemplate: string
            locale: string
            currency: 'EUR' | 'USD'
            lines: {
              listPrice: number
              listPriceIncludesTax: boolean
              taxRate: number
              description: string
              quantity: number
              quantityPerMille: boolean
              discount: number
            }[]
            paymentTermDays: number
            startDate: string
            endDate: string | null
            cronSchedule: string
            type: 'invoice' | 'bill'
            id?: number | undefined
            uuid?: string | undefined
            active?: boolean | undefined
            discounts?:
              | {
                  listPrice: number
                  listPriceIncludesTax: boolean
                  taxRate: number
                  description: string
                }[]
              | undefined
            surcharges?:
              | {
                  listPrice: number
                  listPriceIncludesTax: boolean
                  taxRate: number
                  description: string
                }[]
              | undefined
            createdAt?: string | undefined
            company?:
              | {
                  name: string
                  address: string
                  bic: string
                  city: string
                  cocNumber: string
                  country: string
                  email: string
                  emailBcc: string
                  iban: string
                  postalCode: string
                  prefix: string
                  vatIdNumber: string
                  id?: number | undefined
                  contactPersonName?: string | null | undefined
                  logoSvg?: string | null | undefined
                  telephoneNumber?: string | null | undefined
                  website?: string | null | undefined
                  defaultNumberPrefixTemplate?: string | null | undefined
                  defaultLocale?: string | null | undefined
                  defaultCurrency?: 'EUR' | 'USD' | null | undefined
                }
              | undefined
            client?:
              | {
                  address: string
                  city: string
                  email: string
                  postalCode: string
                  number?: string | null | undefined
                  id?: number | undefined
                  cocNumber?: string | null | undefined
                  contactPersonName?: string | undefined
                  country?: string | undefined
                  vatIdNumber?: string | null | undefined
                  companyName?: string | undefined
                  accountId?: number | null | undefined
                }
              | undefined
          }
          output: {
            id: number
            uuid: string
            name: string | null
            active: boolean | null
            companyId: number
            clientId: number
            numberPrefixTemplate: string
            locale: string
            currency: 'EUR' | 'USD'
            lines: import('@modular-api/fastify-checkout').RawInvoiceLine[]
            discounts:
              | import('@modular-api/fastify-checkout').RawInvoiceDiscount[]
              | null
            surcharges:
              | import('@modular-api/fastify-checkout').RawInvoiceSurcharge[]
              | null
            paymentTermDays: number
            startDate: string
            endDate: string | null
            cronSchedule: string
            type: 'invoice' | 'bill'
            createdAt: string
          }
        }>
        updateSubscription: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            name: string | null
            companyId: number
            clientId: number
            numberPrefixTemplate: string
            locale: string
            currency: 'EUR' | 'USD'
            lines: {
              listPrice: number
              listPriceIncludesTax: boolean
              taxRate: number
              description: string
              quantity: number
              quantityPerMille: boolean
              discount: number
            }[]
            paymentTermDays: number
            startDate: string
            endDate: string | null
            cronSchedule: string
            type: 'invoice' | 'bill'
            id?: number | undefined
            uuid?: string | undefined
            active?: boolean | undefined
            discounts?:
              | {
                  listPrice: number
                  listPriceIncludesTax: boolean
                  taxRate: number
                  description: string
                }[]
              | undefined
            surcharges?:
              | {
                  listPrice: number
                  listPriceIncludesTax: boolean
                  taxRate: number
                  description: string
                }[]
              | undefined
            createdAt?: string | undefined
            company?:
              | {
                  name: string
                  address: string
                  bic: string
                  city: string
                  cocNumber: string
                  country: string
                  email: string
                  emailBcc: string
                  iban: string
                  postalCode: string
                  prefix: string
                  vatIdNumber: string
                  id?: number | undefined
                  contactPersonName?: string | null | undefined
                  logoSvg?: string | null | undefined
                  telephoneNumber?: string | null | undefined
                  website?: string | null | undefined
                  defaultNumberPrefixTemplate?: string | null | undefined
                  defaultLocale?: string | null | undefined
                  defaultCurrency?: 'EUR' | 'USD' | null | undefined
                }
              | undefined
            client?:
              | {
                  address: string
                  city: string
                  email: string
                  postalCode: string
                  number?: string | null | undefined
                  id?: number | undefined
                  cocNumber?: string | null | undefined
                  contactPersonName?: string | undefined
                  country?: string | undefined
                  vatIdNumber?: string | null | undefined
                  companyName?: string | undefined
                  accountId?: number | null | undefined
                }
              | undefined
          }
          output: import('kysely').UpdateResult
        }>
        startSubscription: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            id: number
          }
          output: void
        }>
        stopSubscription: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            id: number
          }
          output: import('kysely').UpdateResult
        }>
        getSubscriptions: import('@trpc/server').TRPCQueryProcedure<{
          input:
            | {
                active?: boolean | undefined
                companyId?: number | null | undefined
                clientId?: number | null | undefined
                pagination?:
                  | {
                      sortBy: 'id'
                      limit: number
                      offset: number
                      descending: boolean
                    }
                  | undefined
              }
            | undefined
          output: {
            id: number
            uuid: string
            name: string | null
            active: boolean | null
            companyId: number
            clientId: number
            numberPrefixTemplate: string
            locale: string
            currency: 'EUR' | 'USD'
            lines: import('@modular-api/fastify-checkout').RawInvoiceLine[]
            discounts:
              | import('@modular-api/fastify-checkout').RawInvoiceDiscount[]
              | null
            surcharges:
              | import('@modular-api/fastify-checkout').RawInvoiceSurcharge[]
              | null
            paymentTermDays: number
            startDate: string
            endDate: string | null
            cronSchedule: string
            type: 'invoice' | 'bill'
            createdAt: string
            client: {
              contactPersonName: import('node_modules/kysely/dist/esm/util/type-utils.js').ExtractColumnType<
                import('../kysely/types.js').DB,
                'subscriptions' | 'clients',
                'contactPersonName'
              >
              companyName: import('node_modules/kysely/dist/esm/util/type-utils.js').ExtractColumnType<
                import('../kysely/types.js').DB,
                'subscriptions' | 'clients',
                'companyName'
              >
            } | null
            company: {
              name: import('node_modules/kysely/dist/esm/util/type-utils.js').ExtractColumnType<
                import('../kysely/types.js').DB,
                'subscriptions' | 'companies',
                'name'
              >
            } | null
            total?: number | undefined
          }[]
        }>
        createInitialNumberForPrefix: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            companyId: number
            numberPrefix: string
            initialNumber: number
            id?: number | undefined
          }
          output: {
            id: number
            companyId: number
            numberPrefix: string
            initialNumber: number
          }
        }>
        getInitialNumberForPrefixes: import('@trpc/server').TRPCQueryProcedure<{
          input: void
          output: {
            id: number
            companyId: number
            numberPrefix: string
            initialNumber: number
            company: {
              name: string
            } | null
          }[]
        }>
        updateInitialNumberForPrefix: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            companyId: number
            numberPrefix: string
            initialNumber: number
            id?: number | undefined
          }
          output: import('kysely').UpdateResult
        }>
        createNumberPrefix: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            name: string
            template: string
            id?: number | undefined
          }
          output: {
            id: number
            name: string
            template: string
          }
        }>
        getNumberPrefixes: import('@trpc/server').TRPCQueryProcedure<{
          input: void
          output: {
            id: number
            name: string
            template: string
          }[]
        }>
        updateNumberPrefix: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            name: string
            template: string
            id?: number | undefined
          }
          output: import('kysely').UpdateResult
        }>
        createClient: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            address: string
            city: string
            email: string
            postalCode: string
            number?: string | null | undefined
            id?: number | undefined
            cocNumber?: string | null | undefined
            contactPersonName?: string | undefined
            country?: string | undefined
            vatIdNumber?: string | null | undefined
            companyName?: string | undefined
            accountId?: number | null | undefined
          }
          output: {
            number: string | null
            id: number
            createdAt: string
            address: string
            city: string
            cocNumber: string | null
            contactPersonName: string | null
            country: string | null
            email: string
            postalCode: string
            vatIdNumber: string | null
            companyName: string | null
            accountId: number | null
          }
        }>
        getClients: import('@trpc/server').TRPCQueryProcedure<{
          input: {
            pagination?:
              | {
                  sortBy: 'id'
                  limit: number
                  offset: number
                  descending: boolean
                }
              | undefined
          }
          output: {
            total?: number | undefined
            number: string | null
            id: number
            createdAt: string
            address: string
            city: string
            cocNumber: string | null
            contactPersonName: string | null
            country: string | null
            email: string
            postalCode: string
            vatIdNumber: string | null
            companyName: string | null
            accountId: number | null
          }[]
        }>
        updateClient: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            address: string
            city: string
            email: string
            postalCode: string
            number?: string | null | undefined
            id?: number | undefined
            cocNumber?: string | null | undefined
            contactPersonName?: string | undefined
            country?: string | undefined
            vatIdNumber?: string | null | undefined
            companyName?: string | undefined
            accountId?: number | null | undefined
          }
          output: import('kysely').UpdateResult
        }>
        searchClients: import('@trpc/server').TRPCQueryProcedure<{
          input: {
            name: string
            pagination?:
              | {
                  sortBy: 'id'
                  limit: number
                  offset: number
                  descending: boolean
                }
              | undefined
          }
          output: {
            total?: number | undefined
            number: string | null
            id: number
            createdAt: string
            address: string
            city: string
            cocNumber: string | null
            contactPersonName: string | null
            country: string | null
            email: string
            postalCode: string
            vatIdNumber: string | null
            companyName: string | null
            accountId: number | null
          }[]
        }>
        createCompany: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            name: string
            address: string
            bic: string
            city: string
            cocNumber: string
            country: string
            email: string
            emailBcc: string
            iban: string
            postalCode: string
            prefix: string
            vatIdNumber: string
            id?: number | undefined
            contactPersonName?: string | null | undefined
            logoSvg?: string | null | undefined
            telephoneNumber?: string | null | undefined
            website?: string | null | undefined
            defaultNumberPrefixTemplate?: string | null | undefined
            defaultLocale?: string | null | undefined
            defaultCurrency?: 'EUR' | 'USD' | null | undefined
          }
          output: {
            id: number
            name: string
            createdAt: string
            address: string
            bic: string
            city: string
            cocNumber: string
            contactPersonName: string | null
            country: string
            email: string
            emailBcc: string | null
            iban: string
            logoSvg: string | null
            postalCode: string
            prefix: string
            telephoneNumber: string | null
            vatIdNumber: string
            website: string | null
            defaultNumberPrefixTemplate: string | null
            defaultLocale: string | null
            defaultCurrency: 'EUR' | 'USD' | null
          }
        }>
        getCompanies: import('@trpc/server').TRPCQueryProcedure<{
          input: void
          output: {
            id: number
            name: string
            createdAt: string
            address: string
            bic: string
            city: string
            cocNumber: string
            contactPersonName: string | null
            country: string
            email: string
            emailBcc: string | null
            iban: string
            logoSvg: string | null
            postalCode: string
            prefix: string
            telephoneNumber: string | null
            vatIdNumber: string
            website: string | null
            defaultNumberPrefixTemplate: string | null
            defaultLocale: string | null
            defaultCurrency: 'EUR' | 'USD' | null
          }[]
        }>
        getCompany: import('@trpc/server').TRPCQueryProcedure<{
          input: {
            id: number
          }
          output: {
            id: number
            name: string
            createdAt: string
            address: string
            bic: string
            city: string
            cocNumber: string
            contactPersonName: string | null
            country: string
            email: string
            emailBcc: string | null
            iban: string
            logoSvg: string | null
            postalCode: string
            prefix: string
            telephoneNumber: string | null
            vatIdNumber: string
            website: string | null
            defaultNumberPrefixTemplate: string | null
            defaultLocale: string | null
            defaultCurrency: 'EUR' | 'USD' | null
          }
        }>
        updateCompany: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            name: string
            address: string
            bic: string
            city: string
            cocNumber: string
            country: string
            email: string
            emailBcc: string
            iban: string
            postalCode: string
            prefix: string
            vatIdNumber: string
            id?: number | undefined
            contactPersonName?: string | null | undefined
            logoSvg?: string | null | undefined
            telephoneNumber?: string | null | undefined
            website?: string | null | undefined
            defaultNumberPrefixTemplate?: string | null | undefined
            defaultLocale?: string | null | undefined
            defaultCurrency?: 'EUR' | 'USD' | null | undefined
          }
          output: import('kysely').UpdateResult
        }>
        searchCompanies: import('@trpc/server').TRPCQueryProcedure<{
          input: string
          output: {
            id: number
            name: string
            createdAt: string
            address: string
            bic: string
            city: string
            cocNumber: string
            contactPersonName: string | null
            country: string
            email: string
            emailBcc: string | null
            iban: string
            logoSvg: string | null
            postalCode: string
            prefix: string
            telephoneNumber: string | null
            vatIdNumber: string
            website: string | null
            defaultNumberPrefixTemplate: string | null
            defaultLocale: string | null
            defaultCurrency: 'EUR' | 'USD' | null
          }[]
        }>
        createInvoice: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            numberPrefixTemplate: string
            currency: 'EUR' | 'USD'
            lines: {
              listPrice: number
              listPriceIncludesTax: boolean
              taxRate: number
              description: string
              quantity: number
              quantityPerMille: boolean
              discount: number
              quantityUnit?: 'kg' | 'm' | 'h' | null | undefined
            }[]
            paymentTermDays: number
            metadata?: Record<string, unknown> | null | undefined
            id?: number | undefined
            uuid?: string | undefined
            companyId?: number | undefined
            clientId?: number | null | undefined
            locale?: string | undefined
            discounts?:
              | {
                  listPrice: number
                  listPriceIncludesTax: boolean
                  taxRate: number
                  description?: string | null | undefined
                }[]
              | null
              | undefined
            surcharges?:
              | {
                  listPrice: number
                  listPriceIncludesTax: boolean
                  taxRate: number
                  description?: string | null | undefined
                }[]
              | null
              | undefined
            status?:
              | import('@modular-api/fastify-checkout').InvoiceStatus
              | undefined
            paymentId?: number | null | undefined
            companyPrefix?: string | undefined
            numberPrefix?: string | null | undefined
            companyDetails?:
              | {
                  name: string
                  address: string
                  bic: string
                  city: string
                  cocNumber: string
                  country: string
                  email: string
                  emailBcc: string
                  iban: string
                  postalCode: string
                  prefix: string
                  vatIdNumber: string
                  id?: number | undefined
                  contactPersonName?: string | null | undefined
                  logoSvg?: string | null | undefined
                  telephoneNumber?: string | null | undefined
                  website?: string | null | undefined
                  defaultNumberPrefixTemplate?: string | null | undefined
                  defaultLocale?: string | null | undefined
                  defaultCurrency?: 'EUR' | 'USD' | null | undefined
                }
              | undefined
            clientDetails?:
              | {
                  address: string
                  city: string
                  email: string
                  postalCode: string
                  number?: string | null | undefined
                  id?: number | undefined
                  cocNumber?: string | null | undefined
                  contactPersonName?: string | undefined
                  country?: string | undefined
                  vatIdNumber?: string | null | undefined
                  companyName?: string | undefined
                  accountId?: number | null | undefined
                }
              | undefined
            requiredDownPaymentAmount?: number | undefined
            projectId?: string | null | undefined
            notes?: string | null | undefined
            reminderSentDates?: string[] | undefined
          }
          output: import('@modular-api/fastify-checkout').Invoice
        }>
        updateInvoice: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            numberPrefixTemplate: string
            currency: 'EUR' | 'USD'
            lines: {
              listPrice: number
              listPriceIncludesTax: boolean
              taxRate: number
              description: string
              quantity: number
              quantityPerMille: boolean
              discount: number
              quantityUnit?: 'kg' | 'm' | 'h' | null | undefined
            }[]
            paymentTermDays: number
            metadata?: Record<string, unknown> | null | undefined
            id?: number | undefined
            uuid?: string | undefined
            companyId?: number | undefined
            clientId?: number | null | undefined
            locale?: string | undefined
            discounts?:
              | {
                  listPrice: number
                  listPriceIncludesTax: boolean
                  taxRate: number
                  description?: string | null | undefined
                }[]
              | null
              | undefined
            surcharges?:
              | {
                  listPrice: number
                  listPriceIncludesTax: boolean
                  taxRate: number
                  description?: string | null | undefined
                }[]
              | null
              | undefined
            status?:
              | import('@modular-api/fastify-checkout').InvoiceStatus
              | undefined
            paymentId?: number | null | undefined
            companyPrefix?: string | undefined
            numberPrefix?: string | null | undefined
            companyDetails?:
              | {
                  name: string
                  address: string
                  bic: string
                  city: string
                  cocNumber: string
                  country: string
                  email: string
                  emailBcc: string
                  iban: string
                  postalCode: string
                  prefix: string
                  vatIdNumber: string
                  id?: number | undefined
                  contactPersonName?: string | null | undefined
                  logoSvg?: string | null | undefined
                  telephoneNumber?: string | null | undefined
                  website?: string | null | undefined
                  defaultNumberPrefixTemplate?: string | null | undefined
                  defaultLocale?: string | null | undefined
                  defaultCurrency?: 'EUR' | 'USD' | null | undefined
                }
              | undefined
            clientDetails?:
              | {
                  address: string
                  city: string
                  email: string
                  postalCode: string
                  number?: string | null | undefined
                  id?: number | undefined
                  cocNumber?: string | null | undefined
                  contactPersonName?: string | undefined
                  country?: string | undefined
                  vatIdNumber?: string | null | undefined
                  companyName?: string | undefined
                  accountId?: number | null | undefined
                }
              | undefined
            requiredDownPaymentAmount?: number | undefined
            projectId?: string | null | undefined
            notes?: string | null | undefined
            reminderSentDates?: string[] | undefined
          }
          output: import('@modular-api/fastify-checkout').Invoice
        }>
        getInvoices: import('@trpc/server').TRPCQueryProcedure<{
          input:
            | {
                status:
                  | import('@modular-api/fastify-checkout').InvoiceStatus
                  | null
                companyId?: number | null | undefined
                clientId?: number | null | undefined
                clientDetails?:
                  | {
                      name: string | null
                    }
                  | null
                  | undefined
                pagination?:
                  | {
                      sortBy:
                        | 'id'
                        | 'companyId'
                        | 'clientId'
                        | 'totalIncludingTax'
                      limit: number
                      offset: number
                      descending: boolean
                    }
                  | undefined
                uuids?: string[] | undefined
                paid?: boolean | undefined
              }
            | undefined
          output: import('@modular-api/fastify-checkout').Invoice[] | undefined
        }>
        getInvoice: import('@trpc/server').TRPCQueryProcedure<{
          input: {
            id?: number | undefined
            uuid?: string | undefined
          }
          output: import('@modular-api/fastify-checkout').Invoice | null
        }>
        sendInvoice: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            id: number
            emailSubject: string
            emailBody: string
          }
          output: boolean | undefined
        }>
        remindInvoice: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            id: number
            emailSubject: string
            emailBody: string
          }
          output: boolean | undefined
        }>
        exhortInvoice: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            id: number
            emailSubject: string
            emailBody: string
          }
          output: boolean | undefined
        }>
        sendBill: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            id: number
            emailSubject: string
            emailBody: string
          }
          output: true | undefined
        }>
        sendReceipt: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            id: number
            emailSubject: string
            emailBody: string
          }
          output: true | undefined
        }>
        getInvoiceEmail: import('@trpc/server').TRPCQueryProcedure<{
          input: {
            id: number
            type: 'invoice' | 'bill' | 'receipt'
            action: 'send' | 'remind' | 'exhort'
          }
          output: {
            subject: string
            body: string
          }
        }>
        cancelInvoice: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            id: number
          }
          output: true | undefined
        }>
        addPaymentToInvoice: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            id: number
            payment: {
              currency: 'EUR' | 'USD'
              method: import('@modular-api/fastify-checkout').PaymentMethod
              amount: number
              description?: string | undefined
              transactionReference?: string | undefined
              redirectUrl?: string | undefined
            }
          }
          output: {
            checkoutUrl: string | null | undefined
            payment: {
              description: string
              metadata: Record<string, unknown> | null
              id: number
              uuid: string | null
              currency: 'EUR' | 'USD'
              createdAt: string
              orderId: number | null
              invoiceId: number | null
              paymentServiceProvider: 'mollie' | null
              method: import('@modular-api/fastify-checkout').PaymentMethod
              externalId: string | null
              transactionReference: string | null
              amount: number
              status: import('@modular-api/fastify-checkout').PaymentStatus
              paidAt: string | null
              details:
                | import('node_modules/@modular-api/fastify-checkout/dist/types/kysely/types/Payment.js').PaymentDetails
                | null
            }
          }
        }>
        setInvoiceStatus: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            id: number
            status: import('@modular-api/fastify-checkout').InvoiceStatus
          }
          output: void
        }>
        refundInvoice: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            id: number
          }
          output: {
            description: string
            metadata: Record<string, unknown> | null
            id: number
            uuid: string | null
            currency: 'EUR' | 'USD'
            createdAt: string
            paymentServiceProvider: 'mollie' | null
            externalId: string | null
            amount: number
            status: import('@modular-api/fastify-checkout').RefundStatus
            paymentId: number
          }
        }>
        getAccount: import('@trpc/server').TRPCQueryProcedure<{
          input: {
            id: number
          }
          output:
            | {
                id: number
                uuid: string | null
                name: string | null
                createdAt: string
                email: string
                verified: boolean
                customFields: Record<string, unknown> | null
                roles: string[] | null
              }
            | undefined
        }>
        getAccounts: import('@trpc/server').TRPCQueryProcedure<{
          input: {
            criteria?:
              | {
                  name?: string | undefined
                  email?: string | undefined
                  roles?: SLIMFACT_ACCOUNT_ROLES[] | undefined
                }
              | undefined
            pagination?:
              | {
                  sortBy: 'id' | 'name' | 'email' | null
                  limit: number
                  offset: number
                  descending: boolean
                }
              | undefined
          }
          output: {
            id: number
            uuid: string | null
            name: string | null
            createdAt: string
            email: string
            verified: boolean
            customFields: Record<string, unknown> | null
            roles: string[] | null
          }[]
        }>
        getAccountsCount: import('@trpc/server').TRPCQueryProcedure<{
          input:
            | {
                criteria?:
                  | {
                      name?: string | undefined
                      email?: string | undefined
                      roles?: SLIMFACT_ACCOUNT_ROLES[] | undefined
                    }
                  | undefined
              }
            | undefined
          output: number
        }>
        findAccounts: import('@trpc/server').TRPCQueryProcedure<{
          input: {
            email?: string | undefined
            ids?: number[] | undefined
            searchPhrase?: string | undefined
          }
          output: {
            id: number
            uuid: string | null
            name: string | null
            createdAt: string
            email: string
            verified: boolean
            customFields: Record<string, unknown> | null
            roles: string[] | null
          }[]
        }>
        addRole: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            id: number
            role: SLIMFACT_ACCOUNT_ROLES
          }
          output: boolean
        }>
        removeRole: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            id: number
            role: SLIMFACT_ACCOUNT_ROLES
          }
          output: boolean
        }>
      }>
    >
    public: import('@trpc/server/unstable-core-do-not-import').BuiltRouter<
      {
        ctx: {
          account: {
            id: string
            roles?: string[]
          } | null
        }
        meta: object
        errorShape: import('@trpc/server/unstable-core-do-not-import').DefaultErrorShape
        transformer: false
      },
      import('@trpc/server/unstable-core-do-not-import').DecorateCreateRouterOptions<{
        getInvoice: import('@trpc/server').TRPCQueryProcedure<{
          input: {
            uuid: string
          }
          output: import('@modular-api/fastify-checkout').Invoice
        }>
        payWithIdeal: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            uuid: string
          }
          output: string | null | undefined
        }>
        payDownPaymentWithIdeal: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            uuid: string
          }
          output: string | null | undefined
        }>
        payWithSmartpin: import('@trpc/server').TRPCMutationProcedure<{
          input: {
            uuid: string
          }
          output: string | null | undefined
        }>
      }>
    >
  }>
>
export declare const createContext: (
  fastify?: FastifyInstance
) => ({ req, res }: CreateFastifyContextOptions) => {}
export type Context = inferAsyncReturnType<
  inferAsyncReturnType<typeof createContext>
> & {
  account: {
    id: string
    roles?: string[]
  } | null
}
export type AppRouter = ReturnType<typeof createRouter>

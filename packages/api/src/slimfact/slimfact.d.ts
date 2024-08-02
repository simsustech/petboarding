import type { inferAsyncReturnType } from '@trpc/server'
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'
import type { FastifyInstance } from 'fastify'
import { MODULARAPI_ACCOUNT_ROLES } from '../zod/account.js'
export declare const t: {
  _config: import('@trpc/server').RootConfig<{
    ctx: {
      account: {
        id: string
        roles?: string[]
      } | null
    }
    meta: object
    errorShape: import('@trpc/server').DefaultErrorShape
    transformer: import('@trpc/server').DefaultDataTransformer
  }>
  procedure: import('@trpc/server').ProcedureBuilder<{
    _config: import('@trpc/server').RootConfig<{
      ctx: {
        account: {
          id: string
          roles?: string[]
        } | null
      }
      meta: object
      errorShape: import('@trpc/server').DefaultErrorShape
      transformer: import('@trpc/server').DefaultDataTransformer
    }>
    _ctx_out: {
      account: {
        id: string
        roles?: string[]
      } | null
    }
    _input_in: typeof import('@trpc/server').unsetMarker
    _input_out: typeof import('@trpc/server').unsetMarker
    _output_in: typeof import('@trpc/server').unsetMarker
    _output_out: typeof import('@trpc/server').unsetMarker
    _meta: object
  }>
  middleware: <
    TNewParams extends import('@trpc/server').ProcedureParams<
      import('@trpc/server').AnyRootConfig,
      unknown,
      unknown,
      unknown,
      unknown,
      unknown,
      unknown
    >
  >(
    fn: import('@trpc/server').MiddlewareFunction<
      {
        _config: import('@trpc/server').RootConfig<{
          ctx: {
            account: {
              id: string
              roles?: string[]
            } | null
          }
          meta: object
          errorShape: import('@trpc/server').DefaultErrorShape
          transformer: import('@trpc/server').DefaultDataTransformer
        }>
        _ctx_out: {}
        _input_out: typeof import('@trpc/server').unsetMarker
        _input_in: unknown
        _output_in: unknown
        _output_out: unknown
        _meta: object
      },
      TNewParams
    >
  ) => import('@trpc/server').MiddlewareBuilder<
    {
      _config: import('@trpc/server').RootConfig<{
        ctx: {
          account: {
            id: string
            roles?: string[]
          } | null
        }
        meta: object
        errorShape: import('@trpc/server').DefaultErrorShape
        transformer: import('@trpc/server').DefaultDataTransformer
      }>
      _ctx_out: {}
      _input_out: typeof import('@trpc/server').unsetMarker
      _input_in: unknown
      _output_in: unknown
      _output_out: unknown
      _meta: object
    },
    TNewParams
  >
  router: <
    TProcRouterRecord extends import('@trpc/server').ProcedureRouterRecord
  >(
    procedures: TProcRouterRecord
  ) => import('@trpc/server').CreateRouterInner<
    import('@trpc/server').RootConfig<{
      ctx: {
        account: {
          id: string
          roles?: string[]
        } | null
      }
      meta: object
      errorShape: import('@trpc/server').DefaultErrorShape
      transformer: import('@trpc/server').DefaultDataTransformer
    }>,
    TProcRouterRecord
  >
  mergeRouters: typeof import('@trpc/server').mergeRouters
  createCallerFactory: <
    TRouter extends import('@trpc/server').Router<
      import('@trpc/server').AnyRouterDef<
        import('@trpc/server').RootConfig<{
          ctx: {
            account: {
              id: string
              roles?: string[]
            } | null
          }
          meta: object
          errorShape: import('@trpc/server').DefaultErrorShape
          transformer: import('@trpc/server').DefaultDataTransformer
        }>,
        any
      >
    >
  >(
    router: TRouter
  ) => import('@trpc/server').RouterCaller<TRouter['_def']>
}
export declare const userProcedure: import('@trpc/server').ProcedureBuilder<{
  _config: import('@trpc/server').RootConfig<{
    ctx: {
      account: {
        id: string
        roles?: string[]
      } | null
    }
    meta: object
    errorShape: import('@trpc/server').DefaultErrorShape
    transformer: import('@trpc/server').DefaultDataTransformer
  }>
  _meta: object
  _ctx_out: {
    account: {
      id: string
      roles?: string[] | undefined
    } | null
  }
  _input_in: typeof import('@trpc/server').unsetMarker
  _input_out: typeof import('@trpc/server').unsetMarker
  _output_in: typeof import('@trpc/server').unsetMarker
  _output_out: typeof import('@trpc/server').unsetMarker
}>
export declare const adminProcedure: import('@trpc/server').ProcedureBuilder<{
  _config: import('@trpc/server').RootConfig<{
    ctx: {
      account: {
        id: string
        roles?: string[]
      } | null
    }
    meta: object
    errorShape: import('@trpc/server').DefaultErrorShape
    transformer: import('@trpc/server').DefaultDataTransformer
  }>
  _meta: object
  _ctx_out: {
    account: {
      id: string
      roles?: string[] | undefined
    } | null
  }
  _input_in: typeof import('@trpc/server').unsetMarker
  _input_out: typeof import('@trpc/server').unsetMarker
  _output_in: typeof import('@trpc/server').unsetMarker
  _output_out: typeof import('@trpc/server').unsetMarker
}>
export declare const employeeProcedure: import('@trpc/server').ProcedureBuilder<{
  _config: import('@trpc/server').RootConfig<{
    ctx: {
      account: {
        id: string
        roles?: string[]
      } | null
    }
    meta: object
    errorShape: import('@trpc/server').DefaultErrorShape
    transformer: import('@trpc/server').DefaultDataTransformer
  }>
  _meta: object
  _ctx_out: {
    account: {
      id: string
      roles?: string[] | undefined
    } | null
  }
  _input_in: typeof import('@trpc/server').unsetMarker
  _input_out: typeof import('@trpc/server').unsetMarker
  _output_in: typeof import('@trpc/server').unsetMarker
  _output_out: typeof import('@trpc/server').unsetMarker
}>
export declare const createRouter: (
  fastify: FastifyInstance
) => import('@trpc/server').CreateRouterInner<
  import('@trpc/server').RootConfig<{
    ctx: object
    meta: object
    errorShape: import('@trpc/server').DefaultErrorShape
    transformer: import('@trpc/server').DefaultDataTransformer
  }>,
  {
    user: import('@trpc/server').CreateRouterInner<
      import('@trpc/server').RootConfig<{
        ctx: {
          account: {
            id: string
            roles?: string[]
          } | null
        }
        meta: object
        errorShape: import('@trpc/server').DefaultErrorShape
        transformer: import('@trpc/server').DefaultDataTransformer
      }>,
      {
        getInvoices: import('@trpc/server').BuildProcedure<
          'query',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: typeof import('@trpc/server').unsetMarker
            _input_out: typeof import('@trpc/server').unsetMarker
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
            _meta: object
          },
          import('@modular-api/fastify-checkout').Invoice[]
        >
        getReceipts: import('@trpc/server').BuildProcedure<
          'query',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: typeof import('@trpc/server').unsetMarker
            _input_out: typeof import('@trpc/server').unsetMarker
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
            _meta: object
          },
          import('@modular-api/fastify-checkout').Invoice[]
        >
        getBills: import('@trpc/server').BuildProcedure<
          'query',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: typeof import('@trpc/server').unsetMarker
            _input_out: typeof import('@trpc/server').unsetMarker
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
            _meta: object
          },
          import('@modular-api/fastify-checkout').Invoice[]
        >
      }
    >
    admin: import('@trpc/server').CreateRouterInner<
      import('@trpc/server').RootConfig<{
        ctx: {
          account: {
            id: string
            roles?: string[]
          } | null
        }
        meta: object
        errorShape: import('@trpc/server').DefaultErrorShape
        transformer: import('@trpc/server').DefaultDataTransformer
      }>,
      {
        healthcheck: import('@trpc/server').BuildProcedure<
          'query',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: typeof import('@trpc/server').unsetMarker
            _input_out: typeof import('@trpc/server').unsetMarker
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
            _meta: object
          },
          boolean
        >
        createSubscription: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
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
                    iban: string
                    postalCode: string
                    prefix: string
                    vatIdNumber: string
                    id?: number | undefined
                    contactPersonName?: string | null | undefined
                    emailBcc?: string | null | undefined
                    logoSvg?: string | null | undefined
                    telephoneNumber?: string | null | undefined
                    website?: string | null | undefined
                    defaultNumberPrefixTemplate?: string | null | undefined
                    defaultLocale?: string | null | undefined
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
                    contactPersonName?: string | undefined
                    country?: string | undefined
                    companyName?: string | undefined
                    accountId?: number | null | undefined
                  }
                | undefined
            }
            _input_out: {
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
                    iban: string
                    postalCode: string
                    prefix: string
                    vatIdNumber: string
                    id?: number | undefined
                    contactPersonName?: string | null | undefined
                    emailBcc?: string | null | undefined
                    logoSvg?: string | null | undefined
                    telephoneNumber?: string | null | undefined
                    website?: string | null | undefined
                    defaultNumberPrefixTemplate?: string | null | undefined
                    defaultLocale?: string | null | undefined
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
                    contactPersonName?: string | undefined
                    country?: string | undefined
                    companyName?: string | undefined
                    accountId?: number | null | undefined
                  }
                | undefined
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          {
            id: any
            uuid: any
            name: string | null
            active: boolean | undefined
            companyId: number
            clientId: number
            numberPrefixTemplate: string
            locale: string
            currency: 'EUR' | 'USD'
            lines: any
            discounts: any
            surcharges: any
            paymentTermDays: number
            startDate: string
            endDate: string | null
            cronSchedule: string
            type: 'invoice' | 'bill'
            createdAt: any
          }
        >
        updateSubscription: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
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
                    iban: string
                    postalCode: string
                    prefix: string
                    vatIdNumber: string
                    id?: number | undefined
                    contactPersonName?: string | null | undefined
                    emailBcc?: string | null | undefined
                    logoSvg?: string | null | undefined
                    telephoneNumber?: string | null | undefined
                    website?: string | null | undefined
                    defaultNumberPrefixTemplate?: string | null | undefined
                    defaultLocale?: string | null | undefined
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
                    contactPersonName?: string | undefined
                    country?: string | undefined
                    companyName?: string | undefined
                    accountId?: number | null | undefined
                  }
                | undefined
            }
            _input_out: {
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
                    iban: string
                    postalCode: string
                    prefix: string
                    vatIdNumber: string
                    id?: number | undefined
                    contactPersonName?: string | null | undefined
                    emailBcc?: string | null | undefined
                    logoSvg?: string | null | undefined
                    telephoneNumber?: string | null | undefined
                    website?: string | null | undefined
                    defaultNumberPrefixTemplate?: string | null | undefined
                    defaultLocale?: string | null | undefined
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
                    contactPersonName?: string | undefined
                    country?: string | undefined
                    companyName?: string | undefined
                    accountId?: number | null | undefined
                  }
                | undefined
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          import('kysely').UpdateResult
        >
        startSubscription: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              id: number
            }
            _input_out: {
              id: number
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          void
        >
        stopSubscription: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              id: number
            }
            _input_out: {
              id: number
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          import('kysely').UpdateResult
        >
        getSubscriptions: import('@trpc/server').BuildProcedure<
          'query',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in:
              | {
                  active?: boolean | undefined
                  companyId?: number | null | undefined
                  clientId?: number | null | undefined
                }
              | undefined
            _input_out:
              | {
                  active?: boolean | undefined
                  companyId?: number | null | undefined
                  clientId?: number | null | undefined
                }
              | undefined
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          {
            [x: string]: any
            id: any
            uuid: any
            name: string | null
            active: boolean | undefined
            companyId: number
            clientId: number
            numberPrefixTemplate: string
            locale: string
            currency: 'EUR' | 'USD'
            lines: any
            discounts: any
            surcharges: any
            paymentTermDays: number
            startDate: string
            endDate: string | null
            cronSchedule: string
            type: 'invoice' | 'bill'
            createdAt: any
            client: {
              contactPersonName: import('node_modules/kysely/dist/esm/util/type-utils.js').ExtractColumnType<
                import('../kysely/index.js').Database,
                'subscriptions' | 'clients',
                'contactPersonName'
              >
              companyName: import('node_modules/kysely/dist/esm/util/type-utils.js').ExtractColumnType<
                import('../kysely/index.js').Database,
                'subscriptions' | 'clients',
                'companyName'
              >
            } | null
            company: {
              name: import('node_modules/kysely/dist/esm/util/type-utils.js').ExtractColumnType<
                import('../kysely/index.js').Database,
                'subscriptions' | 'companies',
                'name'
              >
            } | null
          }[]
        >
        createInitialNumberForPrefix: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              companyId: number
              numberPrefix: string
              initialNumber: number
              id?: number | undefined
            }
            _input_out: {
              companyId: number
              numberPrefix: string
              initialNumber: number
              id?: number | undefined
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          {
            id: any
            companyId: number
            numberPrefix: string
            initialNumber: number
          }
        >
        getInitialNumberForPrefixes: import('@trpc/server').BuildProcedure<
          'query',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: typeof import('@trpc/server').unsetMarker
            _input_out: typeof import('@trpc/server').unsetMarker
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
            _meta: object
          },
          {
            id: any
            companyId: number
            numberPrefix: string
            initialNumber: number
            company: {
              name: string
            } | null
          }[]
        >
        updateInitialNumberForPrefix: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              companyId: number
              numberPrefix: string
              initialNumber: number
              id?: number | undefined
            }
            _input_out: {
              companyId: number
              numberPrefix: string
              initialNumber: number
              id?: number | undefined
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          import('kysely').UpdateResult
        >
        createNumberPrefix: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              name: string
              template: string
              id?: number | undefined
            }
            _input_out: {
              name: string
              template: string
              id?: number | undefined
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          {
            id: any
            name: string
            template: string
          }
        >
        getNumberPrefixes: import('@trpc/server').BuildProcedure<
          'query',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: typeof import('@trpc/server').unsetMarker
            _input_out: typeof import('@trpc/server').unsetMarker
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
            _meta: object
          },
          {
            id: any
            name: string
            template: string
          }[]
        >
        updateNumberPrefix: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              name: string
              template: string
              id?: number | undefined
            }
            _input_out: {
              name: string
              template: string
              id?: number | undefined
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          import('kysely').UpdateResult
        >
        createClient: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              address: string
              city: string
              email: string
              postalCode: string
              number?: string | null | undefined
              id?: number | undefined
              contactPersonName?: string | undefined
              country?: string | undefined
              companyName?: string | undefined
              accountId?: number | null | undefined
            }
            _input_out: {
              address: string
              city: string
              email: string
              postalCode: string
              number?: string | null | undefined
              id?: number | undefined
              contactPersonName?: string | undefined
              country?: string | undefined
              companyName?: string | undefined
              accountId?: number | null | undefined
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          {
            number: string | null
            id: any
            createdAt: any
            address: string
            city: string
            contactPersonName: string | null
            country: string
            email: string
            postalCode: string
            companyName: string | null
            accountId: number | null
          }
        >
        getClients: import('@trpc/server').BuildProcedure<
          'query',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: typeof import('@trpc/server').unsetMarker
            _input_out: typeof import('@trpc/server').unsetMarker
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
            _meta: object
          },
          {
            number: string | null
            id: any
            createdAt: any
            address: string
            city: string
            contactPersonName: string | null
            country: string
            email: string
            postalCode: string
            companyName: string | null
            accountId: number | null
          }[]
        >
        updateClient: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              address: string
              city: string
              email: string
              postalCode: string
              number?: string | null | undefined
              id?: number | undefined
              contactPersonName?: string | undefined
              country?: string | undefined
              companyName?: string | undefined
              accountId?: number | null | undefined
            }
            _input_out: {
              address: string
              city: string
              email: string
              postalCode: string
              number?: string | null | undefined
              id?: number | undefined
              contactPersonName?: string | undefined
              country?: string | undefined
              companyName?: string | undefined
              accountId?: number | null | undefined
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          import('kysely').UpdateResult
        >
        searchClients: import('@trpc/server').BuildProcedure<
          'query',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              name: string
            }
            _input_out: {
              name: string
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          {
            number: string | null
            id: any
            createdAt: any
            address: string
            city: string
            contactPersonName: string | null
            country: string
            email: string
            postalCode: string
            companyName: string | null
            accountId: number | null
          }[]
        >
        createCompany: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              name: string
              address: string
              bic: string
              city: string
              cocNumber: string
              country: string
              email: string
              iban: string
              postalCode: string
              prefix: string
              vatIdNumber: string
              id?: number | undefined
              contactPersonName?: string | null | undefined
              emailBcc?: string | null | undefined
              logoSvg?: string | null | undefined
              telephoneNumber?: string | null | undefined
              website?: string | null | undefined
              defaultNumberPrefixTemplate?: string | null | undefined
              defaultLocale?: string | null | undefined
            }
            _input_out: {
              name: string
              address: string
              bic: string
              city: string
              cocNumber: string
              country: string
              email: string
              iban: string
              postalCode: string
              prefix: string
              vatIdNumber: string
              id?: number | undefined
              contactPersonName?: string | null | undefined
              emailBcc?: string | null | undefined
              logoSvg?: string | null | undefined
              telephoneNumber?: string | null | undefined
              website?: string | null | undefined
              defaultNumberPrefixTemplate?: string | null | undefined
              defaultLocale?: string | null | undefined
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          {
            id: any
            name: string
            createdAt: any
            address: string
            bic: string
            city: string
            cocNumber: string
            contactPersonName: string | null | undefined
            country: string
            email: string
            emailBcc: string | null | undefined
            iban: string
            logoSvg: string | null | undefined
            postalCode: string
            prefix: string
            telephoneNumber: string | null | undefined
            vatIdNumber: string
            website: string | null | undefined
            defaultNumberPrefixTemplate: string | null | undefined
            defaultLocale: string | null | undefined
          }
        >
        getCompanies: import('@trpc/server').BuildProcedure<
          'query',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: typeof import('@trpc/server').unsetMarker
            _input_out: typeof import('@trpc/server').unsetMarker
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
            _meta: object
          },
          {
            [x: string]: any
            id: any
            name: string
            createdAt: any
            address: string
            bic: string
            city: string
            cocNumber: string
            contactPersonName: string | null | undefined
            country: string
            email: string
            emailBcc: string | null | undefined
            iban: string
            logoSvg: string | null | undefined
            postalCode: string
            prefix: string
            telephoneNumber: string | null | undefined
            vatIdNumber: string
            website: string | null | undefined
            defaultNumberPrefixTemplate: string | null | undefined
            defaultLocale: string | null | undefined
          }[]
        >
        getCompany: import('@trpc/server').BuildProcedure<
          'query',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              id: number
            }
            _input_out: {
              id: number
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          {
            [x: string]: any
            id: any
            name: string
            createdAt: any
            address: string
            bic: string
            city: string
            cocNumber: string
            contactPersonName: string | null | undefined
            country: string
            email: string
            emailBcc: string | null | undefined
            iban: string
            logoSvg: string | null | undefined
            postalCode: string
            prefix: string
            telephoneNumber: string | null | undefined
            vatIdNumber: string
            website: string | null | undefined
            defaultNumberPrefixTemplate: string | null | undefined
            defaultLocale: string | null | undefined
          }
        >
        updateCompany: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              name: string
              address: string
              bic: string
              city: string
              cocNumber: string
              country: string
              email: string
              iban: string
              postalCode: string
              prefix: string
              vatIdNumber: string
              id?: number | undefined
              contactPersonName?: string | null | undefined
              emailBcc?: string | null | undefined
              logoSvg?: string | null | undefined
              telephoneNumber?: string | null | undefined
              website?: string | null | undefined
              defaultNumberPrefixTemplate?: string | null | undefined
              defaultLocale?: string | null | undefined
            }
            _input_out: {
              name: string
              address: string
              bic: string
              city: string
              cocNumber: string
              country: string
              email: string
              iban: string
              postalCode: string
              prefix: string
              vatIdNumber: string
              id?: number | undefined
              contactPersonName?: string | null | undefined
              emailBcc?: string | null | undefined
              logoSvg?: string | null | undefined
              telephoneNumber?: string | null | undefined
              website?: string | null | undefined
              defaultNumberPrefixTemplate?: string | null | undefined
              defaultLocale?: string | null | undefined
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          import('kysely').UpdateResult
        >
        searchCompanies: import('@trpc/server').BuildProcedure<
          'query',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: string
            _input_out: string
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          {
            [x: string]: any
            id: any
            name: string
            createdAt: any
            address: string
            bic: string
            city: string
            cocNumber: string
            contactPersonName: string | null | undefined
            country: string
            email: string
            emailBcc: string | null | undefined
            iban: string
            logoSvg: string | null | undefined
            postalCode: string
            prefix: string
            telephoneNumber: string | null | undefined
            vatIdNumber: string
            website: string | null | undefined
            defaultNumberPrefixTemplate: string | null | undefined
            defaultLocale: string | null | undefined
          }[]
        >
        createInvoice: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
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
              }[]
              paymentTermDays: number
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
                    iban: string
                    postalCode: string
                    prefix: string
                    vatIdNumber: string
                    id?: number | undefined
                    contactPersonName?: string | null | undefined
                    emailBcc?: string | null | undefined
                    logoSvg?: string | null | undefined
                    telephoneNumber?: string | null | undefined
                    website?: string | null | undefined
                    defaultNumberPrefixTemplate?: string | null | undefined
                    defaultLocale?: string | null | undefined
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
                    contactPersonName?: string | undefined
                    country?: string | undefined
                    companyName?: string | undefined
                    accountId?: number | null | undefined
                  }
                | undefined
              projectId?: string | null | undefined
              notes?: string | null | undefined
              status?:
                | import('@modular-api/fastify-checkout').InvoiceStatus
                | undefined
              paymentId?: number | null | undefined
            }
            _input_out: {
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
              }[]
              paymentTermDays: number
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
                    iban: string
                    postalCode: string
                    prefix: string
                    vatIdNumber: string
                    id?: number | undefined
                    contactPersonName?: string | null | undefined
                    emailBcc?: string | null | undefined
                    logoSvg?: string | null | undefined
                    telephoneNumber?: string | null | undefined
                    website?: string | null | undefined
                    defaultNumberPrefixTemplate?: string | null | undefined
                    defaultLocale?: string | null | undefined
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
                    contactPersonName?: string | undefined
                    country?: string | undefined
                    companyName?: string | undefined
                    accountId?: number | null | undefined
                  }
                | undefined
              projectId?: string | null | undefined
              notes?: string | null | undefined
              status?:
                | import('@modular-api/fastify-checkout').InvoiceStatus
                | undefined
              paymentId?: number | null | undefined
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          import('@modular-api/fastify-checkout').Invoice
        >
        updateInvoice: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
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
              }[]
              paymentTermDays: number
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
                    iban: string
                    postalCode: string
                    prefix: string
                    vatIdNumber: string
                    id?: number | undefined
                    contactPersonName?: string | null | undefined
                    emailBcc?: string | null | undefined
                    logoSvg?: string | null | undefined
                    telephoneNumber?: string | null | undefined
                    website?: string | null | undefined
                    defaultNumberPrefixTemplate?: string | null | undefined
                    defaultLocale?: string | null | undefined
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
                    contactPersonName?: string | undefined
                    country?: string | undefined
                    companyName?: string | undefined
                    accountId?: number | null | undefined
                  }
                | undefined
              projectId?: string | null | undefined
              notes?: string | null | undefined
              status?:
                | import('@modular-api/fastify-checkout').InvoiceStatus
                | undefined
              paymentId?: number | null | undefined
            }
            _input_out: {
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
              }[]
              paymentTermDays: number
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
                    iban: string
                    postalCode: string
                    prefix: string
                    vatIdNumber: string
                    id?: number | undefined
                    contactPersonName?: string | null | undefined
                    emailBcc?: string | null | undefined
                    logoSvg?: string | null | undefined
                    telephoneNumber?: string | null | undefined
                    website?: string | null | undefined
                    defaultNumberPrefixTemplate?: string | null | undefined
                    defaultLocale?: string | null | undefined
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
                    contactPersonName?: string | undefined
                    country?: string | undefined
                    companyName?: string | undefined
                    accountId?: number | null | undefined
                  }
                | undefined
              projectId?: string | null | undefined
              notes?: string | null | undefined
              status?:
                | import('@modular-api/fastify-checkout').InvoiceStatus
                | undefined
              paymentId?: number | null | undefined
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          import('@modular-api/fastify-checkout').Invoice
        >
        getInvoices: import('@trpc/server').BuildProcedure<
          'query',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in:
              | {
                  status:
                    | import('@modular-api/fastify-checkout').InvoiceStatus
                    | null
                  companyId?: number | null | undefined
                  clientId?: number | null | undefined
                }
              | undefined
            _input_out:
              | {
                  status:
                    | import('@modular-api/fastify-checkout').InvoiceStatus
                    | null
                  companyId?: number | null | undefined
                  clientId?: number | null | undefined
                }
              | undefined
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          import('@modular-api/fastify-checkout').Invoice[] | undefined
        >
        getInvoice: import('@trpc/server').BuildProcedure<
          'query',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              id?: number | undefined
              uuid?: string | undefined
            }
            _input_out: {
              id?: number | undefined
              uuid?: string | undefined
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          import('@modular-api/fastify-checkout').Invoice | null
        >
        sendInvoice: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              id: number
              emailSubject: string
              emailBody: string
            }
            _input_out: {
              id: number
              emailSubject: string
              emailBody: string
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          boolean | undefined
        >
        remindInvoice: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              id: number
              emailSubject: string
              emailBody: string
            }
            _input_out: {
              id: number
              emailSubject: string
              emailBody: string
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          boolean | undefined
        >
        exhortInvoice: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              id: number
              emailSubject: string
              emailBody: string
            }
            _input_out: {
              id: number
              emailSubject: string
              emailBody: string
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          boolean | undefined
        >
        sendBill: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              id: number
              emailSubject: string
              emailBody: string
            }
            _input_out: {
              id: number
              emailSubject: string
              emailBody: string
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          true | undefined
        >
        sendReceipt: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              id: number
              emailSubject: string
              emailBody: string
            }
            _input_out: {
              id: number
              emailSubject: string
              emailBody: string
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          true | undefined
        >
        getInvoiceEmail: import('@trpc/server').BuildProcedure<
          'query',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              id: number
              type:
                | 'sendInvoice'
                | 'remindInvoice'
                | 'exhortInvoice'
                | 'sendBill'
                | 'sendReceipt'
            }
            _input_out: {
              id: number
              type:
                | 'sendInvoice'
                | 'remindInvoice'
                | 'exhortInvoice'
                | 'sendBill'
                | 'sendReceipt'
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          {
            subject: string
            body: string
          }
        >
        cancelInvoice: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              id: number
            }
            _input_out: {
              id: number
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          true | undefined
        >
        addPaymentToInvoice: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              id: number
              payment: {
                currency: 'EUR' | 'USD'
                amount: number
                method: import('@modular-api/fastify-checkout').PaymentMethod
                description?: string | undefined
              }
            }
            _input_out: {
              id: number
              payment: {
                currency: 'EUR' | 'USD'
                amount: number
                method: import('@modular-api/fastify-checkout').PaymentMethod
                description?: string | undefined
              }
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          {
            checkoutUrl: string | null | undefined
            payment: {
              id: number
              uuid: string | null
              currency: 'EUR' | 'USD'
              createdAt: string
              description: string
              status: import('@modular-api/fastify-checkout').PaymentStatus
              metadata: Record<string, unknown> | null
              amount: number
              method: import('@modular-api/fastify-checkout').PaymentMethod
              orderId: number | null
              invoiceId: number | null
              paymentServiceProvider: 'mollie' | null
              externalId: string | null
              transactionReference: string | null
              paidAt: string | null
              details:
                | import('node_modules/@modular-api/fastify-checkout/dist/types/kysely/types/Payment.js').PaymentDetails
                | null
            }
          }
        >
        setInvoiceStatus: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              id: number
              status: import('@modular-api/fastify-checkout').InvoiceStatus
            }
            _input_out: {
              id: number
              status: import('@modular-api/fastify-checkout').InvoiceStatus
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          void
        >
        getAccount: import('@trpc/server').BuildProcedure<
          'query',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              id: number
            }
            _input_out: {
              id: number
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
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
        >
        getAccounts: import('@trpc/server').BuildProcedure<
          'query',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              criteria?:
                | {
                    name?: string | undefined
                    email?: string | undefined
                    roles?: MODULARAPI_ACCOUNT_ROLES[] | undefined
                  }
                | undefined
              pagination?:
                | {
                    sortBy: 'id' | 'name' | 'email' | null
                    descending: boolean
                    limit: number
                    offset: number
                  }
                | undefined
            }
            _input_out: {
              criteria?:
                | {
                    name?: string | undefined
                    email?: string | undefined
                    roles?: MODULARAPI_ACCOUNT_ROLES[] | undefined
                  }
                | undefined
              pagination?:
                | {
                    sortBy: 'id' | 'name' | 'email' | null
                    descending: boolean
                    limit: number
                    offset: number
                  }
                | undefined
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          {
            id: number
            uuid: string | null
            name: string | null
            createdAt: string
            email: string
            verified: boolean
            customFields: Record<string, unknown> | null
            roles: string[] | null
          }[]
        >
        getAccountsCount: import('@trpc/server').BuildProcedure<
          'query',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in:
              | {
                  criteria?:
                    | {
                        name?: string | undefined
                        email?: string | undefined
                        roles?: MODULARAPI_ACCOUNT_ROLES[] | undefined
                      }
                    | undefined
                }
              | undefined
            _input_out:
              | {
                  criteria?:
                    | {
                        name?: string | undefined
                        email?: string | undefined
                        roles?: MODULARAPI_ACCOUNT_ROLES[] | undefined
                      }
                    | undefined
                }
              | undefined
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          number
        >
        findAccounts: import('@trpc/server').BuildProcedure<
          'query',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              email?: string | undefined
              ids?: number[] | undefined
              searchPhrase?: string | undefined
            }
            _input_out: {
              email?: string | undefined
              ids?: number[] | undefined
              searchPhrase?: string | undefined
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          {
            id: number
            uuid: string | null
            name: string | null
            createdAt: string
            email: string
            verified: boolean
            customFields: Record<string, unknown> | null
            roles: string[] | null
          }[]
        >
        addRole: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              id: number
              role: MODULARAPI_ACCOUNT_ROLES
            }
            _input_out: {
              id: number
              role: MODULARAPI_ACCOUNT_ROLES
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          boolean
        >
        removeRole: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              id: number
              role: MODULARAPI_ACCOUNT_ROLES
            }
            _input_out: {
              id: number
              role: MODULARAPI_ACCOUNT_ROLES
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          boolean
        >
      }
    >
    public: import('@trpc/server').CreateRouterInner<
      import('@trpc/server').RootConfig<{
        ctx: {
          account: {
            id: string
            roles?: string[]
          } | null
        }
        meta: object
        errorShape: import('@trpc/server').DefaultErrorShape
        transformer: import('@trpc/server').DefaultDataTransformer
      }>,
      {
        getInvoice: import('@trpc/server').BuildProcedure<
          'query',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              uuid: string
            }
            _input_out: {
              uuid: string
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          import('@modular-api/fastify-checkout').Invoice | null
        >
        payWithIdeal: import('@trpc/server').BuildProcedure<
          'mutation',
          {
            _config: import('@trpc/server').RootConfig<{
              ctx: {
                account: {
                  id: string
                  roles?: string[]
                } | null
              }
              meta: object
              errorShape: import('@trpc/server').DefaultErrorShape
              transformer: import('@trpc/server').DefaultDataTransformer
            }>
            _meta: object
            _ctx_out: {
              account: {
                id: string
                roles?: string[]
              } | null
            }
            _input_in: {
              uuid: string
            }
            _input_out: {
              uuid: string
            }
            _output_in: typeof import('@trpc/server').unsetMarker
            _output_out: typeof import('@trpc/server').unsetMarker
          },
          string | null | undefined
        >
      }
    >
  }
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
